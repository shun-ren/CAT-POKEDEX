"""Train a balanced ResNet18 classifier from data/{train,val,test}/<label>/ images."""
import argparse
import json
import random
import time
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


def loader(folder, transform, shuffle, batch_size, workers):
    dataset = datasets.ImageFolder(folder, transform=transform)
    data_loader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=workers,
        pin_memory=torch.cuda.is_available(),
    )
    return dataset, data_loader


def macro_recall(truth, predicted, class_count):
    recalls = []
    for label in range(class_count):
        positives = sum(target == label for target in truth)
        correct = sum(target == label and guess == label for target, guess in zip(truth, predicted))
        recalls.append(correct / positives if positives else 0.0)
    return sum(recalls) / max(len(recalls), 1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=Path, default=Path('ml/data'))
    parser.add_argument('--epochs', type=int, default=12)
    parser.add_argument('--output', type=Path, default=Path('ml/output'))
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument(
        '--workers',
        type=int,
        default=0,
        help='Use 0 on Windows for the most reliable local run',
    )
    parser.add_argument(
        '--fine-tune',
        action='store_true',
        help='Train the entire network; default trains only the final layer',
    )
    parser.add_argument('--seed', type=int, default=20260903)
    args = parser.parse_args()
    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    args.output.mkdir(parents=True, exist_ok=True)

    normalise = transforms.Normalize([.485, .456, .406], [.229, .224, .225])
    train_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        normalise,
    ])
    evaluation_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        normalise,
    ])
    train_set, train_loader = loader(
        args.data / 'train',
        train_transform,
        True,
        args.batch_size,
        args.workers,
    )
    val_set, val_loader = loader(
        args.data / 'val',
        evaluation_transform,
        False,
        args.batch_size,
        args.workers,
    )
    if train_set.classes != val_set.classes:
        raise SystemExit('train/ and val/ must contain the same label directories')

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    if not args.fine_tune:
        for parameter in model.parameters():
            parameter.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, len(train_set.classes))
    model.to(device)
    optimiser = torch.optim.AdamW(
        (parameter for parameter in model.parameters() if parameter.requires_grad),
        lr=2e-4 if args.fine_tune else 1e-3,
        weight_decay=1e-4,
    )
    counts = torch.bincount(torch.tensor(train_set.targets), minlength=len(train_set.classes)).float()
    class_weights = (counts.sum() / counts.clamp_min(1)).sqrt()
    class_weights /= class_weights.mean()
    loss_fn = nn.CrossEntropyLoss(weight=class_weights.to(device))
    best = -1.0
    mode = 'fine-tune' if args.fine_tune else 'linear-probe'
    print(
        f'device={device} classes={len(train_set.classes)} '
        f'train={len(train_set)} val={len(val_set)} mode={mode}',
        flush=True,
    )

    for epoch in range(1, args.epochs + 1):
        started = time.time()
        model.train()
        running_loss = 0.0
        for images, targets in train_loader:
            optimiser.zero_grad()
            loss = loss_fn(model(images.to(device)), targets.to(device))
            loss.backward()
            optimiser.step()
            running_loss += loss.item() * len(targets)

        model.eval()
        truth, predicted = [], []
        with torch.no_grad():
            for images, targets in val_loader:
                guesses = model(images.to(device)).argmax(1).cpu().tolist()
                predicted.extend(guesses)
                truth.extend(targets.tolist())
        accuracy = sum(a == b for a, b in zip(truth, predicted)) / max(len(truth), 1)
        score = macro_recall(truth, predicted, len(train_set.classes))
        mean_loss = running_loss / max(len(train_set), 1)
        elapsed = time.time() - started
        print(
            f'epoch {epoch}: loss={mean_loss:.4f} val_accuracy={accuracy:.3f} '
            f'val_macro_recall={score:.3f} seconds={elapsed:.1f}',
            flush=True,
        )
        if score > best:
            best = score
            torch.save(
                {
                    'state_dict': model.state_dict(),
                    'classes': train_set.classes,
                    'architecture': 'resnet18',
                },
                args.output / 'best.pt',
            )
            (args.output / 'labels.json').write_text(
                json.dumps(train_set.classes, indent=2),
                encoding='utf-8',
            )
    print(f'best validation macro recall: {best:.3f}', flush=True)


if __name__ == '__main__':
    main()
