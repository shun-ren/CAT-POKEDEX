"""Evaluate a CATDEX checkpoint on the held-out test split."""
import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import torch
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


def evaluation_transform():
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([.485, .456, .406], [.229, .224, .225]),
    ])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=Path, default=Path('ml/data'))
    parser.add_argument('--checkpoint', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path('ml/output'))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    checkpoint = torch.load(args.checkpoint, map_location='cpu', weights_only=False)
    test = datasets.ImageFolder(args.data / 'test', transform=evaluation_transform())
    classes = checkpoint['classes']
    if test.classes != classes:
        raise SystemExit('test/ label directories do not match checkpoint labels')

    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, len(classes))
    model.load_state_dict(checkpoint['state_dict'])
    model.eval()

    truth, predicted = [], []
    with torch.no_grad():
        for images, targets in DataLoader(test, batch_size=32, num_workers=0):
            predicted.extend(model(images).argmax(1).tolist())
            truth.extend(targets.tolist())

    report = classification_report(
        truth,
        predicted,
        target_names=classes,
        output_dict=True,
        zero_division=0,
    )
    metrics = {
        'accuracy': accuracy_score(truth, predicted),
        'macro_f1': f1_score(truth, predicted, average='macro'),
        'per_label_recall': {name: report[name]['recall'] for name in classes},
    }
    (args.output / 'test-metrics.json').write_text(
        json.dumps(metrics, indent=2),
        encoding='utf-8',
    )

    matrix = confusion_matrix(truth, predicted)
    figure, axis = plt.subplots(figsize=(max(7, len(classes)), max(6, len(classes))))
    axis.imshow(matrix, cmap='YlGn')
    axis.set(
        xticks=range(len(classes)),
        yticks=range(len(classes)),
        xticklabels=classes,
        yticklabels=classes,
        xlabel='Predicted',
        ylabel='Actual',
    )
    plt.setp(axis.get_xticklabels(), rotation=45, ha='right')
    figure.tight_layout()
    figure.savefig(args.output / 'confusion-matrix.png', dpi=180)
    plt.close(figure)
    print(json.dumps(metrics, indent=2))


if __name__ == '__main__':
    main()
