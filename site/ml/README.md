# CATDEX model workflow

CATDEX has two independent image classifiers:

- **Breed model:** visual breed/type estimate, trained from `data/breeds/`.
- **Coat model:** colour/pattern estimate, trained from `data/coats/`.

They must remain separate. `Black tuxedo` is a coat label and `Ragdoll` is a breed label; one does not prove the other.

## Important coat-data limitation

The current Petfinder source labels are category folders, not a verified coat-phenotype study. They are useful for an initial pattern model but are not sufficient to make authoritative claims about every colour or pattern. Treat coat output as a visual estimate, audit confusing classes, and improve it later with independently reviewed coat labels.

## Dataset layout

```text
ml/data/
  breeds/train/<breed>/  breeds/val/<breed>/  breeds/test/<breed>/
  coats/train/<coat>/    coats/val/<coat>/    coats/test/<coat>/
```

The split is by Petfinder animal ID, so photos of the same cat stay in one split. Training reads only `train/`, selects checkpoints using `val/`, and evaluation reads only `test/`.

The exact prepared data is stored in Git LFS archives at `data-archives/breeds.tar` and `data-archives/coats.tar`. `SHA256SUMS.txt` records their checksums. The archives are a transport backup; training never reads them directly.

## Set up on any device

Clone the repository, then restore the prepared split before creating the environment:

```powershell
git lfs install
git lfs pull
cd CAT-POKEDEX/site
tar -xf ml/data-archives/breeds.tar -C ml/data
tar -xf ml/data-archives/coats.tar -C ml/data
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r ml/requirements.txt
```

For an NVIDIA training machine, install the PyTorch build appropriate to its CUDA version from the official PyTorch selector before running the scripts. Do not copy `.venv` between devices.

## Train

Each standalone script is intentionally separate and uses its own data and output directory. No shared training or evaluation module is used:

```powershell
python ml/train_breed.py
python ml/train_coat.py
```

Both scripts train a pretrained ImageNet **ResNet18** for 14 epochs by default:

1. Epochs 1–3 freeze the visual backbone and train only the new classification layer.
2. Epochs 4–14 unfreeze the whole network. The classification head uses a higher learning rate than the backbone, so learned visual features are adjusted cautiously.

They use weighted cross-entropy with light label smoothing, moderate cat-safe augmentation, mixed precision on CUDA, a cosine learning-rate schedule for fine-tuning, macro-recall checkpoint selection, and early stopping. Output is intentionally ignored by Git:

```text
ml/output/breed/best.pth
ml/output/breed/last.pth
ml/output/breed/training-history.json
ml/output/breed/training-curves.png
ml/output/coat/...             # equivalent coat artifacts
```

`best.pth` is the best validation macro-recall checkpoint. `last.pth` is only for inspection/recovery. A `.pth` file is not automatically deployed to the website.

## Evaluate and compare

Run this only after the matching training script completes:

```powershell
python ml/evaluate_breed.py
python ml/evaluate_coat.py
```

Evaluation uses the untouched `test/` split and writes per-model JSON plus a confusion matrix. `ml/output/model-comparison.json` and `model-comparison.png` show the current selected breed and coat checkpoint scores (accuracy, macro F1 and macro recall). Review per-class recall, not only accuracy, before choosing a candidate.

## Export a reviewed candidate

Copy the chosen `best.pth` back to this project if it was trained on another device, run evaluation locally or retain its test report, then export it deliberately:

```powershell
python ml/export_for_catdex.py --checkpoint ml/output/breed/best.pth --labels ml/output/breed/labels.json --output ml/output/breed/cat-breed-candidate.onnx
python ml/export_for_catdex.py --checkpoint ml/output/coat/best.pth --labels ml/output/coat/labels.json --output ml/output/coat/cat-coat-candidate.onnx
```

Candidate exports do not replace `build/models/` automatically. Only promote a model after test review and browser-integration work.

For the design rationale, metrics and release gate, read [MODEL_TRAINING_STRATEGY.md](./MODEL_TRAINING_STRATEGY.md).
