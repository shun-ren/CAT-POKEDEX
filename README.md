# CATDEX

**Spot. Snap. Stash.** CATDEX is a privacy-first, pixel-art field guide for cats spotted around Singapore.

The current version is a functional browser prototype. A user can take or choose a cat photo, turn it into a deliberately pixelised portrait, review a visual breed suggestion, select a broad Singapore region, and add the sighting to their collection. The collection records when the cat was captured, shows breed traits, tracks unlocked breeds, and visualises sightings on an intentionally generalised Singapore map.

## What is included

- Camera-friendly photo input (`capture="environment"` on supported mobile browsers)
- Real client-side pixelisation using an HTML canvas
- A reviewable breed suggestion with confidence text and manual correction
- Cat detail entries with breed origin, rarity, traits, capture date and field notes
- Breed and sighting progress counters (`unlocked / 73`)
- Search and broad-region filtering
- A cartoon pixel-art Singapore map with regional sighting totals
- Six privacy-safe regions: Central, East, North, North-East, West and Southern Islands
- Device-local persistence for the prototype
- Responsive desktop and mobile layouts
- A small WebMCP surface for opening the capture flow and reading sighting metadata
- A species-ready record shape so future dog, bird or other wildlife packs can reuse the collection engine

## Privacy model

CATDEX never requests or stores GPS coordinates, postal codes, street names or exact pins. A sighting stores only one manually chosen broad region. This reduces the risk of exposing community-cat locations to people who may cause harm.

The prototype stores entries in the current browser using `localStorage`. Uploaded photos are reduced to a 320 × 320 pixel-art WebP before storage. This is useful for product validation, but it is not the final multi-device architecture.

For a production release, use:

- authenticated user accounts;
- object storage for original and pixelised images;
- a relational database for sightings, species, breed profiles and unlock progress;
- a vetted image-classification model that returns multiple breed candidates;
- server-side deletion and export controls; and
- the same broad-region-only location policy.

## Breed identification note

Appearance alone cannot reliably prove a cat's pedigree. The current offline suggestion is intentionally lightweight and should be treated as a visual estimate, not a definitive identification. The user always reviews and can correct the suggestion before saving. A production classifier should return ranked candidates and preserve an `Unknown / mixed ancestry` option.

The total of 73 is a configurable starter catalogue. Cat registries recognise different totals, so a production release should choose and cite one registry/version rather than presenting a universal number.

## Run locally

The app is dependency-free and lives in [`site/build`](./site/build).

```powershell
cd site
npm run build
python -m http.server 4173 --directory build
```

Then open `http://localhost:4173`.

## Project structure

```text
CAT-POKEDEX/
├─ README.md
└─ site/
   ├─ .openai/hosting.json
   ├─ package.json
   ├─ scripts/verify-build.mjs
   └─ build/
      ├─ index.html
      ├─ styles.css
      ├─ app.js
      └─ assets/
         ├─ cat-sprite-atlas.png
         ├─ singapore-regions.png
         └─ og.png
```

## Extending beyond cats

Sightings already include a `species` field. The next step is to move breed profiles into versioned species packs:

```text
species → catalogue entries → traits → sightings → unlock progress
```

That makes it possible to add dogs or birds without rebuilding the capture, map, privacy or collection layers.

## Visual assets

The cat sprite atlas, Singapore region map and social preview are original AI-generated pixel-art assets created for this project. They use the supplied references only for broad mood and collection-game inspiration; no Pokémon characters, logos or copied interface elements are included.
