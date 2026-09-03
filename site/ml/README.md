# CATDEX breed-model data workflow

Breed is a visual estimate, not proof of pedigree. CATDEX should use **two classifiers**: one for breed and one for coat/pattern. A tuxedo Ragdoll should therefore become two labels: `Black tuxedo` (coat) + `Ragdoll` (breed). Keeping the tasks separate prevents a coat-only clue from being mistaken for a pedigree clue.

## 1. Add images

Put evidence-backed images into this split structure. The same real cat must appear in only one split; otherwise the reported accuracy will be misleadingly high.

```text
ml/data/
  breeds/
    train/Ragdoll/            # one folder per breed label
    val/Ragdoll/
    test/Ragdoll/
    train/Bengal/
    val/Bengal/
    test/Bengal/
  coats/
    train/Black tuxedo/       # one folder per coat/pattern label
    val/Black tuxedo/
    test/Black tuxedo/
    train/Ginger tabby/
    val/Ginger tabby/
    test/Ginger tabby/
  unlabelled/                 # never used for supervised training
```

Use source images whose breed is documented by the owner, rescue, breeder, registry, or veterinary record. Do not label an ordinary black-and-white cat as Ragdoll only from appearance. Include difficult real-world pictures: shadows, side profiles, long and short coats, kittens/adults, busy backgrounds, and multiple coat colours per breed. Aim for at least several hundred independent cats per breed before trusting a class; balanced classes matter more than a large pile of similar images.

The folder name is the label—no CSV is needed for the supplied scripts. Suggested coat labels: `Black tuxedo`, `Ginger tabby`, `Calico`, `Tortoiseshell`, `Colour-point`, `Solid black`, `Solid blue-grey`, `Mostly white`, `Brown tabby`, and `Bicolour`. A useful split is about 70% train, 15% validation, and 15% test, by *individual cat*, not merely by image.

For the downloaded Petfinder/GitHub dataset, leave the original class folders and `cats.csv` inside `ml/data/original_dataset/`, then prepare both tasks from `site/`:

```powershell
python ml/prepare_data.py
```

The preparation script maps pattern folders into `coats/`, maps the remaining supported folders into `breeds/`, keeps every Petfinder animal ID in one split, excludes classes with fewer than 100 images, and caps each class at 2,500 images to reduce imbalance. It uses hard links where Windows permits, so the prepared data normally does not duplicate the image bytes. Its decisions and final counts are recorded in `ml/data/preparation-report.json`.

`cats.csv` contains the original Petfinder listing metadata and image URLs. Its `breed` field explains the source folders, while its `coat` field is mostly hair length (`Short`, `Medium`, or `Long`) rather than colour pattern. The preparation script uses the numeric ID already embedded in each filename to keep multiple photos of one listing together. Keep the CSV for provenance and future audits; the current classifier does not read it during training.

## 2. Train and evaluate before replacing the website model

From `site/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ml/requirements.txt
python ml/train.py --data ml/data/breeds --epochs 12 --output ml/output/breed
python ml/evaluate.py --data ml/data/breeds --checkpoint ml/output/breed/best.pt --output ml/output/breed

python ml/train.py --data ml/data/coats --epochs 12 --output ml/output/coat
python ml/evaluate.py --data ml/data/coats --checkpoint ml/output/coat/best.pt --output ml/output/coat
```

`train.py` is generic: it trains whichever label folders you pass in, so the same script serves both models. It saves candidate checkpoints only under `ml/output/`. `evaluate.py` reports accuracy, macro F1, per-label recall, and a confusion-matrix image on the untouched `test/` split. Check the Ragdoll and `Black tuxedo` rows specifically: high overall accuracy can still hide weak individual labels.

YOLO is not the first training step here. A ResNet classifier is the right fit when the uploaded image already contains one prominent cat. Add a YOLO cat detector later only if photos commonly contain several cats or very cluttered scenes; use it to crop the cat before passing that crop to the breed and coat models.

## 3. Deliberately promote a tested candidate

After reviewing the test report, export a browser-ready candidate:

```powershell
python ml/export_for_catdex.py --checkpoint ml/output/breed/best.pt --labels ml/output/breed/labels.json --output ml/output/breed/cat-breed-candidate.onnx
python ml/export_for_catdex.py --checkpoint ml/output/coat/best.pt --labels ml/output/coat/labels.json --output ml/output/coat/cat-coat-candidate.onnx
```

These commands write candidate ONNX files; they do **not** touch the local site. Review the two test reports before copying them into `build/models/`. The existing website currently runs the breed ONNX model and uses a provisional local coat heuristic. The next integration step, after a coat candidate passes evaluation, is to load `cat-coat-candidate.onnx` in `app.js` alongside the breed model and remove that heuristic.

Recommended release gate: no data leakage, macro F1 at least 0.80, and per-breed recall at least 0.75 for every breed shown to users. Below that, show “unable to identify reliably” rather than an authoritative breed name.
