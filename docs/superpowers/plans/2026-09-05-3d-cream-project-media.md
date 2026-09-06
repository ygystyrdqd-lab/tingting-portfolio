# 3D Cream Project Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three 3D category demo cards with one complete 瑞美亚多效修复霜三维视觉 project containing a real cover, two process images, and a video.

**Architecture:** A focused Pillow/shutil script creates optimized WebP images and a byte-identical public MP4 copy in one project directory. The existing category data model supplies one cover and an ordered three-item media array to the unchanged card and media-viewer components.

**Tech Stack:** React, Vite, JavaScript data modules, Pillow, WebP, HTML5 video
**Spec:** `docs/superpowers/specs/2026-09-05-3d-cream-project-media-design.md`

## Global Constraints

- Do not modify or overwrite the four source media files.
- Resize the 1920×1080 cover to 1600×900 and encode all three images as WebP at quality 90 with method 6.
- Keep both 960×1280 process images at their original dimensions.
- Keep the MP4 byte-identical to its source.
- Preserve detail order: 白模过程图, 成品渲染图, 三维动画视频.
- Keep metadata-only video loading, native controls, inline playback, and no autoplay.
- Do not change other categories, the home page, or navigation.

---

### Task 1: Produce public 3D cream project assets

**Files:**
- Create: `scripts/prepare_3d_cream_project.py`
- Create: `public/work/3d-01/cover.webp`
- Create: `public/work/3d-01/process-white.webp`
- Create: `public/work/3d-01/render.webp`
- Create: `public/work/3d-01/video.mp4`

**Interfaces:**
- Consumes: four source files under `../三维视觉`
- Produces: stable public paths under `/work/3d-01/`

- [x] **Step 1: Add the asset preparation script**

```python
from pathlib import Path
import shutil

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "三维视觉"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work" / "3d-01"
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

IMAGES = (
    ("3MP4_0001.jpg", "cover.webp", (1920, 1080), (1600, 900)),
    ("白膜面霜.png", "process-white.webp", (960, 1280), None),
    ("渲染面霜.png", "render.webp", (960, 1280), None),
)

for source_name, output_name, expected_size, target_size in IMAGES:
    with Image.open(SOURCE_ROOT / source_name) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
        if target_size:
            image = image.resize(target_size, Image.Resampling.LANCZOS)
        image.save(OUTPUT_ROOT / output_name, "WEBP", quality=90, method=6)

shutil.copy2(SOURCE_ROOT / "面霜视频终.mp4", OUTPUT_ROOT / "video.mp4")
```

- [x] **Step 2: Run the script with the bundled Python runtime**

Expected output: a 1600×900 cover, two 960×1280 detail WebPs, and one MP4 in `public/work/3d-01`.

- [x] **Step 3: Verify dimensions and media integrity**

Use Pillow to assert each WebP format and exact dimension. Compare SHA-256 of the source and copied MP4 and assert equality; confirm all source paths still exist.

### Task 2: Connect the single project and ordered detail media

**Files:**
- Modify: `src/data/workCategories.js:110-122`

**Interfaces:**
- Consumes: public paths produced by Task 1
- Produces: one `3d-01` project object with an ordered three-item media array

- [x] **Step 1: Replace the three demo projects with one real project**

```js
projects: [
  {
    id: '3d-01',
    title: '瑞美亚多效修复霜三维视觉',
    meta: '3D · PRODUCT VISUAL',
    cover: '/work/3d-01/cover.webp',
    media: [
      {
        type: 'image',
        src: '/work/3d-01/process-white.webp',
        alt: '瑞美亚多效修复霜三维白模过程图',
      },
      {
        type: 'image',
        src: '/work/3d-01/render.webp',
        alt: '瑞美亚多效修复霜三维成品渲染图',
      },
      {
        type: 'video',
        src: '/work/3d-01/video.mp4',
        poster: '/work/3d-01/cover.webp',
      },
    ],
  },
],
```

- [x] **Step 2: Run static checks**

Run `pnpm run lint` and expect no new errors. Run `pnpm run build` and expect a successful production build; record the existing unrelated warning separately.

### Task 3: Verify the project and ordered media in the browser

**Files:**
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/MediaViewer.jsx`
- Verify: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: the single project object from Task 2
- Produces: confirmed desktop/mobile single-card layout, media order, and playable video

- [x] **Step 1: Verify the category page before interaction**

Open `http://127.0.0.1:5173/?category=3d`. Confirm exactly one card titled 瑞美亚多效修复霜三维视觉, the card uses `layout-single`, its cover is 1600×900, there is no horizontal overflow, and no video element exists before interaction.

- [x] **Step 2: Verify ordered detail images**

Open the card. Confirm the viewer contains exactly three media nodes in this order: `/work/3d-01/process-white.webp`, `/work/3d-01/render.webp`, `/work/3d-01/video.mp4`. Confirm both images report 960×1280 natural dimensions and display without clipping.

- [x] **Step 3: Verify video metadata and playback**

Confirm the video uses `/work/3d-01/cover.webp` as poster, has `preload="metadata"`, controls, inline playback, no autoplay, nonzero dimensions and duration. Briefly play and pause it, confirm current time advances, close the viewer, and confirm the video node is removed.

- [x] **Step 4: Verify mobile rendering**

Set the viewport to 390×844. Confirm the card fits one 327px-wide column, the viewer has no horizontal overflow, all three media items remain in order, and the video and close button are fully visible. Reset the viewport afterward.

- [x] **Step 5: Inspect runtime logs**

Confirm the browser console has no missing-asset, media-decoding, React, or runtime errors introduced by the change.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. The spec, plan, image dimensions, MP4 hash, build output, and browser verification provide the execution record.
