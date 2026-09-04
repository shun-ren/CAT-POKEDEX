# CATDEX engineering handover

Last updated: 4 September 2026

This document is the working context for the next Codex session or developer. Read it together with [`README.md`](./README.md) before changing the product.

## 1. Product intent

CATDEX is a personal, game-like field guide for cats spotted around Singapore. The core loop is:

1. The user sees a cat.
2. They take or choose a photo.
3. CATDEX converts the photo into a smooth posterised cartoon portrait with illustrated outlines.
4. CATDEX separately estimates the coat and likely breed, combines them into a final label, and shows lower-ranked alternatives for both.
5. The user chooses one broad Singapore region and optionally adds a nickname or field note.
6. The entry is stashed in a searchable collection and contributes to breed, sighting and regional progress.

The design is inspired by the satisfying discovery loop of creature-collection games, but all visuals, copy and interface elements are original. Do not add Pokémon characters, names, logos, sounds or copied interface layouts.

## 2. Non-negotiable product decisions

### Location privacy

Never request, infer, retain or display exact cat locations. Do not store GPS coordinates, EXIF location, street names, postal codes, building names or map pins. Store only one of these manually selected broad regions:

- Central
- East
- North
- North-East
- West
- Southern Islands

This protects community cats from harassment or unwanted attention. Any future backend, analytics or map work must preserve this rule.

### Breed identification is an estimate

Visual appearance cannot prove pedigree. The interface must continue to call the result a visual estimate, show uncertainty, and allow manual correction. A future model should return ranked candidates plus `Unknown / mixed ancestry`; it must never present an uncertain result as fact.

### Species-ready architecture

Cats are the only live species pack. Keep records keyed by `species` so the capture, map, collection and progress layers can later support dogs, birds and other animals without being rewritten.

## 3. Current implementation

The app is a static web prototype under `site/build`, with ONNX Runtime Web and breed-model weights vendored for local browser inference.

| File | Responsibility |
| --- | --- |
| `site/build/index.html` | Page structure, collection, map, capture dialog and detail dialog |
| `site/build/styles.css` | Responsive visual system, pixel-game styling and sprite cropping |
| `site/build/app.js` | State, rendering, cartoon treatment, conservative type analysis, facts, chat, filtering and WebMCP registration |
| `site/build/assets/cat-sprite-atlas.png` | Eight original pixel-art demonstration cats in a 4 × 2 atlas |
| `site/build/assets/singapore-regions.png` | Original simplified Singapore region map |
| `site/build/assets/og.png` | Social preview card |
| `site/build/models/cat-breed-resnet18.onnx` | Local Oxford-IIIT Pet ResNet18 breed weights |
| `site/build/vendor/ort.min.js` and `.wasm` | Vendored ONNX Runtime Web inference engine |
| `site/ml/prepare_data.py` | Reproducible source-class mapping, animal-level splitting and class balancing |
| `site/ml/train.py` | Balanced ResNet18 transfer-learning workflow for breed or coat labels |
| `site/ml/evaluate.py` | Held-out accuracy, macro F1, per-label recall and confusion-matrix reporting |
| `site/ml/export_for_catdex.py` | Candidate ONNX export, label checking and runtime validation without replacing the website model |
| `site/ml/requirements.txt` | Exact Python 3.12 dependency versions verified for the project virtual environment |
| `site/scripts/verify-build.mjs` | Dependency-free build verification |
| `site/.openai/hosting.json` | OpenAI Sites metadata and static build directory |

The static website has no framework compilation step: `npm run build` runs a consistency check rather than compiling assets. The separate ML workflow does require the Python virtual environment documented below.

### ML dataset and environment status

The user downloaded the Petfinder-derived `cat-breeds-dataset-cleared` data and used it to prepare the ML splits. The raw `site/ml/data/original_dataset/` folder—including its 86 MB `cats.csv`—was deliberately deleted on 3 September 2026 after verifying that all 56,956 prepared images were hard links and remained accessible. The raw dataset is not in Git and must be downloaded again if the splits ever need to be regenerated from source.

`python ml/prepare_data.py --skip-image-validation` completed successfully before the raw source was removed. It created hard-linked, deterministic 70/15/15 train/validation/test splits:

- `site/ml/data/breeds/`: 40 included breed/type labels, 37,266 selected images;
- `site/ml/data/coats/`: 8 included pattern labels, 19,690 selected images; and
- `site/ml/data/preparation-report.json`: complete mappings, exclusions and split counts.

The exact prepared directories are also backed up in Git LFS as
`site/ml/data-archives/breeds.tar` and `coats.tar`. Their internal file counts
were verified as 37,266 and 19,690 respectively before upload, and
`SHA256SUMS.txt` records their hashes. On another device, install Git LFS, run
`git lfs pull`, then extract both archives into `site/ml/data/`. The archive
README records the Kaggle source, listed `DbCL-1.0` license and restore steps.

Preparation excluded source classes with fewer than 100 images and capped each included class at 2,500 images. It merges `Applehead Siamese` into `Siamese`, and both hairless aliases into `Sphynx`. Pattern folders such as Calico, Tabby, Torbie, Tortoiseshell and Tuxedo are excluded from breed training and routed to coat training. Trait/ambiguous folders such as `Extra-Toes Cat - Hemingway Polydactyl`, `Chinchilla`, and `Oriental Tabby` are excluded from breed training.

Image decoding validation was skipped during preparation because Pillow was not installed at that moment. Pillow is installed now, but a full prepared-image validation pass is still pending. The report's `rejected_images: []` therefore means “none checked and rejected,” not proof that every file decodes correctly.

The prepared coat data is incomplete for production: it covers Black tuxedo, Calico, Dilute calico, Dilute tortoiseshell, Tabby, Tiger tabby, Torbie and Tortoiseshell. It lacks required negative/alternative classes such as solid black, solid white, ginger, colour-point and general bicolour. A coat model trained only on these eight labels will force every upload into one of them, so it must not replace the website heuristic yet.

Python 3.12.10 is installed for the Windows user, and a conventional virtual environment with all packages from `ml/requirements.txt` is available at `site/.venv/`. The requirements file now pins the eight direct dependencies that the scripts use: PyTorch, TorchVision, NumPy, Pillow, scikit-learn, Matplotlib, ONNX and ONNX Runtime. Exact pins make a recreated environment match the versions checked on this machine. The virtual environment is intentionally ignored by Git; recreate it instead of copying it between devices.

Create or refresh the environment from `site/`:

```powershell
cd site
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r ml\requirements.txt
python -m pip check
```

Installed PyTorch is CPU-only (`torch 2.14.0+cpu`), CUDA is unavailable, and PyTorch detected four CPU threads. The environment passed `pip check` and imported all eight direct dependencies on 4 September 2026. A six-epoch coat linear-probe run was started but stopped cleanly at the user's request before epoch 1 completed. No `best.pt`, labels, evaluation result, or candidate ONNX was created. No trained candidate was promoted to `site/build/models/`.

### Exact next-session ML steps

1. Do not rerun `prepare_data.py` over the populated output folders. It intentionally refuses to do so, and the raw source folder has been removed. Review `ml/data/preparation-report.json` first.
2. Add or run a decode audit over both prepared datasets before training. Remove or replace unreadable source images, then regenerate the split deliberately if any are found.
3. Prefer a CUDA-capable computer or a hosted notebook for the final run. The local four-thread CPU did not finish one coat epoch in the available session.
4. If continuing locally, establish a one-epoch timing/quality baseline first:

```powershell
cd site
.\.venv\Scripts\Activate.ps1
python ml\train.py --data ml\data\coats --epochs 1 --output ml\output\coat --batch-size 64
python ml\evaluate.py --data ml\data\coats --checkpoint ml\output\coat\best.pt --output ml\output\coat

python ml\train.py --data ml\data\breeds --epochs 1 --output ml\output\breed --batch-size 64
python ml\evaluate.py --data ml\data\breeds --checkpoint ml\output\breed\best.pt --output ml\output\breed
```

5. Treat these one-epoch runs as baselines, not deployable models. For a final run, increase epochs and use `--fine-tune` on GPU, then inspect macro F1, every per-label recall, and the confusion matrix.
6. Do not deploy the current eight-class coat data until missing coat classes and an unknown/other strategy are added. A closed-set softmax score is not reliable out-of-distribution confidence.
7. Export and integrate only candidates that pass the agreed release gate. Keep the current website model untouched until then.

`export_for_catdex.py` verifies that the labels match the checkpoint, validates the ONNX graph, and performs one CPU Runtime inference before reporting success. It derives the correct sidecar name from the output (for example, `cat-coat-labels.json` for a coat candidate).

## 4. Data and behaviour

### Sighting record

New entries currently use this shape:

```js
{
  id: 'sg-...',
  species: 'cat',
  nickname: 'Kopi',
  breed: 'Domestic Shorthair',
  coat: 'Ginger tabby',
  region: 'West',
  capturedAt: '2026-09-02T08:00:00.000Z',
  note: 'Slow blink champion.',
  photo: 'data:image/webp;base64,...',
  confidence: 68,
  coatConfidence: 83
}
```

The prototype seeds six demonstration sightings when no saved data exists. User sightings are written to `localStorage` under `catdex.sightings.v1`. The uploaded image is centre-cropped to a 192 × 192 analysis canvas, redrawn with posterised colour and outline extraction, then stored as a 480 × 480 WebP data URL. Each file selection receives a monotonically increasing analysis ID so stale asynchronous results cannot overwrite a newer photo.

This storage model is only for product validation. It is limited by browser quota, is tied to one device and browser, has no account boundary, and cannot synchronise.

### Breed catalogue

`site/build/app.js` contains a small `BREEDS` object with traits, origin, rarity and a short fact. The progress denominator is a configurable `TOTAL_BREEDS = 73`. Registry totals differ, so production must choose and cite a specific registry and catalogue version.

The current offline analyser has independent coat and breed stages. Foreground-weighted colour, contrast, texture and spatial features produce coat labels. Breed ranking uses a local ResNet18 ONNX model trained on Oxford-IIIT Pet and falls back to appearance rules if the runtime cannot classify the image. Each stage returns a primary result, confidence and alternatives. The Oxford dataset covers only 12 cat breeds and roughly 200 images per category, so the model still needs broader representative training data and calibrated abstention before pedigree claims can be trusted.

### Daily facts and Miso

The field log includes a date-seeded cat fact over a generated cat-lounge background with a high-contrast reading panel. Miso uses a four-state generated sprite sheet for idle, blink, tail/yarn play and stretch poses. Its keyboard-accessible chat now explains the catalogue breeds and common coat categories. Answers still come from a small offline intent-based library; it does not call an LLM and must not be represented as veterinary diagnosis.

### Map

The map is intentionally illustrative rather than geographically precise. Region markers aggregate the number of saved cats per broad region. Selecting a marker filters the collection; it does not reveal an underlying coordinate.

### WebMCP

The page registers two imperative tools when `document.modelContext` is available:

- `start_cat_capture`: opens the same visible capture flow used by the buttons.
- `list_cat_sightings`: returns sighting metadata without image bytes and can filter by broad region.

The current environment did not provide a supported in-app browser, so these registrations were implemented but not runtime-validated in a WebMCP context.

## 5. Visual system

The interface uses warm cream, deep forest green, lime, coral, gold and lavender. Borders and hard offset shadows create a handheld field-guide feel. Generated art uses crisp 16-bit pixels.

The raster assets were generated with the built-in image-generation workflow from briefs for:

- an original eight-cat 4 × 2 sprite atlas;
- an abstract, privacy-safe Singapore regional map; and
- a `CATDEX — Spot. Snap. Stash.` social card.
- Miso, the transparent cat-expert chat mascot;
- a four-state Miso animation sheet; and
- a wide, quiet-centre cat-lounge fact background.

All briefs explicitly excluded copyrighted characters, logos and copied UI.

## 6. Run and verify

From the repository root:

```powershell
cd site
npm.cmd run build
python -m http.server 4173 --directory build
```

Open `http://localhost:4173`. Use `py` instead of `python` if required. Press `Ctrl+C` to stop the server.

The last completed checks were:

- `npm.cmd run build`
- `node --check build/app.js`
- Python byte-compilation of every script under `site/ml/`
- `python -m pip check`
- imports of every direct package pinned in `site/ml/requirements.txt`
- an end-to-end temporary two-class ONNX export, graph validation and Runtime inference

Browser visual QA and WebMCP contract execution were not available in the current environment. The next developer should test desktop and mobile layouts, capture a real photo, refresh to verify persistence, inspect a saved detail view, and exercise search and regional filtering.

## 7. Known gaps

1. Storage is device-local rather than account-backed.
2. Coat analysis remains heuristic, while the trained breed model is limited to the 12 Oxford-IIIT Pet cat breeds and has no mixed/unknown class.
3. There is no deletion, editing, export or import flow.
4. Original photos are not retained separately from pixel portraits.
5. There is no explicit EXIF stripping step because the canvas output naturally creates new image bytes; production should still verify this server-side.
6. The catalogue is illustrative and incomplete.
7. Accessibility needs browser testing, including keyboard focus, dialog behaviour, colour contrast and screen-reader output.
8. The app has no automated interaction tests.
9. The OpenAI Sites project was created, but the source push and production deployment were not completed in the original session.

## 8. Recommended roadmap

### Phase 1 — harden the prototype

- Add edit and delete actions with confirmation.
- Add `Unknown / mixed ancestry` to breed review.
- Add import/export of a user's collection as a privacy-safe JSON archive.
- Add empty, error and storage-quota recovery states.
- Add browser interaction tests for capture, stash, search, detail and map filtering.
- Validate mobile camera behaviour on iOS Safari and Android Chrome.

### Phase 2 — durable accounts and storage

- Add authentication and per-user ownership checks.
- Store sighting metadata in a relational database.
- Store original and pixelised images in object storage.
- Strip EXIF metadata at ingestion and never persist coordinates.
- Add server-side validation, deletion and account export.
- Keep broad-region selection manual; do not derive or log precise location.

Suggested entities:

```text
users
species
catalogue_versions
breeds
breed_traits
sightings
sighting_images
user_unlocks
```

### Phase 3 — trustworthy identification

- Evaluate an image classifier on Singapore community-cat imagery.
- Return top candidates with calibrated confidence, not one absolute answer.
- Separate breed from coat colour and pattern; for example, calico is a coat pattern rather than a breed.
- Allow `Domestic Shorthair`, mixed ancestry and unknown outcomes.
- Add moderation and correction feedback without using user images for training unless the user explicitly consents.

### Phase 4 — richer field guide

- Catalogue versioning and registry citations.
- Unlock animations, badges and regional challenges.
- Multiple sightings of the same individual without pretending identity matching is certain.
- Optional health/welfare observations with careful non-medical language.
- Offline-first PWA caching and queued uploads.
- Collection sharing that excludes all location data by default.
- Community-cat safety guidance and reporting links.

### Phase 5 — additional species

- Extract cat-specific data into a versioned species pack.
- Add dog and bird catalogues with species-specific traits and classifiers.
- Let users switch field guides while reusing capture, privacy, map and collection infrastructure.
- Review whether each species needs stricter location protection; nesting birds and wildlife may require even broader or delayed location display.

## 9. Guardrails for the next Codex

- Do not silently introduce exact location collection.
- Do not describe visual breed guesses as verified pedigrees.
- Do not replace durable product data with browser storage once a backend exists.
- Do not add copyrighted creature-game assets or branding.
- Preserve the original generated assets unless the user explicitly requests a redesign.
- Keep the app usable without sound and with reduced motion enabled.
- Update this handover and the README whenever architecture, persistence, privacy rules or deployment state changes.

## 10. Cleanup completed on 4 September 2026

- Removed obsolete CSS for a superseded Miso `<img>` launcher, its unused animation, old candidate markup, and background-image photo containers that now render real `<img>` elements.
- Consolidated duplicate hero, cat-fact, responsive and pixel-preview declarations without changing the final computed styles.
- Reformatted the ML scripts for readability and made their label-related messages work for both breed and coat training.
- Removed an ignored 5.8 MB `.local-backups/site-git/` copy of the retired nested Git metadata. It was not used by the current repository and is not recoverable from the workspace after deletion.
- Kept all build images, the browser ONNX model, its labels and ONNX Runtime vendor files because reference checks confirmed they are active.
- Committed and pushed the cleanup plus verified Git LFS dataset backup to
  GitHub `main` on 4 September 2026. No OpenAI Sites deployment was performed.
