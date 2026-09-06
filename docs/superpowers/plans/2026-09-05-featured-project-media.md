# Featured Project Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fifth-screen abstract visuals and three empty secondary projects with optimized covers and ordered detail images from the local `项目` folder.

**Architecture:** A focused Pillow script converts the eight immutable source images into stable high-quality WebP assets. The existing `featuredWorkCategories` objects become the single source of truth for fifth-screen covers and secondary-page media, while the existing card, route, animation, and media-viewer components remain in place.

**Tech Stack:** React, Vite, JavaScript data modules, Pillow, WebP, GSAP-compatible DOM attributes
**Spec:** `docs/superpowers/specs/2026-09-05-featured-project-media-design.md`

## Global Constraints

- Do not modify, move, rename, or delete any source file under `../项目`.
- Encode every output as RGB WebP with quality 90 and method 6.
- Resize only the three 2400×1200 covers to 1600×800.
- Preserve every detail image at its original pixel dimensions and aspect ratio.
- Preserve ecommerce detail order: `投影仪首图1.png`, `投影仪首图2.png`, `投影仪电商网站.png`.
- Keep exactly one project per featured secondary page.
- Preserve fifth-screen Spotlight, sticky stack, scroll reveal, parallax, links, and card count.
- Do not change fourth-screen categories or any existing media.

---

### Task 1: Define the expected featured project media

**Files:**
- Modify: `scripts/verify_featured_categories.mjs`

**Interfaces:**
- Consumes: `featuredWorkCategories` from `src/data/workCategories.js`
- Produces: assertions for the three exact project titles, covers, media arrays, media order, and generated file existence

- [x] **Step 1: Extend the existing verification script**

Add these imports beside the existing imports, then add the remaining assertions after the current category assertions:

```js
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const expectedProjects = [
  {
    slug: 'ip-visual',
    title: '花小灵IP形象设计',
    cover: '/work/ip-visual-01/cover.webp',
    media: ['/work/ip-visual-01/detail-01.webp'],
  },
  {
    slug: 'campaign-visual',
    title: 'AOC投影仪电商视觉',
    cover: '/work/campaign-visual-01/cover.webp',
    media: [
      '/work/campaign-visual-01/detail-01.webp',
      '/work/campaign-visual-01/detail-02.webp',
      '/work/campaign-visual-01/detail-03.webp',
    ],
  },
  {
    slug: 'aigc-workflow',
    title: 'AI空间场景生成工作流',
    cover: '/work/aigc-workflow-01/cover.webp',
    media: ['/work/aigc-workflow-01/detail-01.webp'],
  },
]

for (const expected of expectedProjects) {
  const category = getWorkCategory(expected.slug)
  const project = category.projects[0]
  assert.equal(project.title, expected.title)
  assert.equal(project.cover, expected.cover)
  assert.deepEqual(project.media.map(({ src }) => src), expected.media)
  assert.ok(project.media.every(({ type }) => type === 'image'))
  for (const publicPath of [expected.cover, ...expected.media]) {
    await access(path.join(projectRoot, 'public', publicPath.replace(/^\//, '')))
  }
}
```

Remove the old assertion `assert.deepEqual(category.projects[0].media, [])` because media is no longer empty.

- [x] **Step 2: Run the verification script and confirm it fails before implementation**

Run: `node scripts/verify_featured_categories.mjs`

Expected: FAIL because the featured projects still use placeholder titles, have no covers, and have empty media arrays.

### Task 2: Generate optimized public WebP assets

**Files:**
- Create: `scripts/prepare_featured_project_media.py`
- Create: `public/work/ip-visual-01/cover.webp`
- Create: `public/work/ip-visual-01/detail-01.webp`
- Create: `public/work/campaign-visual-01/cover.webp`
- Create: `public/work/campaign-visual-01/detail-01.webp`
- Create: `public/work/campaign-visual-01/detail-02.webp`
- Create: `public/work/campaign-visual-01/detail-03.webp`
- Create: `public/work/aigc-workflow-01/cover.webp`
- Create: `public/work/aigc-workflow-01/detail-01.webp`

**Interfaces:**
- Consumes: eight source images under `../项目`
- Produces: stable public WebP files referenced by Task 3

- [x] **Step 1: Add the asset preparation script**

Create `scripts/prepare_featured_project_media.py`:

```python
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "项目"
PUBLIC_ROOT = PROJECT_ROOT / "public" / "work"

IMAGES = (
    ("IP封面.jpg", "ip-visual-01/cover.webp", (2400, 1200), (1600, 800)),
    ("花小灵IP设计.jpg", "ip-visual-01/detail-01.webp", (1920, 2987), None),
    ("电商封面.jpg", "campaign-visual-01/cover.webp", (2400, 1200), (1600, 800)),
    ("投影仪首图1.png", "campaign-visual-01/detail-01.webp", (1254, 1254), None),
    ("投影仪首图2.png", "campaign-visual-01/detail-02.webp", (1254, 1254), None),
    ("投影仪电商网站.png", "campaign-visual-01/detail-03.webp", (1920, 6000), None),
    ("AIGC工作流封面.jpg", "aigc-workflow-01/cover.webp", (2400, 1200), (1600, 800)),
    ("合成1.png", "aigc-workflow-01/detail-01.webp", (2000, 2000), None),
)

for source_name, public_name, expected_size, target_size in IMAGES:
    output_path = PUBLIC_ROOT / public_name
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE_ROOT / source_name) as image:
        if image.size != expected_size:
            raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
        image = image.convert("RGB")
        if target_size:
            image = image.resize(target_size, Image.Resampling.LANCZOS)
        image.save(output_path, "WEBP", quality=90, method=6)
```

- [x] **Step 2: Run the preparation script with the bundled Python runtime**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\prepare_featured_project_media.py
```

Expected: eight WebP files created under the three public project directories.

- [x] **Step 3: Verify formats, dimensions, and source preservation**

Use Pillow to assert these exact output dimensions:

```python
EXPECTED = {
    "ip-visual-01/cover.webp": (1600, 800),
    "ip-visual-01/detail-01.webp": (1920, 2987),
    "campaign-visual-01/cover.webp": (1600, 800),
    "campaign-visual-01/detail-01.webp": (1254, 1254),
    "campaign-visual-01/detail-02.webp": (1254, 1254),
    "campaign-visual-01/detail-03.webp": (1920, 6000),
    "aigc-workflow-01/cover.webp": (1600, 800),
    "aigc-workflow-01/detail-01.webp": (2000, 2000),
}
```

Confirm every output format is `WEBP`. Record the eight source file sizes before and after generation and assert they are unchanged.

### Task 3: Connect covers, project names, and ordered detail images

**Files:**
- Modify: `src/data/workCategories.js`

**Interfaces:**
- Consumes: stable WebP paths from Task 2
- Produces: one cover and ordered image media array for each featured project

- [x] **Step 1: Replace the three placeholder project objects**

Set the IP project to:

```js
{
  id: 'ip-visual-01',
  title: '花小灵IP形象设计',
  meta: 'IP · CHARACTER SYSTEM',
  cover: '/work/ip-visual-01/cover.webp',
  media: [
    { type: 'image', src: '/work/ip-visual-01/detail-01.webp', alt: '花小灵IP形象设计作品详情' },
  ],
}
```

Set the ecommerce and campaign project to:

```js
{
  id: 'campaign-visual-01',
  title: 'AOC投影仪电商视觉',
  meta: 'CAMPAIGN · E-COMMERCE',
  cover: '/work/campaign-visual-01/cover.webp',
  media: [
    { type: 'image', src: '/work/campaign-visual-01/detail-01.webp', alt: 'AOC投影仪电商视觉首图一' },
    { type: 'image', src: '/work/campaign-visual-01/detail-02.webp', alt: 'AOC投影仪电商视觉首图二' },
    { type: 'image', src: '/work/campaign-visual-01/detail-03.webp', alt: 'AOC投影仪电商视觉长页详情' },
  ],
}
```

Set the AIGC project to:

```js
{
  id: 'aigc-workflow-01',
  title: 'AI空间场景生成工作流',
  meta: 'AIGC · CREATIVE WORKFLOW',
  cover: '/work/aigc-workflow-01/cover.webp',
  media: [
    { type: 'image', src: '/work/aigc-workflow-01/detail-01.webp', alt: 'AI空间场景生成与合成工作流详情' },
  ],
}
```

- [x] **Step 2: Run the category verification script**

Run: `node scripts/verify_featured_categories.mjs`

Expected: `featured category data verified`.

### Task 4: Render real covers in the fifth-screen cards

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `project.projects[0].cover` from each featured category
- Produces: real cover images inside the existing parallax and reveal layers

- [x] **Step 1: Render a cover inside the existing parallax wrapper**

In the fifth-screen `Projects` card, replace the three shapes inside `.project-art-inner` with a cover-aware branch:

```jsx
<div className={`project-art${project.projects[0].cover ? ' has-cover' : ''}`} data-reveal-media>
  <div className="project-art-inner" data-parallax>
    {project.projects[0].cover
      ? <img src={project.projects[0].cover} alt="" loading="lazy" decoding="async" />
      : <><div className="shape shape-one" /><div className="shape shape-two" /><div className="shape shape-three" /></>}
  </div>
  <span>PROJECT PREVIEW</span>
</div>
```

Keep all surrounding links, titles, metadata, keys, and animation attributes unchanged.

- [x] **Step 2: Style the cover and readability overlay**

Add:

```css
.project-art.has-cover:after{content:"";position:absolute;z-index:1;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(5,4,4,.58))}
.project-art.has-cover .project-art-inner{inset:0;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.project-art.has-cover img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
.project-card:hover .project-art.has-cover .project-art-inner{transform:scale(1.025)}
.project-art.has-cover>span{z-index:2;padding:8px 10px;border-radius:999px;background:rgba(8,7,6,.48);backdrop-filter:blur(8px)}
```

Keep the existing abstract-shape CSS as a fallback and do not change card dimensions or sticky behavior.

- [x] **Step 3: Run static checks**

Run `pnpm run lint` and `pnpm run build` in parallel.

Expected: successful build, no new lint errors, and only the existing unrelated Fast Refresh warning in `src/components/ui/button.tsx` if still present.

### Task 5: Verify covers and secondary media in the browser

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/data/workCategories.js`
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/MediaViewer.jsx`

**Interfaces:**
- Consumes: three fifth-screen cards and three featured secondary routes
- Produces: confirmed desktop/mobile cover rendering, media order, dimensions, and runtime stability

- [x] **Step 1: Verify fifth-screen covers**

Open `http://127.0.0.1:5173/#projects`. Confirm exactly three `.project-card` links remain, each contains one cover image with a natural size of 1600×800 and these paths in order: IP, campaign, AIGC. Confirm the Spotlight element and `data-parallax` wrapper remain present.

- [x] **Step 2: Verify IP details**

Open `?category=ip-visual`. Confirm one card titled `花小灵IP形象设计`, cover size 1600×800, and one viewer image at 1920×2987 with no clipping.

- [x] **Step 3: Verify ecommerce details and order**

Open `?category=campaign-visual`. Confirm one card titled `AOC投影仪电商视觉`, then confirm exactly three viewer images in the path order `detail-01`, `detail-02`, `detail-03`, with natural sizes 1254×1254, 1254×1254, and 1920×6000.

- [x] **Step 4: Verify AIGC details**

Open `?category=aigc-workflow`. Confirm one card titled `AI空间场景生成工作流`, cover size 1600×800, and one viewer image at 2000×2000.

- [x] **Step 5: Verify mobile layout**

Set the viewport to 390×844. Confirm fifth-screen cards, all three secondary-page covers, and each open media viewer have zero horizontal overflow; confirm the ecommerce long image scales to the viewer width with natural height and the close button remains visible. Reset the viewport.

- [x] **Step 6: Inspect runtime logs**

Confirm no missing-asset, image-decoding, React, or runtime errors were introduced.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. The specification, checked plan, image-dimension verification, data assertions, build output, and browser checks provide the execution record.
