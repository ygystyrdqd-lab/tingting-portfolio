# AIGC Video Project Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two AIGC video category demo projects with the supplied 瑞美亚精华液广告 and AOC激光投影广告 covers and MP4 videos.

**Architecture:** A focused Pillow/shutil script creates optimized WebP covers and byte-identical public MP4 copies under per-project directories. The existing project data model connects each card to one video, while the shared media viewer adds explicit metadata-only preloading.

**Tech Stack:** React, Vite, JavaScript data modules, Pillow, WebP, HTML5 video
**Spec:** `docs/superpowers/specs/2026-09-05-aigc-video-project-media-design.md`

## Global Constraints

- Do not modify or overwrite the four source media files.
- Resize both 2560×1440 covers to 1600×900 and encode WebP at quality 90 with method 6.
- Keep both MP4 files byte-identical to their sources.
- Do not render a video element until its project card is opened.
- Use `preload="metadata"`, native controls, inline mobile playback, and no autoplay.
- Preserve the current two-card category layout and avoid changes to other pages.

---

### Task 1: Produce public cover and video assets

**Files:**
- Create: `scripts/prepare_aigc_video_projects.py`
- Create: `public/work/aigc-video-01/cover.webp`
- Create: `public/work/aigc-video-01/video.mp4`
- Create: `public/work/aigc-video-02/cover.webp`
- Create: `public/work/aigc-video-02/video.mp4`

**Interfaces:**
- Consumes: four source files under `../AIGC视频广告`
- Produces: stable public paths `/work/aigc-video-01/{cover.webp,video.mp4}` and `/work/aigc-video-02/{cover.webp,video.mp4}`

- [x] **Step 1: Add the asset preparation script**

```python
from pathlib import Path
import shutil

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "AIGC视频广告"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work"

PROJECTS = (
    ("aigc-video-01", "精华液广告 (1)-封面.jpg", "精华液广告.mp4"),
    ("aigc-video-02", "投影仪-封面.jpg", "投影仪广告.mp4"),
)

for project_id, cover_name, video_name in PROJECTS:
    output_dir = OUTPUT_ROOT / project_id
    output_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(SOURCE_ROOT / cover_name) as image:
        image = image.convert("RGB")
        if image.size != (2560, 1440):
            raise ValueError(f"{cover_name}: expected (2560, 1440), got {image.size}")
        image = image.resize((1600, 900), Image.Resampling.LANCZOS)
        image.save(output_dir / "cover.webp", "WEBP", quality=90, method=6)

    shutil.copy2(SOURCE_ROOT / video_name, output_dir / "video.mp4")
```

- [x] **Step 2: Run the script with the bundled Python runtime**

Expected: four assets exist in the two public project directories; covers are 1600×900 WebP files.

- [x] **Step 3: Verify generated media**

Use Pillow to assert both covers are `WEBP` and exactly 1600×900. Calculate SHA-256 for each source/output MP4 pair and assert the hashes match; also confirm the four source files still exist at their original paths.

### Task 2: Connect project data and metadata-only video loading

**Files:**
- Modify: `src/data/workCategories.js:123-144`
- Modify: `src/components/work/MediaViewer.jsx:31`

**Interfaces:**
- Consumes: public assets produced by Task 1
- Produces: two `project` objects containing `cover` and one `{ type: 'video', src, poster }` media object

- [x] **Step 1: Replace the AIGC project objects**

```js
projects: [
  {
    id: 'aigc-video-01',
    title: '瑞美亚精华液广告',
    meta: 'AIGC · BEAUTY AD',
    cover: '/work/aigc-video-01/cover.webp',
    media: [
      {
        type: 'video',
        src: '/work/aigc-video-01/video.mp4',
        poster: '/work/aigc-video-01/cover.webp',
      },
    ],
  },
  {
    id: 'aigc-video-02',
    title: 'AOC激光投影广告',
    meta: 'AIGC · PRODUCT AD',
    cover: '/work/aigc-video-02/cover.webp',
    media: [
      {
        type: 'video',
        src: '/work/aigc-video-02/video.mp4',
        poster: '/work/aigc-video-02/cover.webp',
      },
    ],
  },
],
```

- [x] **Step 2: Add explicit metadata-only preloading**

Change the existing video render branch to:

```jsx
if (media.type === 'video') return <video
  key={`${media.src}-${index}`}
  src={media.src}
  poster={media.poster}
  preload="metadata"
  controls
  playsInline
/>
```

- [x] **Step 3: Run static checks**

Run `pnpm run lint` and expect no new errors. Run `pnpm run build` and expect a successful production build; record the existing unrelated warning separately.

### Task 3: Verify cards and video playback in the browser

**Files:**
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/MediaViewer.jsx`
- Verify: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: project objects and public media from Tasks 1–2
- Produces: confirmed desktop/mobile rendering, lazy DOM creation, and usable video playback

- [x] **Step 1: Verify the desktop category page before interaction**

Open `http://127.0.0.1:5173/?category=aigc-video`. Confirm exactly two cards, correct titles and covers, no horizontal overflow, no `<video>` element, and no MP4 resource entry before a card is opened.

- [x] **Step 2: Verify 瑞美亚精华液广告**

Open the first card. Confirm one video element with source `/work/aigc-video-01/video.mp4`, poster `/work/aigc-video-01/cover.webp`, `preload="metadata"`, usable native controls, nonzero video dimensions and duration, and no autoplay. Close the viewer and confirm the video element is removed.

- [x] **Step 3: Verify AOC激光投影广告**

Open the second card. Confirm one video element with source `/work/aigc-video-02/video.mp4`, poster `/work/aigc-video-02/cover.webp`, `preload="metadata"`, usable native controls, nonzero video dimensions and duration, and no autoplay. Close the viewer and confirm the video element is removed.

- [x] **Step 4: Verify mobile layout**

Set the viewport to 390×844. Confirm cards form one 327px-wide column, the video viewer fits without horizontal overflow, the 16:9 player and close control are fully visible, and the video remains inline. Reset the viewport afterward.

- [x] **Step 5: Inspect runtime logs**

Confirm the browser console has no missing-asset, media-decoding, React, or runtime errors introduced by this change.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. The spec, plan, asset hashes, build output, and browser verification provide the execution record.
