# Intro Fan Portfolio Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the five abstract intro-card artworks with optimized portfolio images in filename order while preserving the existing fan geometry and motion.

**Architecture:** A small Pillow script creates reproducible `960×1280` WebP derivatives from the untouched JPG sources. `IntroHero` supplies the generated paths and accessible descriptions to native image elements; `IntroHero.css` owns cover cropping and the readability gradient, while GSAP continues to animate only the card containers.

**Tech Stack:** React 19, CSS, Pillow 12.3 with WebP support, Vite 8, existing GSAP 3 timeline
**Spec:** `docs/superpowers/specs/2026-09-04-intro-fan-portfolio-images-design.md`

## Global Constraints

- Preserve all five original `1200×1600px` JPG files without modification.
- Generate exactly five `960×1280px` WebP files at quality `86`.
- Map `1.jpg` through `5.jpg` from left to right; `3.jpg` remains the center card.
- Keep the existing card copy, fan positions, center-card `1.2×` geometry, opening timeline, and hover motion unchanged.
- Use eager loading for all five images and high fetch priority only for the center image.
- Add no package dependency; use the bundled Pillow 12.3 runtime already verified to support WebP.
- This workspace is not a Git repository, so commit steps are intentionally omitted.

---

## File Structure

- `scripts/optimize_intro_cards.py`: reproducibly converts the five source JPGs into website-ready WebP assets.
- `public/intro-cards/intro-card-01.webp` through `intro-card-05.webp`: generated display assets.
- `src/components/hero/IntroHero.jsx`: maps image paths and alt text into the five existing cards.
- `src/components/hero/IntroHero.css`: renders the real images and bottom readability gradient.

### Task 1: Generate optimized WebP assets

**Files:**
- Create: `scripts/optimize_intro_cards.py`
- Create: `public/intro-cards/intro-card-01.webp`
- Create: `public/intro-cards/intro-card-02.webp`
- Create: `public/intro-cards/intro-card-03.webp`
- Create: `public/intro-cards/intro-card-04.webp`
- Create: `public/intro-cards/intro-card-05.webp`

**Interfaces:**
- Consumes: `../首屏图片/1.jpg` through `../首屏图片/5.jpg`, resolved relative to the workspace root.
- Produces: predictable public URLs `/intro-cards/intro-card-01.webp` through `/intro-cards/intro-card-05.webp`.

- [ ] **Step 1: Create the reproducible optimizer**

Create `scripts/optimize_intro_cards.py` with:

```python
from pathlib import Path

from PIL import Image, ImageOps


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT_ROOT.parent / "首屏图片"
OUTPUT_DIR = PROJECT_ROOT / "public" / "intro-cards"
TARGET_SIZE = (960, 1280)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for index in range(1, 6):
        source = SOURCE_DIR / f"{index}.jpg"
        output = OUTPUT_DIR / f"intro-card-{index:02d}.webp"
        with Image.open(source) as image:
            optimized = ImageOps.fit(
                image.convert("RGB"),
                TARGET_SIZE,
                method=Image.Resampling.LANCZOS,
                centering=(0.5, 0.5),
            )
            optimized.save(output, "WEBP", quality=86, method=6)
        print(f"{source.name} -> {output.name}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the optimizer with the bundled Python runtime**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\optimize_intro_cards.py
```

Expected: five `source -> output` lines and no Pillow exception.

- [ ] **Step 3: Verify dimensions, format, and size reduction**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -c "from pathlib import Path; from PIL import Image; files=sorted(Path('public/intro-cards').glob('*.webp')); print([(p.name, Image.open(p).size, Image.open(p).format, p.stat().st_size) for p in files]); print('total', sum(p.stat().st_size for p in files))"
```

Expected: five entries, each with `(960, 1280)` and `WEBP`; their combined byte size is lower than the JPG source total.

### Task 2: Render real images in the existing cards

**Files:**
- Modify: `src/components/hero/IntroHero.jsx:4-9`
- Modify: `src/components/hero/IntroHero.jsx:26`

**Interfaces:**
- Consumes: the five generated `/intro-cards/intro-card-0N.webp` URLs.
- Produces: native `<img>` elements inside every `.intro-card__art` container.

- [ ] **Step 1: Add image paths and descriptions to the card data**

Replace `introCards` with:

```jsx
const introCards = [
  { number: '01', title: 'Brand System', label: '品牌视觉', tone: 'brand', image: '/intro-cards/intro-card-01.webp', alt: 'AOC K1S Ultra 投影仪视觉作品' },
  { number: '02', title: 'Campaign', label: '活动视觉', tone: 'campaign', image: '/intro-cards/intro-card-02.webp', alt: '无线耳机产品视觉作品' },
  { number: '03', title: 'Visual Direction', label: '视觉创意', tone: 'visual', image: '/intro-cards/intro-card-03.webp', alt: 'Medical Cold Paste 面膜包装视觉作品' },
  { number: '04', title: '3D & AIGC', label: '三维实验', tone: 'aigc', image: '/intro-cards/intro-card-04.webp', alt: 'Eternal Cell 精华液视觉作品' },
  { number: '05', title: 'Packaging', label: '包装延展', tone: 'packaging', image: '/intro-cards/intro-card-05.webp', alt: 'Rhea 修复霜产品视觉作品' },
]
```

- [ ] **Step 2: Replace the abstract artwork elements**

Replace:

```jsx
<div className="intro-card__art" aria-hidden="true"><i /><i /><i /></div>
```

with:

```jsx
<div className="intro-card__art">
  <img
    src={card.image}
    alt={card.alt}
    loading="eager"
    decoding="async"
    fetchPriority={index === 2 ? 'high' : 'auto'}
  />
</div>
```

- [ ] **Step 3: Run the JSX static check**

Run:

```powershell
pnpm run lint
```

Expected: no new React or accessibility warning; the pre-existing `react(only-export-components)` warning in `src/components/ui/button.tsx` may remain.

### Task 3: Style image cropping and text readability

**Files:**
- Modify: `src/components/hero/IntroHero.css:29-45`

**Interfaces:**
- Consumes: `.intro-card__art > img` from Task 2.
- Produces: undistorted cover rendering with a stable bottom text gradient.

- [ ] **Step 1: Replace the abstract-art rules with image rules**

Replace `.intro-card__art` and all now-unused `.intro-card__art i` and tone-specific art rules with:

```css
.intro-card__art{position:absolute;inset:0;overflow:hidden;background:#120d0b}
.intro-card__art img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}
.intro-card__art:after{content:"";position:absolute;inset:32% 0 0;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(8,6,5,.18) 42%,rgba(8,6,5,.88) 100%)}
```

Keep the card-level tone background classes because they provide a fallback color while images decode.

- [ ] **Step 2: Build the production bundle**

Run:

```powershell
pnpm run build
```

Expected: Vite exits with code `0` and copies all five WebP assets into `dist/intro-cards/`.

### Task 4: Verify visual quality and loading behavior

**Files:**
- Verify: `public/intro-cards/*.webp`
- Verify: `src/components/hero/IntroHero.jsx`
- Verify: `src/components/hero/IntroHero.css`

**Interfaces:**
- Consumes: the local preview at `http://127.0.0.1:5173/#home`.
- Produces: visual and runtime confirmation for image order, crop quality, animation, and responsive behavior.

- [ ] **Step 1: Reload and watch the full opening**

Expected order:

```text
projector → earbuds → mask packaging → serum → repair cream
```

Confirm the mask packaging is the enlarged center card and no image flashes in late during the fan expansion.

- [ ] **Step 2: Inspect final desktop/tablet rendering**

Expected: all products remain recognizable, images are not stretched, card labels remain readable, and the center card retains its clearance below the intro copy.

- [ ] **Step 3: Inspect mobile rendering**

At `390×844`, confirm the center product is visible, outer cards crop only at the composition edges, and the page adds no intro-section horizontal scrollbar.

- [ ] **Step 4: Check asset requests and console state**

Expected: all five WebP requests return successfully and there are no new console errors.

- [ ] **Step 5: Run final regression checks**

Run:

```powershell
pnpm run lint
pnpm run build
```

Expected: production build succeeds and no new lint issue is present.
