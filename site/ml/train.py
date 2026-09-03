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
    return dataset, DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, num_workers=workers, pin_memory=torch.cuda.is_available())


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
    parser.add_argument('--workers', type=int, default=0, help='Use 0 on Windows for the most reliable local run')
    parser.add_argument('--fine-tune', action='store_true', help='Train the entire network; default trains only the final layer')
    parser.add_argument('--seed', type=int, default=20260903)
    args = parser.parse_args()
    random.seed(args.seed); np.random.seed(args.seed); torch.manual_seed(args.seed)
    args.output.mkdir(parents=True, exist_ok=True)
    train_tf = transforms.Compose([transforms.Resize(256), transforms.RandomResizedCrop(224), transforms.RandomHorizontalFlip(), transforms.ToTensor(), transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
    eval_tf = transforms.Compose([transforms.Resize(256), transforms.CenterCrop(224), transforms.ToTensor(), transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
    train_set, train_loader = loader(args.data / 'train', train_tf, True, args.batch_size, args.workers)
    val_set, val_loader = loader(args.data / 'val', eval_tf, False, args.batch_size, args.workers)
    if train_set.classes != val_set.classes:
        raise SystemExit('train/ and val/ must contain the same breed directories')
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    weights = models.ResNet18_Weights.DEFAULT
    model = models.resnet18(weights=weights)
    if not args.fine_tune:
        for parameter in model.parameters():
            parameter.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, len(train_set.classes))
    model.to(device)
    optimiser = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=1e-3 if not args.fine_tune else 2e-4, weight_decay=1e-4)
    counts = torch.bincount(torch.tensor(train_set.targets), minlength=len(train_set.classes)).float()
    class_weights = (counts.sum() / counts.clamp_min(1)).sqrt()
    class_weights /= class_weights.mean()
    loss_fn = nn.CrossEntropyLoss(weight=class_weights.to(device))
    best = 0.0
    print(f'device={device} classes={len(train_set.classes)} train={len(train_set)} val={len(val_set)} mode={"fine-tune" if args.fine_tune else "linear-probe"}', flush=True)
    for epoch in range(1, args.epochs + 1):
        started = time.time(); model.train(); running_loss = 0.0
        for images, targets in train_loader:
            optimiser.zero_grad()
            loss = loss_fn(model(images.to(device)), targets.to(device))
            loss.backward(); optimiser.step()
            running_loss += loss.item() * len(targets)
        model.eval(); truth, predicted = [], []
        with torch.no_grad():
            for images, targets in val_loader:
                guesses = model(images.to(device)).argmax(1).cpu().tolist()
                predicted.extend(guesses); truth.extend(targets.tolist())
        accuracy = sum(a == b for a, b in zip(truth, predicted)) / max(len(truth), 1)
        score = macro_recall(truth, predicted, len(train_set.classes))
        print(f'epoch {epoch}: loss={running_loss/max(len(train_set),1):.4f} val_accuracy={accuracy:.3f} val_macro_recall={score:.3f} seconds={time.time()-started:.1f}', flush=True)
        if score > best:
            best = score
            torch.save({'state_dict': model.state_dict(), 'classes': train_set.classes, 'architecture': 'resnet18'}, args.output / 'best.pt')
            (args.output / 'labels.json').write_text(json.dumps(train_set.classes, indent=2), encoding='utf-8')
    print(f'best validation macro recall: {best:.3f}', flush=True)


if __name__ == '__main__':
    main()
