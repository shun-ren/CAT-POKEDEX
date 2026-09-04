# CATDEX model-training strategy

## Current coat-data limitation

The Petfinder-derived coat classes are source categories, not verified genetics or a professionally annotated coat-phenotype dataset. The coat model can make a useful visual estimate, but it must not be described as ground truth. Expand it later with reviewed examples of each intended pattern and test on independent real-world Singapore cat photos.

## Why two models

Breed and coat answer different questions. A Ragdoll can have different coats, and a tuxedo appearance can occur in many breeds and mixed-breed cats. Training one combined `tuxedo ragdoll` class would multiply the number of labels, leave too few examples per label, and encourage a coat cue to be treated as pedigree evidence.

The website therefore combines two ranked predictions: **coat/pattern + visual breed/type estimate**. Neither prediction proves ancestry.

## 1. Breed model

### Purpose and data

`train_breed.py` trains from `ml/data/breeds/train` and validates against `ml/data/breeds/val`. `evaluate_breed.py` uses only the untouched `ml/data/breeds/test` split. The source split groups photos by animal ID before splitting, preventing the same listed cat from leaking between train and test.

### Architecture

The classifier is an ImageNet-pretrained **ResNet18**. ResNet is appropriate because this is single-cat image classification, not object detection. YOLO would be useful only as a separate pre-crop detector for multi-cat or cluttered photos.

The final ImageNet layer is replaced with a classifier for the prepared breed labels. The training is deliberately staged:

1. **Epochs 1–3 — head warm-up:** ResNet visual layers and batch-normalisation statistics are frozen; only the new classification head trains at `1e-3`.
2. **Epochs 4–14 — full fine-tuning:** all layers train. The classifier head uses `2e-4`; the pretrained visual backbone uses `2e-5`. A cosine schedule decays those fine-tuning rates.

This is not “classification layer only” overall: it is head-only initially, then full-network fine-tuning. It avoids immediately overwriting useful ImageNet features while allowing the model to adapt to cat-specific shape, fur and face cues later.

### Learning signals and safeguards

- Weighted cross-entropy offsets class imbalance.
- Label smoothing of `0.05` reduces overconfident fitting to noisy source labels.
- Moderate augmentation: constrained crop (80–100% of image), horizontal flip, small colour jitter, and ±10° rotation. This improves real-photo tolerance without turning a cat into an implausible image.
- CUDA mixed precision is used when available; CPU runs remain functional but slower.
- The validation winner is selected by macro recall, so each breed matters equally rather than large classes dominating accuracy.
- Early stopping stops after five fine-tuning epochs without meaningful macro-recall improvement.

## 2. Coat/pattern model

### Purpose and data

`train_coat.py` and `evaluate_coat.py` mirror the breed workflow but read only `ml/data/coats`. They write only to `ml/output/coat`, so breed checkpoints cannot be overwritten.

### Architecture and training

The coat model also uses ImageNet-pretrained ResNet18 and the same staged procedure, weighted cross-entropy, label smoothing, validation checkpointing, and held-out evaluation. Its augmentation is slightly more conservative (smaller colour jitter and ±8° rotation) because colour and pattern are its primary evidence.

Separate training does not require separate Python environments: both models use the same dependencies but have four independent scripts, separate datasets, labels, checkpoints and evaluation results.

## Metrics, artifacts and model selection

Training records loss, validation accuracy, macro recall, macro F1, per-class recall, duration and learning rates in `training-history.json`; `training-curves.png` plots the main trends. `best.pth` is the best validation macro-recall checkpoint; `last.pth` is the last checkpoint.

The separate evaluators generate a test-only `evaluation-results.json`, `evaluation-confusion-matrix.png`, and a shared `ml/output/model-comparison.json` plus `model-comparison.png`. These make future runs comparable. Do not select a release based on training accuracy.

Suggested release gate: no leakage; macro F1 at least 0.80; and per-class recall at least 0.75 for every user-visible class. Below that, the product should abstain or show a low-confidence visual estimate rather than claim certainty.

## Running on another device

The Git LFS data archives are a backup for another training device. Clone, run `git lfs pull`, extract both archives into `site/ml/data`, create a fresh `site/.venv`, install `ml/requirements.txt`, and run the two training scripts. The environment itself should never be copied between devices.

Bring back each selected `best.pth`, its `labels.json`, training history and evaluation report. Then evaluate/export deliberately. A `.pth` checkpoint is a PyTorch training artifact; `export_for_catdex.py` converts a reviewed checkpoint to a browser ONNX candidate, but does not deploy it automatically.
