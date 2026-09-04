"""Train CATDEX's breed ResNet18 classifier using train/ and val/ only."""

import json
import random
import time
from datetime import datetime, timezone
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import f1_score, recall_score
from torch import nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from tqdm import tqdm


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "breeds"
OUTPUT_DIR = BASE_DIR / "output" / "breed"

EPOCHS = 14
WARMUP_EPOCHS = 3
BATCH_SIZE = 16
WORKERS = 2
SEED = 42

HEAD_LEARNING_RATE = 1e-3
FINE_TUNE_HEAD_LEARNING_RATE = 2e-4
BACKBONE_LEARNING_RATE = 2e-5
WEIGHT_DECAY = 1e-4
LABEL_SMOOTHING = 0.05
EARLY_STOPPING_PATIENCE = 5

TASK_NAME = "breed"
ARCHITECTURE = "resnet18"


# ============================================================
# DATA
# ============================================================

def create_loader(folder, transform, shuffle):
    """Load one ImageFolder split with the configured batch settings."""
    dataset = datasets.ImageFolder(folder, transform=transform)
    data_loader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=shuffle,
        num_workers=WORKERS,
        pin_memory=torch.cuda.is_available(),
        persistent_workers=WORKERS > 0,
    )
    return dataset, data_loader


def build_transforms():
    """Return train augmentation and deterministic validation preprocessing."""
    normalise = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    )
    train_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomResizedCrop(224, scale=(0.80, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15, hue=0.05),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        normalise,
    ])
    validation_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        normalise,
    ])
    return train_transform, validation_transform


# ============================================================
# METRICS AND ARTIFACTS
# ============================================================

def validate_model(model, val_loader, loss_fn, device, use_amp, epoch):
    """Evaluate on validation only. The held-out test split is never accessed."""
    model.eval()
    running_loss = 0.0
    truth = []
    predicted = []

    with torch.no_grad():
        progress = tqdm(val_loader, desc=f"Epoch {epoch}/{EPOCHS} [Validation]", unit="batch", dynamic_ncols=True)
        for images, targets in progress:
            images = images.to(device, non_blocking=True)
            targets = targets.to(device, non_blocking=True)
            with torch.amp.autocast(device_type=device.type, enabled=use_amp):
                logits = model(images)
                loss = loss_fn(logits, targets)
            running_loss += loss.item() * len(targets)
            truth.extend(targets.cpu().tolist())
            predicted.extend(logits.argmax(dim=1).cpu().tolist())
            progress.set_postfix(loss=f"{running_loss / max(len(truth), 1):.4f}")

    return {
        "val_loss": running_loss / max(len(truth), 1),
        "val_accuracy": float(np.mean(np.asarray(truth) == np.asarray(predicted))),
        "val_macro_recall": float(recall_score(truth, predicted, average="macro", zero_division=0)),
        "val_macro_f1": float(f1_score(truth, predicted, average="macro", zero_division=0)),
        "per_class_recall": recall_score(truth, predicted, average=None, zero_division=0).tolist(),
    }


def save_training_artifacts(run):
    """Save machine-readable history and a four-panel learning-curve graph."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "training-history.json").write_text(json.dumps(run, indent=2), encoding="utf-8")
    history = run["history"]
    if not history:
        return

    figure, axes = plt.subplots(2, 2, figsize=(12, 8), constrained_layout=True)
    series = [
        ("train_loss", "Training loss"),
        ("val_loss", "Validation loss"),
        ("val_accuracy", "Validation accuracy"),
        ("val_macro_recall", "Validation macro recall"),
    ]
    epochs = [row["epoch"] for row in history]
    for axis, (field, title) in zip(axes.flat, series):
        axis.plot(epochs, [row[field] for row in history], marker="o")
        axis.set_title(title)
        axis.set_xlabel("Epoch")
        axis.grid(alpha=0.25)
    figure.savefig(OUTPUT_DIR / "training-curves.png", dpi=180)
    plt.close(figure)


def checkpoint_payload(model, classes, epoch_metrics):
    """Store everything the evaluator and ONNX exporter need to reload the model."""
    return {
        "state_dict": model.state_dict(),
        "classes": classes,
        "architecture": ARCHITECTURE,
        "task": TASK_NAME,
        "epoch": epoch_metrics["epoch"],
        "metrics": epoch_metrics,
        "seed": SEED,
        "training_strategy": "3-epoch head warm-up, then full ResNet18 fine-tuning",
    }


# ============================================================
# TRAINING STAGES
# ============================================================

def freeze_batch_norm_statistics(model):
    """Prevent frozen ImageNet batch-normalisation statistics changing during warm-up."""
    for module in model.modules():
        if isinstance(module, nn.modules.batchnorm._BatchNorm):
            module.eval()


def configure_warmup(model):
    """Train only the new classifier head for the first three epochs."""
    for parameter in model.parameters():
        parameter.requires_grad = False
    for parameter in model.fc.parameters():
        parameter.requires_grad = True
    return AdamW(model.fc.parameters(), lr=HEAD_LEARNING_RATE, weight_decay=WEIGHT_DECAY), None


def configure_fine_tuning(model):
    """Unfreeze ResNet18 with a cautious backbone learning rate."""
    for parameter in model.parameters():
        parameter.requires_grad = True
    optimizer = AdamW([
        {"params": model.conv1.parameters(), "lr": BACKBONE_LEARNING_RATE},
        {"params": model.bn1.parameters(), "lr": BACKBONE_LEARNING_RATE},
        {"params": model.layer1.parameters(), "lr": BACKBONE_LEARNING_RATE},
        {"params": model.layer2.parameters(), "lr": BACKBONE_LEARNING_RATE},
        {"params": model.layer3.parameters(), "lr": BACKBONE_LEARNING_RATE},
        {"params": model.layer4.parameters(), "lr": BACKBONE_LEARNING_RATE},
        {"params": model.fc.parameters(), "lr": FINE_TUNE_HEAD_LEARNING_RATE},
    ], weight_decay=WEIGHT_DECAY)
    scheduler = CosineAnnealingLR(optimizer, T_max=EPOCHS - WARMUP_EPOCHS)
    return optimizer, scheduler


# ============================================================
# MAIN
# ============================================================

def main():
    random.seed(SEED)
    np.random.seed(SEED)
    torch.manual_seed(SEED)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(SEED)

    train_folder = DATA_DIR / "train"
    val_folder = DATA_DIR / "val"
    for folder in [train_folder, val_folder]:
        if not folder.is_dir():
            raise SystemExit(f"Missing dataset folder: {folder}")

    train_transform, validation_transform = build_transforms()
    train_set, train_loader = create_loader(train_folder, train_transform, shuffle=True)
    val_set, val_loader = create_loader(val_folder, validation_transform, shuffle=False)
    if train_set.classes != val_set.classes:
        raise SystemExit("train/ and val/ must contain identical breed class folders.")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    use_amp = device.type == "cuda"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "labels.json").write_text(json.dumps(train_set.classes, indent=2), encoding="utf-8")

    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, len(train_set.classes))
    model.to(device)

    counts = np.bincount(train_set.targets, minlength=len(train_set.classes)).astype(np.float32)
    weights = torch.tensor(counts.sum() / (len(counts) * np.maximum(counts, 1)), dtype=torch.float32).to(device)
    loss_fn = nn.CrossEntropyLoss(weight=weights, label_smoothing=LABEL_SMOOTHING)
    scaler = torch.amp.GradScaler("cuda", enabled=use_amp)

    run = {
        "task": TASK_NAME,
        "architecture": "ResNet18 ImageNet transfer learning",
        "seed": SEED,
        "device": str(device),
        "started_at_utc": datetime.now(timezone.utc).isoformat(),
        "training_strategy": "3 epochs head warm-up; epochs 4-14 full fine-tuning",
        "history": [],
        "best": None,
    }
    print(f"\nBREED TRAINING | device={device} | classes={len(train_set.classes)} | train={len(train_set)} | val={len(val_set)} | seed={SEED}\n")

    optimizer = scheduler = None
    active_stage = None
    best_score = -1.0
    stalled_epochs = 0

    for epoch in range(1, EPOCHS + 1):
        stage = "head-warmup" if epoch <= WARMUP_EPOCHS else "full-fine-tune"
        if stage != active_stage:
            active_stage = stage
            optimizer, scheduler = configure_warmup(model) if stage == "head-warmup" else configure_fine_tuning(model)
            print(f"Stage: {stage}")

        started = time.perf_counter()
        model.train()
        if stage == "head-warmup":
            freeze_batch_norm_statistics(model)
        running_loss = 0.0

        progress = tqdm(train_loader, desc=f"Epoch {epoch}/{EPOCHS} [Training]", unit="batch", dynamic_ncols=True)
        for images, targets in progress:
            images = images.to(device, non_blocking=True)
            targets = targets.to(device, non_blocking=True)
            optimizer.zero_grad(set_to_none=True)
            with torch.amp.autocast(device_type=device.type, enabled=use_amp):
                loss = loss_fn(model(images), targets)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            running_loss += loss.item() * len(targets)
            progress.set_postfix(loss=f"{running_loss / max(len(train_set), 1):.4f}")

        metrics = validate_model(model, val_loader, loss_fn, device, use_amp, epoch)
        metrics.update({
            "epoch": epoch,
            "stage": stage,
            "train_loss": running_loss / len(train_set),
            "seconds": round(time.perf_counter() - started, 1),
            "learning_rates": [group["lr"] for group in optimizer.param_groups],
        })
        if scheduler:
            scheduler.step()

        run["history"].append(metrics)
        torch.save(checkpoint_payload(model, train_set.classes, metrics), OUTPUT_DIR / "last.pth")
        if metrics["val_macro_recall"] > best_score + 0.001:
            best_score = metrics["val_macro_recall"]
            stalled_epochs = 0
            run["best"] = metrics
            torch.save(checkpoint_payload(model, train_set.classes, metrics), OUTPUT_DIR / "best.pth")
            print(f"New best model saved: macro recall={best_score:.4f}")
        elif stage == "full-fine-tune":
            stalled_epochs += 1

        save_training_artifacts(run)
        print(f"Epoch {epoch}/{EPOCHS}: train_loss={metrics['train_loss']:.4f} | val_loss={metrics['val_loss']:.4f} | val_accuracy={metrics['val_accuracy']:.4f} | val_macro_recall={metrics['val_macro_recall']:.4f} | time={metrics['seconds']}s")
        if stage == "full-fine-tune" and stalled_epochs >= EARLY_STOPPING_PATIENCE:
            print("Early stopping: validation macro recall did not improve.")
            break

    run["completed_at_utc"] = datetime.now(timezone.utc).isoformat()
    save_training_artifacts(run)
    print(f"\nBreed training complete. Best checkpoint: {OUTPUT_DIR / 'best.pth'}")
    print("The test split was not used. Run evaluate_breed.py separately.")


if __name__ == "__main__":
    main()
