# Packaging Project Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two packaging category demo projects with the supplied 瑞美亚面膜包装 and 默赛尔企业画册 cover/detail images.

**Architecture:** A focused Pillow script converts source JPG files into optimized WebP assets under each project's public directory. The existing category data model supplies `cover` and `media` paths to the unchanged card and media-viewer components.

**Tech Stack:** React, Vite, JavaScript data modules, Pillow, WebP
**Spec:** `docs/superpowers/specs/2026-09-05-packaging-project-images-design.md`

## Global Constraints

- Do not modify or overwrite the four source JPG files.
- Preserve the current two-card layout, hover interaction, and media viewer.
- Covers remain 1600×1000; the mask detail remains 1086px wide; the brochure detail is resized proportionally to 1800px wide.
- Encode WebP assets at quality 90 with method 6.
- Do not change other category pages, the home page, or navigation.

---

### Task 1: Produce optimized packaging assets

**Files:**
- Create: `scripts/optimize_packaging_projects.py`
- Create: `public/work/packaging-01/cover.webp`
- Create: `public/work/packaging-01/detail-01.webp`
- Create: `public/work/packaging-02/cover.webp`
- Create: `public/work/packaging-02/detail-01.webp`

**Interfaces:**
- Consumes: source files under `../包装与物料`
- Produces: stable public URLs `/work/packaging-01/{cover,detail-01}.webp` and `/work/packaging-02/{cover,detail-01}.webp`

- [x] **Step 1: Add the conversion script**

```python
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "包装与物料"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work"

ASSETS = (
    ("packaging-01", "项目图封面1.jpg", "cover.webp", (1600, 1000), None),
    ("packaging-01", "面膜包装.jpg", "detail-01.webp", (1086, 5240), None),
    ("packaging-02", "项目图封面2.jpg", "cover.webp", (1600, 1000), None),
    ("packaging-02", "企业画册排版.jpg", "detail-01.webp", (4200, 12600), 1800),
)

for project_id, source_name, output_name, expected_size, target_width in ASSETS:
    source_path = SOURCE_ROOT / source_name
    output_dir = OUTPUT_ROOT / project_id
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / output_name

    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
        if target_width:
            target_height = round(image.height * target_width / image.width)
            image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
        image.save(output_path, "WEBP", quality=90, method=6)
```

- [x] **Step 2: Run the conversion script**

Run the script with the bundled Python runtime from the workspace environment.

Expected output files and dimensions:

```text
packaging-01/cover.webp       1600x1000
packaging-01/detail-01.webp   1086x5240
packaging-02/cover.webp       1600x1000
packaging-02/detail-01.webp   1800x5400
```

- [x] **Step 3: Verify dimensions, formats, and source preservation**

Open all four generated files with Pillow, assert `format == "WEBP"`, and assert the exact dimensions above. Confirm the four source JPG paths still exist and retain their original dimensions.

### Task 2: Connect assets and project copy

**Files:**
- Modify: `src/data/workCategories.js:74-85`

**Interfaces:**
- Consumes: public URLs produced by Task 1
- Produces: two packaging project objects compatible with `WorkCategoryPage`

- [x] **Step 1: Replace the packaging project objects**

```js
projects: [
  {
    id: 'packaging-01',
    title: '瑞美亚面膜包装',
    meta: 'PACKAGING · MASK',
    cover: '/work/packaging-01/cover.webp',
    media: [{ type: 'image', src: '/work/packaging-01/detail-01.webp', alt: '瑞美亚面膜包装作品详情' }],
  },
  {
    id: 'packaging-02',
    title: '默赛尔企业画册',
    meta: 'EDITORIAL · BROCHURE',
    cover: '/work/packaging-02/cover.webp',
    media: [{ type: 'image', src: '/work/packaging-02/detail-01.webp', alt: '默赛尔企业画册作品详情' }],
  },
],
```

- [x] **Step 2: Run static checks**

Run: `pnpm run lint`

Expected: no new errors; record any pre-existing warning separately.

Run: `pnpm run build`

Expected: successful production build.

### Task 3: Verify the finished page in the browser

**Files:**
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: packaging project objects from Task 2
- Produces: confirmed PC/mobile rendering and interaction behavior

- [x] **Step 1: Verify desktop category rendering**

Open `http://127.0.0.1:5173/?category=packaging` at desktop width. Confirm exactly two cards, correct titles, correct covers, equal-width columns, and no horizontal overflow.

- [x] **Step 2: Verify both media viewers**

Click each card. Confirm the title and long image match, the image uses its natural aspect ratio, the panel scrolls vertically, and closing the viewer returns to the category page.

- [x] **Step 3: Verify mobile rendering**

Set the viewport to 390×844. Confirm the two cards form a single column, images remain uncropped as designed inside the card frame, details scroll without horizontal overflow, and controls remain reachable. Reset the viewport afterward.

- [x] **Step 4: Inspect runtime logs**

Confirm the browser console contains no new errors or warnings caused by missing assets, invalid image decoding, or React rendering.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. The spec, plan, generated assets, build output, and browser verification provide the execution record.
