"""Evaluate the trained CATDEX breed ResNet18 classifier on breeds/test only."""

import json
from datetime import datetime, timezone
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_recall_fscore_support, recall_score
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from tqdm import tqdm


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "breeds"
OUTPUT_DIR = BASE_DIR / "output" / "breed"
CHECKPOINT_PATH = OUTPUT_DIR / "best.pth"

BATCH_SIZE = 32
WORKERS = 2
TASK_NAME = "breed"


# ============================================================
# METRICS AND REPORTS
# ============================================================

def calculate_per_class_metrics(truth, predicted, classes):
    precision, recall, f1, support = precision_recall_fscore_support(
        truth, predicted, labels=range(len(classes)), zero_division=0
    )
    return {
        class_name: {"precision": float(p), "recall": float(r), "f1": float(score), "support": int(n)}
        for class_name, p, r, score, n in zip(classes, precision, recall, f1, support)
    }


def save_confusion_matrix(matrix, classes):
    figure, axis = plt.subplots(figsize=(max(10, len(classes) * 0.5), max(8, len(classes) * 0.5)))
    image = axis.imshow(matrix, cmap="Blues")
    figure.colorbar(image, ax=axis)
    axis.set_title("Breed test confusion matrix")
    axis.set_xlabel("Predicted label")
    axis.set_ylabel("True label")
    axis.set_xticks(range(len(classes)))
    axis.set_yticks(range(len(classes)))
    axis.set_xticklabels(classes, rotation=90, fontsize=7)
    axis.set_yticklabels(classes, fontsize=7)
    figure.tight_layout()
    figure.savefig(OUTPUT_DIR / "evaluation-confusion-matrix.png", dpi=180)
    plt.close(figure)


def update_model_comparison(results):
    """Keep one small chart comparing the selected breed and coat test checkpoints."""
    comparison_path = OUTPUT_DIR.parent / "model-comparison.json"
    rows = json.loads(comparison_path.read_text(encoding="utf-8")) if comparison_path.is_file() else []
    rows = [row for row in rows if row.get("task") != TASK_NAME]
    rows.append(results)
    comparison_path.write_text(json.dumps(rows, indent=2), encoding="utf-8")

    figure, axis = plt.subplots(figsize=(7, 4))
    metric_names = ["accuracy", "macro_f1", "macro_recall"]
    positions = np.arange(len(rows))
    for index, metric in enumerate(metric_names):
        axis.bar(positions + (index - 1) * 0.24, [row[metric] for row in rows], 0.24, label=metric.replace("_", " "))
    axis.set_xticks(positions)
    axis.set_xticklabels([row["task"] for row in rows])
    axis.set_ylim(0, 1)
    axis.set_ylabel("Score")
    axis.set_title("Current CATDEX test checkpoints")
    axis.legend()
    axis.grid(axis="y", alpha=0.25)
    figure.tight_layout()
    figure.savefig(OUTPUT_DIR.parent / "model-comparison.png", dpi=160)
    plt.close(figure)


# ============================================================
# MAIN
# ============================================================

def main():
    if not CHECKPOINT_PATH.is_file():
        raise SystemExit(f"Checkpoint not found: {CHECKPOINT_PATH}\nRun train_breed.py first.")
    test_folder = DATA_DIR / "test"
    if not test_folder.is_dir():
        raise SystemExit(f"Test folder not found: {test_folder}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint = torch.load(CHECKPOINT_PATH, map_location=device, weights_only=False)
    classes = checkpoint["classes"]

    normalise = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    evaluation_transform = transforms.Compose([
        transforms.Resize(256), transforms.CenterCrop(224), transforms.ToTensor(), normalise,
    ])
    test_set = datasets.ImageFolder(test_folder, transform=evaluation_transform)
    if test_set.classes != classes:
        raise SystemExit("Test breed class folders do not match the classes stored in the checkpoint.")
    test_loader = DataLoader(test_set, batch_size=BATCH_SIZE, shuffle=False, num_workers=WORKERS,
                             pin_memory=device.type == "cuda", persistent_workers=WORKERS > 0)

    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, len(classes))
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)
    model.eval()

    print(f"\nBREED EVALUATION | device={device} | checkpoint epoch={checkpoint.get('epoch')} | test images={len(test_set)}\n")
    truth = []
    predicted = []
    with torch.no_grad():
        for images, targets in tqdm(test_loader, desc="Evaluating breed", unit="batch", dynamic_ncols=True):
            logits = model(images.to(device, non_blocking=True))
            predicted.extend(logits.argmax(dim=1).cpu().tolist())
            truth.extend(targets.tolist())

    matrix = confusion_matrix(truth, predicted, labels=range(len(classes)))
    results = {
        "task": TASK_NAME,
        "architecture": "resnet18",
        "checkpoint": str(CHECKPOINT_PATH),
        "checkpoint_epoch": checkpoint.get("epoch"),
        "evaluated_at_utc": datetime.now(timezone.utc).isoformat(),
        "test_images": len(test_set),
        "accuracy": float(accuracy_score(truth, predicted)),
        "macro_f1": float(f1_score(truth, predicted, average="macro", zero_division=0)),
        "macro_recall": float(recall_score(truth, predicted, average="macro", zero_division=0)),
        "per_class": calculate_per_class_metrics(truth, predicted, classes),
        "confusion_matrix": matrix.tolist(),
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "evaluation-results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    save_confusion_matrix(matrix, classes)
    update_model_comparison(results)

    print(f"Accuracy: {results['accuracy']:.4f}")
    print(f"Macro F1: {results['macro_f1']:.4f}")
    print(f"Macro recall: {results['macro_recall']:.4f}")
    print(f"Results: {OUTPUT_DIR / 'evaluation-results.json'}")


if __name__ == "__main__":
    main()
