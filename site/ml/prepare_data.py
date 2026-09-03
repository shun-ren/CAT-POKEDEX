"""Create leakage-safe breed and coat splits from the downloaded Petfinder dataset.

Files are hard-linked when possible, so preparing the dataset normally consumes
almost no additional disk space. Images from the same Petfinder animal ID stay
in one split.
"""
import argparse
import hashlib
import json
import os
import random
import shutil
from collections import defaultdict
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None


COAT_CLASSES = {
    'Calico': 'Calico',
    'Dilute Calico': 'Dilute calico',
    'Dilute Tortoiseshell': 'Dilute tortoiseshell',
    'Silver': 'Silver',
    'Tabby': 'Tabby',
    'Tiger': 'Tiger tabby',
    'Torbie': 'Torbie',
    'Tortoiseshell': 'Tortoiseshell',
    'Tuxedo': 'Black tuxedo',
}

BREED_ALIASES = {
    'Applehead Siamese': 'Siamese',
    'Canadian Hairless': 'Sphynx',
    'Sphynx - Hairless Cat': 'Sphynx',
}

# These folder names describe a trait or colour, not a breed.
EXCLUDED_FROM_BREEDS = set(COAT_CLASSES) | {
    'Chinchilla',
    'Extra-Toes Cat - Hemingway Polydactyl',
    'Oriental Tabby',
}

IMAGE_SUFFIXES = {'.jpg', '.jpeg', '.png', '.webp'}
SPLITS = (('train', 0.70), ('val', 0.15), ('test', 0.15))


def animal_id(path):
    """The filename prefix is the Petfinder animal ID shared by related photos."""
    return path.stem.split('_', 1)[0]


def valid_image(path):
    if Image is None:
        raise RuntimeError('Pillow is required for image validation; install requirements or pass --skip-image-validation')
    try:
        with Image.open(path) as image:
            image.verify()
        return True
    except (OSError, ValueError):
        return False


def deterministic_groups(groups, seed, label):
    rows = sorted(groups.items())
    label_seed = int(hashlib.sha256(f'{seed}:{label}'.encode()).hexdigest()[:16], 16)
    random.Random(label_seed).shuffle(rows)
    return rows


def capped_groups(groups, max_images):
    selected, total = [], 0
    for key, paths in groups:
        if selected and total + len(paths) > max_images:
            continue
        selected.append((key, paths)); total += len(paths)
        if total >= max_images:
            break
    return selected


def split_groups(groups):
    count = len(groups)
    train_end = max(1, round(count * SPLITS[0][1]))
    val_end = min(count, train_end + max(1, round(count * SPLITS[1][1])))
    return {'train': groups[:train_end], 'val': groups[train_end:val_end], 'test': groups[val_end:]}


def link_or_copy(source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.link(source, destination)
        return 'hardlink'
    except OSError:
        shutil.copy2(source, destination)
        return 'copy'


def collect(source, verify):
    breed_groups = defaultdict(lambda: defaultdict(list))
    coat_groups = defaultdict(lambda: defaultdict(list))
    rejected = []
    for class_dir in sorted(path for path in source.iterdir() if path.is_dir()):
        source_label = class_dir.name
        for image in class_dir.iterdir():
            if not image.is_file() or image.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            if verify and not valid_image(image):
                rejected.append(str(image)); continue
            group = animal_id(image)
            if source_label in COAT_CLASSES:
                coat_groups[COAT_CLASSES[source_label]][group].append(image)
            elif source_label not in EXCLUDED_FROM_BREEDS:
                breed_label = BREED_ALIASES.get(source_label, source_label)
                breed_groups[breed_label][group].append(image)
    return breed_groups, coat_groups, rejected


def materialise(task, groups_by_label, destination, minimum, maximum, seed):
    report = {}
    for label, raw_groups in sorted(groups_by_label.items()):
        image_count = sum(len(paths) for paths in raw_groups.values())
        if image_count < minimum:
            report[label] = {'status': 'excluded_too_small', 'available': image_count}
            continue
        ordered = deterministic_groups(raw_groups, seed, label)
        selected = capped_groups(ordered, maximum)
        partitions = split_groups(selected)
        split_counts = {}
        methods = defaultdict(int)
        for split, grouped_paths in partitions.items():
            split_counts[split] = sum(len(paths) for _, paths in grouped_paths)
            for _, paths in grouped_paths:
                for source in paths:
                    source_tag = source.parent.name.replace(' ', '_').replace('/', '_')
                    target = destination / task / split / label / f'{source_tag}__{source.name}'
                    if not target.exists():
                        methods[link_or_copy(source, target)] += 1
        report[label] = {
            'status': 'included', 'available': image_count,
            'selected': sum(split_counts.values()), 'splits': split_counts,
            'storage': dict(methods),
        }
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=Path('ml/data/original_dataset'))
    parser.add_argument('--destination', type=Path, default=Path('ml/data'))
    parser.add_argument('--min-images', type=int, default=100)
    parser.add_argument('--max-images', type=int, default=2500)
    parser.add_argument('--seed', type=int, default=20260903)
    parser.add_argument('--skip-image-validation', action='store_true')
    args = parser.parse_args()
    if not args.source.is_dir():
        raise SystemExit(f'Source dataset was not found: {args.source}')
    if Image is None and not args.skip_image_validation:
        raise SystemExit('Pillow is not installed. Install requirements or pass --skip-image-validation.')
    for task in ('breeds', 'coats'):
        target = args.destination / task
        if target.exists() and any(target.rglob('*')):
            raise SystemExit(f'{target} is not empty. Move it aside before preparing a new split.')
    breeds, coats, rejected = collect(args.source, not args.skip_image_validation)
    report = {
        'settings': vars(args) | {'source': str(args.source), 'destination': str(args.destination)},
        'breeds': materialise('breeds', breeds, args.destination, args.min_images, args.max_images, args.seed),
        'coats': materialise('coats', coats, args.destination, args.min_images, args.max_images, args.seed),
        'rejected_images': rejected,
    }
    report_path = args.destination / 'preparation-report.json'
    report_path.write_text(json.dumps(report, indent=2), encoding='utf-8')
    included_breeds = sum(row['status'] == 'included' for row in report['breeds'].values())
    included_coats = sum(row['status'] == 'included' for row in report['coats'].values())
    print(f'Prepared {included_breeds} breed/type labels and {included_coats} coat labels.')
    print(f'Rejected unreadable images: {len(rejected)}')
    print(f'Report: {report_path}')


if __name__ == '__main__':
    main()
