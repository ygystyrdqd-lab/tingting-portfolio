# Intro Card and 3D Render Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fifth intro fan image and the 3D cream detail render with the user's latest local assets while preserving current URLs, layout, animation, and unrelated project media.

**Architecture:** Extend the existing image-preparation scripts with focused command-line selection so only the requested outputs are regenerated. Use Pillow for deterministic Lanczos resize and high-quality WebP output, capture hashes for protected media before processing, then verify dimensions, changed hashes, unchanged protected hashes, and rendered browser views.

**Tech Stack:** Python 3, Pillow, React/Vite static assets, Node.js project verifiers
**Spec:** `docs/superpowers/specs/2026-09-11-intro-card-and-3d-render-replacement-design.md`

## Global Constraints

- Source the fifth intro image only from `C:\Users\Mayn\Desktop\作品集\首屏图片\5.jpg`.
- Source the cream render only from `C:\Users\Mayn\Desktop\作品集\作品\4三维视觉\渲染面霜.png`.
- Produce 960 × 1280 WebP files at the existing public paths.
- Use WebP quality 90 for the intro card and quality 92 for the detail render, both with method 6.
- Do not change `cover.webp`, `process-white.webp`, `video.mp4`, components, data, routes, animation, or copy.
- Do not publish; update and verify the local version only.

## File Structure

- Modify `scripts/optimize_intro_cards.py`: add `--index` selection and raise output quality to 90.
- Modify `scripts/prepare_3d_cream_project.py`: correct the source directory, update expected source dimensions, and add `--render-only` selection.
- Modify `public/intro-cards/intro-card-05.webp`: regenerated fifth intro image.
- Modify `public/work/3d-01/render.webp`: regenerated 3D cream detail image.

---

### Task 1: Add focused generation controls

**Files:**
- Modify: `scripts/optimize_intro_cards.py`
- Modify: `scripts/prepare_3d_cream_project.py`

**Interfaces:**
- Produces: `python scripts/optimize_intro_cards.py --index 5` and `python scripts/prepare_3d_cream_project.py --render-only`.
- Consumes: the exact source paths and output paths in Global Constraints.

- [ ] **Step 1: Confirm the intro-card selector is not yet implemented**

Run:

```powershell
rg -n "argparse|--index" scripts/optimize_intro_cards.py
```

Expected before implementation: no match and exit code 1. This check is read-only and must not regenerate any image.

- [ ] **Step 2: Add `--index` to the intro-card script**

Import `argparse`, add a parser with `choices=range(1, 6)`, and replace the fixed loop with:

```python
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Optimize intro fan-card images")
    parser.add_argument("--index", type=int, choices=range(1, 6))
    return parser.parse_args()


args = parse_args()
indices = (args.index,) if args.index else range(1, 6)
for index in indices:
    source = SOURCE_DIR / f"{index}.jpg"
    output = OUTPUT_DIR / f"intro-card-{index:02d}.webp"
    with Image.open(source) as image:
        optimized = ImageOps.fit(
            image.convert("RGB"),
            TARGET_SIZE,
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
        optimized.save(output, "WEBP", quality=90, method=6)
```

- [ ] **Step 3: Confirm focused 3D generation and the new source path are absent**

Run:

```powershell
rg -n -- "--render-only|作品.*4三维视觉" scripts/prepare_3d_cream_project.py
```

Expected before implementation: no match and exit code 1.

- [ ] **Step 4: Correct the 3D source and implement `--render-only`**

Set:

```python
SOURCE_ROOT = PROJECT_ROOT.parent / "作品" / "4三维视觉"
```

Update the image table to:

```python
IMAGES = (
    ("3MP4_0001.jpg", "cover.webp", (1920, 1080), (1600, 900), 90),
    ("白膜面霜.png", "process-white.webp", (960, 1280), None, 90),
    ("渲染面霜.png", "render.webp", (1086, 1448), (960, 1280), 92),
)
```

Add the following control flow so `--render-only` selects only `render.webp`, each tuple supplies its own quality, and the video is untouched in focused mode:

```python
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare 3D cream project media")
    parser.add_argument("--render-only", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    images = tuple(item for item in IMAGES if item[1] == "render.webp") if args.render_only else IMAGES
    for source_name, output_name, expected_size, target_size, quality in images:
        with Image.open(SOURCE_ROOT / source_name) as image:
            image = image.convert("RGB")
            if image.size != expected_size:
                raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
            if target_size:
                image = image.resize(target_size, Image.Resampling.LANCZOS)
            image.save(OUTPUT_ROOT / output_name, "WEBP", quality=quality, method=6)
    if not args.render_only:
        shutil.copy2(SOURCE_ROOT / "面霜视频终.mp4", OUTPUT_ROOT / "video.mp4")


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Commit the focused pipeline changes**

```powershell
git add scripts/optimize_intro_cards.py scripts/prepare_3d_cream_project.py
git commit -m "build: target selected portfolio images"
```

---

### Task 2: Regenerate and verify the selected images

**Files:**
- Modify: `public/intro-cards/intro-card-05.webp`
- Modify: `public/work/3d-01/render.webp`
- Test: existing source/data verification scripts and local browser

**Interfaces:**
- Consumes: the two focused commands created in Task 1.
- Produces: two valid 960 × 1280 WebP assets at the existing public URLs.

- [ ] **Step 1: Record protected and replacement hashes**

Record SHA-256 hashes for:

```text
public/intro-cards/intro-card-05.webp
public/work/3d-01/render.webp
public/work/3d-01/cover.webp
public/work/3d-01/process-white.webp
public/work/3d-01/video.mp4
```

- [ ] **Step 2: Generate only the selected outputs**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\optimize_intro_cards.py --index 5
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\prepare_3d_cream_project.py --render-only
```

Expected: only `intro-card-05.webp` and `render.webp` are written.

- [ ] **Step 3: Verify image dimensions and hash protection**

Use Pillow to open both outputs and assert `image.size == (960, 1280)` and `image.format == 'WEBP'`. Confirm both replacement hashes changed, while the hashes for `cover.webp`, `process-white.webp`, and `video.mp4` exactly match Step 1.

- [ ] **Step 4: Run project checks**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run verify:desktop-experience
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\prepare_3d_cream_project.py --help
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run build
```

Expected: all commands pass and the help output documents `--render-only`.

- [ ] **Step 5: Inspect both rendered locations**

At a 1646 × 912 desktop viewport, inspect `http://localhost:5174/#home` after the opening overlay and verify the fifth fan card shows the new bright gold cream image without stretching. Then open `http://localhost:5174/?category=3d`, open the cream project, and verify the second detail image shows the new sharper render without stretching.

- [ ] **Step 6: Commit the selected assets**

```powershell
git add public/intro-cards/intro-card-05.webp public/work/3d-01/render.webp
git commit -m "feat: refresh intro and 3d cream imagery"
```
