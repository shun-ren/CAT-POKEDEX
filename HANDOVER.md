# CATDEX engineering handover

Last updated: 2 September 2026

This document is the working context for the next Codex session or developer. Read it together with [`README.md`](./README.md) before changing the product.

## 1. Product intent

CATDEX is a personal, game-like field guide for cats spotted around Singapore. The core loop is:

1. The user sees a cat.
2. They take or choose a photo.
3. CATDEX converts the photo into a smooth posterised cartoon portrait with illustrated outlines.
4. CATDEX automatically fills a conservative likely type and shows lower-ranked lookalikes.
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

The app is a dependency-free static web prototype under `site/build`.

| File | Responsibility |
| --- | --- |
| `site/build/index.html` | Page structure, collection, map, capture dialog and detail dialog |
| `site/build/styles.css` | Responsive visual system, pixel-game styling and sprite cropping |
| `site/build/app.js` | State, rendering, cartoon treatment, conservative type analysis, facts, chat, filtering and WebMCP registration |
| `site/build/assets/cat-sprite-atlas.png` | Eight original pixel-art demonstration cats in a 4 × 2 atlas |
| `site/build/assets/singapore-regions.png` | Original simplified Singapore region map |
| `site/build/assets/og.png` | Social preview card |
| `site/scripts/verify-build.mjs` | Dependency-free build verification |
| `site/.openai/hosting.json` | OpenAI Sites metadata and static build directory |

There is deliberately no framework or install step. `npm run build` runs a consistency check rather than compiling assets.

## 4. Data and behaviour

### Sighting record

New entries currently use this shape:

```js
{
  id: 'sg-...',
  species: 'cat',
  nickname: 'Kopi',
  breed: 'Domestic Shorthair',
  region: 'West',
  capturedAt: '2026-09-02T08:00:00.000Z',
  note: 'Slow blink champion.',
  photo: 'data:image/webp;base64,...',
  confidence: 68
}
```

The prototype seeds six demonstration sightings when no saved data exists. User sightings are written to `localStorage` under `catdex.sightings.v1`. The uploaded image is centre-cropped, reduced to a 40 × 40 colour-quantised image, enlarged to 320 × 320 with smoothing disabled, and stored as a WebP data URL.

This storage model is only for product validation. It is limited by browser quota, is tied to one device and browser, has no account boundary, and cannot synchronise.

### Breed catalogue

`site/build/app.js` contains a small `BREEDS` object with traits, origin, rarity and a short fact. The progress denominator is a configurable `TOTAL_BREEDS = 73`. Registry totals differ, so production must choose and cite a specific registry and catalogue version.

The current offline analyser uses several colour, contrast and spatial features and is intentionally biased toward `Domestic Shorthair` rather than rare-pedigree claims based on coat colour. It auto-fills the result and shows ranked lookalikes. It is still not machine learning and must be replaced with a calibrated, evaluated classifier before the product makes meaningful breed claims.

### Daily facts and Miso

The field log now includes a date-seeded cat fact with an optional “another fact” control. Miso is a generated cat-expert mascot with a keyboard-accessible side chat. Its answers come from a small offline intent-based care library; it does not call an LLM and must not be represented as veterinary diagnosis.

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
- Miso, the transparent cat-expert chat mascot.

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
- an HTTP request to `/`, which returned status 200

Browser visual QA and WebMCP contract execution were not available in the original environment. The next developer should test desktop and mobile layouts, capture a real photo, refresh to verify persistence, inspect a saved detail view, and exercise search and regional filtering.

## 7. Known gaps

1. Storage is device-local rather than account-backed.
2. The automatic type analyser is conservative but remains a hand-built visual heuristic, not a trained and calibrated classifier.
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
