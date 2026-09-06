# Hero Horizontal Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Hero's waist crop while showing the avatar's full left and right silhouette on desktop, tablet, and phone.

**Architecture:** Preserve the fixed vertical crop and `170%` subject height. Widen and reposition the clipping viewport at each responsive breakpoint so its horizontal bounds exceed the rendered image width, keeping the subject centered near 58% of the page without changing the image asset or Hero markup.

**Tech Stack:** React 19, Vite 8, CSS media queries
**Spec:** `docs/superpowers/specs/2026-09-02-hero-fixed-waist-crop-design.md`

## Global Constraints

- Crop only below the waist; do not clip the left or right sleeves, arms, or hair.
- Keep the desktop subject center near 58% of the page width.
- Preserve the existing 170% desktop/tablet and 166% phone vertical scale.
- Do not change Hero copy, other page sections, navigation, palette, or the PNG.
- Avoid horizontal page overflow.
- The workspace has no Git repository, so commit steps are omitted.

---

### Task 1: Expand the clipping viewport without changing the waist crop

**Files:**
- Modify: `src/App.css` in the `HERO WAIST-CROP COMPOSITION` block

**Interfaces:**
- Consumes: `.hero-shell-layered>.hero-avatar` desktop, tablet, and phone declarations.
- Produces: a wider clipping viewport at each breakpoint while `.hero` continues to suppress page-level overflow.

- [ ] **Step 1: Confirm the current narrow widths**

Run:

```powershell
rg -n "width:74%|width:82%|width:128%" src/App.css
```

Expected: all three current avatar viewport widths are found.

- [ ] **Step 2: Apply desktop positioning**

Use:

```css
.hero-shell-layered>.hero-avatar{width:96%;right:-6%}
```

The center is `100% - (-6%) - 96% / 2 = 58%`. At common 1440×900 and 1920×1080 desktop ratios, this width is larger than the rendered `170%`-height portrait image, preventing horizontal clipping.

- [ ] **Step 3: Apply tablet positioning**

Within `@media(max-width:920px)`, use:

```css
.hero-shell-layered>.hero-avatar{width:132%;right:-24%}
```

This preserves the same 58% center while allowing the avatar window to extend beyond the 1200px content shell. The outer `.hero` continues to prevent document overflow.

- [ ] **Step 4: Apply phone positioning**

Within `@media(max-width:620px)`, use:

```css
.hero-shell-layered>.hero-avatar{width:190%;right:-51%}
```

This centers the subject near 56% and makes the viewport wide enough for the full arm silhouette at `166%` image height.

- [ ] **Step 5: Verify exact responsive values**

Run:

```powershell
rg -n "width:96%;height:92%;right:-6%|width:132%;height:82%;right:-24%|width:190%;height:74%;right:-51%" src/App.css
```

Expected: desktop, tablet, and phone declarations all match.

### Task 2: Validate build and local preview availability

**Files:**
- Verify: `src/App.css`
- Verify: `public/hero-avatar-closeup.png`

**Interfaces:**
- Consumes: Task 1.
- Produces: a compilable local preview with the same waist crop and wider horizontal viewport.

- [ ] **Step 1: Run the production build**

Run the existing `pnpm run build` script with the bundled Node runtime on `PATH`.

Expected: Vite exits with code 0 and emits `dist/index.html`.

- [ ] **Step 2: Verify the local page and image**

Request `http://127.0.0.1:5173/#home` and `http://127.0.0.1:5173/hero-avatar-closeup.png`.

Expected: both return HTTP 200. Do not perform screenshot, DOM, click, or resize testing unless the user separately requests browser QA.

- [ ] **Step 3: Confirm the change is isolated**

Run:

```powershell
rg -n "HERO WAIST-CROP|width:96%|width:132%|width:190%" src/App.css
```

Expected: the new width values appear only in the Hero crop override block.
