# Hero Fixed Waist Crop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Hero avatar visibly end just below the belt while preserving the face, hair, shoulders, arms, title layering, and restrained pointer motion.

**Architecture:** Keep the existing `HeroAvatar` markup and transparent PNG. Convert `.avatar-stage` into the fixed clipping viewport and move the pointer transform onto its child image, so the crop boundary remains stable while the subject moves inside it; use responsive image-height ratios for desktop, tablet, and phone.

**Tech Stack:** React 19, Vite 8, CSS custom properties and media queries
**Spec:** `docs/superpowers/specs/2026-09-02-hero-fixed-waist-crop-design.md`

## Global Constraints

- Reuse `public/hero-avatar-closeup.png` without modifying it.
- Crop just below the belt on desktop; preserve the full head, hair, shoulders, and primary arm silhouette.
- Preserve existing Hero copy, palette, navigation, later sections, and title z-index order.
- Keep the crop stable during pointer interaction.
- Preserve coarse-pointer and reduced-motion behavior.
- Avoid horizontal overflow at 1440px, 920px, and 390px.
- The workspace has no Git repository, so commit steps are omitted.

---

### Task 1: Convert the avatar stage into a true clipping viewport

**Files:**
- Modify: `src/App.css` in the `HERO WAIST-CROP COMPOSITION` block

**Interfaces:**
- Consumes: `.hero-shell-layered>.hero-avatar`, `.hero-closeup .avatar-stage`, `.hero-closeup .avatar-stage img`, and the existing `--avatar-*` custom properties.
- Produces: a stable clipping viewport with the subject moving inside it.

- [ ] **Step 1: Confirm the current non-clipping declarations**

Run:

```powershell
rg -n "overflow:visible|height:122%|height:120%|height:118%" src/App.css
```

Expected: the current waist-crop block still uses visible overflow and insufficient image height.

- [ ] **Step 2: Fix the desktop crop window**

Replace the desktop declarations with:

```css
.hero-shell-layered>.hero-avatar{position:absolute;z-index:4;width:74%;height:92%;right:5%;bottom:-3%;min-height:0;margin:0}
.hero-closeup .avatar-stage{inset:-2% -2% 0 0;overflow:hidden;transform:none;transform-origin:54% 48%}
.hero-closeup .hero-avatar:hover .avatar-stage{transform:none}
.hero-closeup .avatar-stage img{position:absolute;left:50%;top:0;width:auto;height:170%;max-width:none;object-fit:contain;object-position:center top;transform:translate3d(calc(-50% + var(--avatar-x)),var(--avatar-y),30px) rotateX(var(--avatar-rx)) rotateY(var(--avatar-ry));transform-origin:50% 38%;transition:transform .65s cubic-bezier(.18,.8,.2,1),filter .55s}
```

The image's belt sits at approximately `0.58 × 170% = 98.6%` of the clipping window, producing the required crop just below the belt.

- [ ] **Step 3: Verify the old crop values are absent**

Run:

```powershell
rg -n "overflow:visible|height:122%|height:120%|height:118%" src/App.css
```

Expected: no matches remain in the final override block.

### Task 2: Lock tablet, phone, touch, and reduced-motion states

**Files:**
- Modify: `src/App.css` in the Hero media-query overrides

**Interfaces:**
- Consumes: the fixed clipping viewport from Task 1.
- Produces: `170%` tablet and `166%` phone image scaling, a subtle touch float on the image, and a stable reduced-motion transform.

- [ ] **Step 1: Set the tablet crop**

Within `@media(max-width:920px)`, keep the existing avatar box and replace its image rule with:

```css
.hero-closeup .avatar-stage{inset:0 -3% 0 1%}
.hero-closeup .avatar-stage img{height:170%}
```

- [ ] **Step 2: Set the phone crop**

Within `@media(max-width:620px)`, use:

```css
.hero-closeup .avatar-stage{inset:0 4% 0 0}
.hero-closeup .avatar-stage img{height:166%}
```

This retains slightly more of the garment on narrow screens without returning to a thigh-length view.

- [ ] **Step 3: Move touch animation to the image**

Add:

```css
@keyframes avatarImageFloat{
  0%,100%{transform:translate3d(-50%,0,30px)}
  50%{transform:translate3d(-50%,-5px,34px)}
}
@media(pointer:coarse){
  .hero-closeup .avatar-stage{animation:none}
  .hero-closeup .avatar-stage img{animation:avatarImageFloat 6.5s ease-in-out infinite}
}
```

- [ ] **Step 4: Stabilize reduced motion**

Add:

```css
@media(prefers-reduced-motion:reduce){
  .hero-closeup .avatar-stage img{transform:translate3d(-50%,0,30px)!important;transition:none!important;animation:none!important}
}
```

- [ ] **Step 5: Verify the responsive ratios and accessibility state**

Run:

```powershell
rg -n "height:170%|height:166%|avatarImageFloat|prefers-reduced-motion" src/App.css
```

Expected: desktop/tablet `170%`, phone `166%`, touch float, and reduced-motion reset are present.

### Task 3: Validate the local deliverable

**Files:**
- Verify: `src/App.css`
- Verify: `public/hero-avatar-closeup.png`

**Interfaces:**
- Consumes: Tasks 1–2.
- Produces: a compilable local preview with a stable waist crop and available avatar asset.

- [ ] **Step 1: Run the production build**

Run the existing `pnpm run build` script with the bundled Node runtime on `PATH`.

Expected: Vite exits with code 0 and emits `dist/index.html`.

- [ ] **Step 2: Verify the local route and asset**

Request `http://127.0.0.1:5173/#home` and `http://127.0.0.1:5173/hero-avatar-closeup.png`.

Expected: both return HTTP 200. Do not perform screenshots, DOM inspection, clicking, or resize testing unless the user separately requests browser QA.

- [ ] **Step 3: Confirm scope**

Run:

```powershell
rg -n "HERO WAIST-CROP|avatar-stage|avatarImageFloat" src/App.css
```

Expected: changes remain scoped to the Hero avatar and do not include selectors for About, capabilities, projects, or contact.
