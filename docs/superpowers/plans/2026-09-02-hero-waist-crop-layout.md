# Hero Waist-Crop Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the portfolio Hero around a crisp waist-up avatar, with `HI, I'M` behind the subject and `TINGTING.` across the waist in front.

**Architecture:** Preserve the current React structure and transparent avatar asset. Make one focused interaction adjustment in `HeroAvatar`, then add scoped CSS overrides for desktop, tablet, mobile, coarse-pointer, and reduced-motion states so no other page section changes.

**Tech Stack:** React 19, Vite 8, Framer Motion, CSS custom properties and media queries
**Spec:** `docs/superpowers/specs/2026-09-02-hero-waist-crop-layout-design.md`

## Global Constraints

- Keep the Hero full viewport height and the content shell near 1200px.
- Reuse `public/hero-avatar-closeup.png`; do not regenerate or add imagery.
- Do not change navigation, later sections, contact content, or site-wide palette.
- Keep desktop pointer movement within about 7px and rotation within 1.5deg.
- Avoid horizontal overflow at 1440px, 920px, and 390px widths.
- Respect coarse pointers and `prefers-reduced-motion`.
- This workspace has no Git repository, so commit steps are intentionally omitted.

---

### Task 1: Restrain Hero pointer parallax

**Files:**
- Modify: `src/App.jsx:59-76`

**Interfaces:**
- Consumes: `HeroAvatar.handlePointerMove(event)` and the existing CSS custom properties on `.hero-avatar` and `.hero`.
- Produces: bounded `--avatar-x`, `--avatar-y`, `--avatar-rx`, `--avatar-ry`, `--decor-x`, `--decor-y`, `--hero-x`, and `--hero-y` values.

- [ ] **Step 1: Record the expected bounds**

Use these exact maximum magnitudes for a normalized pointer position of `-1…1`:

```text
avatar x: 7px      avatar y: 5px
avatar rotate x: 1.2deg   avatar rotate y: 1.5deg
decor x: 5px       decor y: 4px
hero x: 7px        hero y: 5px
```

- [ ] **Step 2: Verify the current source exceeds the target**

Run:

```powershell
rg -n "x \* 12|y \* 9|x \* 2|y \* -2" src/App.jsx
```

Expected: matches on the existing avatar transform assignments.

- [ ] **Step 3: Apply the bounded values**

Replace the transform assignments with:

```jsx
node.style.setProperty('--avatar-x', `${x * 7}px`)
node.style.setProperty('--avatar-y', `${y * 5}px`)
node.style.setProperty('--avatar-rx', `${y * -1.2}deg`)
node.style.setProperty('--avatar-ry', `${x * 1.5}deg`)
node.style.setProperty('--decor-x', `${x * -5}px`)
node.style.setProperty('--decor-y', `${y * -4}px`)
hero?.style.setProperty('--hero-x', `${x * 7}px`)
hero?.style.setProperty('--hero-y', `${y * 5}px`)
```

- [ ] **Step 4: Verify the new bounds are present**

Run:

```powershell
rg -n "x \* 7|y \* 5|1\.2|1\.5|x \* -5|y \* -4" src/App.jsx
```

Expected: all eight new assignments are represented and the old `12px / 9px / 2deg` values are absent from `handlePointerMove`.

### Task 2: Recompose the desktop waist-up Hero

**Files:**
- Modify: `src/App.css` (append scoped `.hero-closeup` overrides)

**Interfaces:**
- Consumes: `.hero-shell-layered`, `.hero-heading-layered`, `.hero-title-back`, `.hero-avatar`, `.avatar-stage`, `.hero-title-front`, `.hero-side-tag`, `.hero-note`, `.grid-stage`, `.moving-grid`, `.hero-facets`, and `.hero-grain`.
- Produces: a desktop composition with the face near the upper visual center, a natural waist crop, and distinct back/subject/front layers.

- [ ] **Step 1: Add the desktop composition override**

Append a clearly labeled Hero waist-crop section using these key values:

```css
.hero-closeup .grid-stage{top:34%;height:78%;opacity:.3}
.hero-closeup .moving-grid{top:-25%;height:150%;mask-image:linear-gradient(to bottom,transparent,black 22%,black 76%,transparent)}
.hero-closeup .hero-facets i{opacity:.2}
.hero-closeup .hero-grain{opacity:.09}
.hero-shell-layered{max-width:1200px;padding:110px 0 82px}
.hero-heading-layered .eyebrow{top:22%}
.hero-title-back{left:-1.5%;top:29%!important;font-size:clamp(110px,13.4vw,194px)!important;opacity:.78}
.hero-heading-layered .hero-note{left:0;bottom:10%;max-width:410px}
.hero-shell-layered>.hero-avatar{position:absolute;z-index:4;width:66%;height:92%;right:5%;bottom:-3%;min-height:0;margin:0}
.hero-closeup .avatar-stage{inset:-2% -4% -18% 2%;overflow:visible;transform-origin:54% 48%}
.hero-closeup .avatar-stage img{width:100%;height:122%;max-width:none;object-fit:contain;object-position:center top}
.hero-title-front{left:0;bottom:15.5%;font-size:clamp(98px,12vw,174px)}
.hero-side-tag{right:1%;top:29%}
```

Keep the avatar above `HI, I'M` (`z-index: 4 > 2`) and below `TINGTING.` (`z-index: 7`). Do not add `mix-blend-mode` to the transparent PNG.

- [ ] **Step 2: Keep the face and navigation clear**

Add a height-aware guard so shorter desktop screens preserve the top safety gap:

```css
@media (min-width:921px) and (max-height:760px){
  .hero-shell-layered>.hero-avatar{height:88%;bottom:-5%}
  .hero-title-back{top:31%!important}
  .hero-title-front{bottom:14%}
}
```

- [ ] **Step 3: Verify layer and crop declarations**

Run:

```powershell
rg -n "height:122%|bottom:-3%|top:29%|bottom:15\.5%|grid-stage\{top:34%" src/App.css
```

Expected: each desktop composition value matches once in the new override block.

### Task 3: Add tablet and phone compositions

**Files:**
- Modify: `src/App.css` (same Hero waist-crop override section)

**Interfaces:**
- Consumes: the desktop overrides from Task 2.
- Produces: stable tablet (`<=920px`) and phone (`<=620px`) crops with no side-tag collision or horizontal overflow.

- [ ] **Step 1: Add the tablet override**

Use:

```css
@media(max-width:920px){
  .hero-shell-layered{padding:104px 0 78px}
  .hero-heading-layered .eyebrow{top:17%}
  .hero-title-back{top:25%!important;left:0;font-size:clamp(82px,15.2vw,132px)!important}
  .hero-shell-layered>.hero-avatar{width:82%;height:82%;right:-8%;bottom:1%}
  .hero-closeup .avatar-stage{inset:0 -5% -17% 2%}
  .hero-closeup .avatar-stage img{height:120%;object-position:center top}
  .hero-title-front{left:0;bottom:18%;font-size:clamp(76px,14.8vw,126px)}
  .hero-heading-layered .hero-note{left:0;bottom:7.5%;max-width:330px}
  .hero-side-tag{right:1%;top:27%}
}
```

- [ ] **Step 2: Add the phone override**

Use:

```css
@media(max-width:620px){
  .hero-shell-layered{padding:94px 0 74px}
  .hero-heading-layered .eyebrow{top:13%}
  .hero-title-back{top:20%!important;left:0;font-size:20vw!important}
  .hero-shell-layered>.hero-avatar{width:128%;height:74%;right:-36%;bottom:8%}
  .hero-closeup .avatar-stage{inset:0 4% -12% 0}
  .hero-closeup .avatar-stage img{height:118%;object-position:center top}
  .hero-title-front{left:0;bottom:23%;font-size:18.5vw}
  .hero-heading-layered .hero-note{left:1%;bottom:7%;max-width:270px}
  .hero-heading-layered .hero-note p{line-height:1.55}
  .hero-side-tag{display:none}
  .hero-closeup .grid-stage{top:42%;height:68%;opacity:.22}
}
```

- [ ] **Step 3: Preserve touch and reduced-motion behavior**

Retain the existing `@media(pointer:coarse)` floating animation and existing `@media(prefers-reduced-motion:reduce)` transform reset. Ensure the new layout does not add any animation outside those established rules.

- [ ] **Step 4: Check for accidental global changes**

Run:

```powershell
rg -n "HERO WAIST-CROP|hero-closeup|hero-shell-layered|hero-title-front|hero-side-tag" src/App.css
```

Expected: the new declarations are scoped to the Hero selectors; no About, capabilities, projects, or contact selector is added to the override block.

### Task 4: Validate the local deliverable

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/App.css`
- Verify: `public/hero-avatar-closeup.png`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: a compilable local portfolio preview with its avatar asset available.

- [ ] **Step 1: Run the production build**

Run:

```powershell
pnpm.cmd run build
```

Expected: Vite exits with code 0 and writes the production bundle to `dist`.

- [ ] **Step 2: Verify the retained local preview**

Request:

```text
http://127.0.0.1:5173/#home
http://127.0.0.1:5173/hero-avatar-closeup.png
```

Expected: both return HTTP 200. Do not perform screenshot, DOM, click, or resize testing unless the user separately requests browser QA.

- [ ] **Step 3: Confirm output scope**

Run:

```powershell
Get-Item dist/index.html, public/hero-avatar-closeup.png | Select-Object FullName,Length
```

Expected: the production entry and transparent avatar are present and non-empty.
