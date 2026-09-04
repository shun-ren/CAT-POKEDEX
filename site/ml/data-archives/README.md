# Prepared CATDEX dataset backup

The two Git LFS archives in this directory preserve the exact prepared
train/validation/test split used by CATDEX. Keeping two archives instead of
tracking 56,956 images individually avoids making normal Git operations scan
tens of thousands of binary files.

## Restore after cloning

Install Git LFS before cloning, or fetch the archive objects afterward:

```powershell
git lfs install
git lfs pull
cd site
tar -xf ml/data-archives/breeds.tar -C ml/data
tar -xf ml/data-archives/coats.tar -C ml/data
```

The result should contain:

- `ml/data/breeds/`: 37,266 images across 40 included labels;
- `ml/data/coats/`: 19,690 images across 8 included labels; and
- `ml/data/preparation-report.json`: mappings, exclusions and split counts.

Verify both downloaded archives before extraction:

```powershell
Get-FileHash ml/data-archives/breeds.tar -Algorithm SHA256
Get-FileHash ml/data-archives/coats.tar -Algorithm SHA256
```

Compare those values with `SHA256SUMS.txt` in this directory. The image folders
under `ml/data/` remain ignored locally, so extracting the backup does not add
56,956 working-tree changes.

## Source and licensing notice

These archives are a reorganised subset of Denis Potapov's
[Cat Breeds Dataset (Cleared)](https://www.kaggle.com/datasets/denispotapov/cat-breeds-dataset-cleared).
Kaggle lists its license as "Database: Open Database, Contents: Database
Contents" (`DbCL-1.0`). CATDEX did not create or verify the source photographs.
The preparation process removed small classes, capped large classes, merged a
few aliases, routed pattern labels to the coat task, and split records by the
Petfinder animal identifier embedded in each filename.

The labels came from adoption advertisements and are training labels, not
verified pedigree records. See `ml/data/preparation-report.json` and the main
ML README before using the backup.
