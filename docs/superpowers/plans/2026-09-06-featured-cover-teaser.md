# Featured Cover Teaser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the fifth-screen covers a dark, cropped teaser state that smoothly reveals fuller color on hover or keyboard focus while keeping secondary-page covers unchanged.

**Architecture:** Implement the effect entirely in fifth-screen `.project-art.has-cover` CSS. Apply scale and filters to the image rather than the `data-parallax` wrapper so GSAP transforms do not conflict; use pseudo-element tint overlays and media queries for coarse pointers and reduced motion.

**Tech Stack:** CSS, React-rendered semantic anchor cards, existing Spotlight and GSAP motion system
**Spec:** `docs/superpowers/specs/2026-09-06-featured-cover-teaser-design.md`

## Global Constraints

- Modify only fifth-screen cover styling in `src/App.css` plus a focused verification script.
- Do not modify image files, project data, names, links, card count, card dimensions, secondary pages, or animation JavaScript.
- Preserve the existing `.project-art-inner[data-parallax]`, Spotlight element, reveal attributes, and sticky-card behavior.
- Desktop default: scale 1.07 and `brightness(.58) saturate(.48) contrast(1.08)`.
- Desktop hover/focus: scale 1.02 and `brightness(.92) saturate(.94) contrast(1.02)` over 0.9 seconds.
- Coarse-pointer/mobile: a brighter static state that does not rely on hover.
- Reduced motion: full-color static image with no filter or transform transition.

---

### Task 1: Define the expected teaser CSS contract

**Files:**
- Create: `scripts/verify_featured_cover_teaser.mjs`

**Interfaces:**
- Consumes: raw `src/App.css` text
- Produces: a deterministic command that fails until desktop, focus, coarse-pointer, and reduced-motion states exist

- [x] **Step 1: Add the CSS contract verification script**

Create `scripts/verify_featured_cover_teaser.mjs`:

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../src/App.css', import.meta.url), 'utf8')
const requiredFragments = [
  '.project-art.has-cover img',
  'transform:scale(1.07)',
  'filter:brightness(.58) saturate(.48) contrast(1.08)',
  '.project-card:is(:hover,:focus-visible) .project-art.has-cover img',
  'transform:scale(1.02)',
  'filter:brightness(.92) saturate(.94) contrast(1.02)',
  'transition:transform .9s cubic-bezier(.2,.8,.2,1),filter .9s cubic-bezier(.2,.8,.2,1)',
  '@media(pointer:coarse),(max-width:620px)',
  'filter:brightness(.82) saturate(.82) contrast(1.03)',
  '@media(prefers-reduced-motion:reduce)',
  'filter:none!important',
  'transition:none!important',
]

for (const fragment of requiredFragments) assert.ok(css.includes(fragment), `Missing CSS fragment: ${fragment}`)
console.log('featured cover teaser CSS verified')
```

- [x] **Step 2: Run the script and confirm it fails before implementation**

Run: `node scripts/verify_featured_cover_teaser.mjs`

Expected: FAIL at `transform:scale(1.07)` because the current fifth-screen cover has only a simple 1.025 hover scale.

### Task 2: Implement the dark teaser and reveal states

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: existing `.project-art.has-cover`, `.project-card`, `.project-one`, `.project-two`, and `.project-three` selectors
- Produces: default teaser, hover/focus reveal, category tints, mobile static state, and reduced-motion state

- [x] **Step 1: Replace the current fifth-screen cover motion rules**

Replace the current `.project-art.has-cover .project-art-inner`, image, and hover declarations with:

```css
.project-art.has-cover .project-art-inner{inset:0}
.project-art.has-cover img{display:block;width:100%;height:100%;object-fit:cover;object-position:center;transform:scale(1.07);filter:brightness(.58) saturate(.48) contrast(1.08);transition:transform .9s cubic-bezier(.2,.8,.2,1),filter .9s cubic-bezier(.2,.8,.2,1);will-change:transform,filter}
.project-card:is(:hover,:focus-visible) .project-art.has-cover img{transform:scale(1.02);filter:brightness(.92) saturate(.94) contrast(1.02)}
```

Do not add transforms to `.project-art-inner`; it remains owned by the existing parallax system.

- [x] **Step 2: Add restrained per-card tint overlays**

Keep the existing bottom readability gradient on `:after`, then add:

```css
.project-art.has-cover:before{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(125deg,var(--teaser-tint),rgba(8,6,6,.26));opacity:.82;transition:opacity .9s cubic-bezier(.2,.8,.2,1)}
.project-card:is(:hover,:focus-visible) .project-art.has-cover:before{opacity:.28}
.project-one{--teaser-tint:rgba(112,78,118,.24)}
.project-two{--teaser-tint:rgba(113,45,52,.24)}
.project-three{--teaser-tint:rgba(181,128,68,.2)}
```

Keep `.project-art.has-cover>span` at `z-index:2` so the label remains above both overlays.

- [x] **Step 3: Add coarse-pointer and reduced-motion overrides**

Append:

```css
@media(pointer:coarse),(max-width:620px){
  .project-art.has-cover img{transform:scale(1.035);filter:brightness(.82) saturate(.82) contrast(1.03)}
  .project-art.has-cover:before{opacity:.42}
}
@media(prefers-reduced-motion:reduce){
  .project-art.has-cover img{transform:none!important;filter:none!important;transition:none!important}
  .project-art.has-cover:before{opacity:.18;transition:none!important}
}
```

These overrides affect only the fifth-screen cover selector, not `.work-project-art` on secondary pages.

- [x] **Step 4: Run the CSS contract verification**

Run: `node scripts/verify_featured_cover_teaser.mjs`

Expected: `featured cover teaser CSS verified`.

- [x] **Step 5: Run static checks**

Run `pnpm run lint` and `pnpm run build` in parallel.

Expected: successful production build, no new lint errors, and only the existing unrelated Fast Refresh warning in `src/components/ui/button.tsx` if still present.

### Task 3: Verify visual states and isolation in the browser

**Files:**
- Verify: `src/App.css`
- Verify: `src/App.jsx`
- Verify: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: fifth-screen project cards and the three existing featured secondary routes
- Produces: confirmed desktop reveal, keyboard parity, mobile static state, secondary-page isolation, and error-free runtime

- [x] **Step 1: Verify desktop default teaser state**

Open `http://127.0.0.1:5173/#projects`, wait for the opening animation, and scroll the fifth screen into view. Confirm all three cover images compute to `scale(1.07)` with the default filter, each has a tint overlay, and Spotlight, `data-parallax`, titles, and links remain present.

- [x] **Step 2: Verify pointer and keyboard reveal states**

Hover one card and keyboard-focus another. Confirm both compute to `scale(1.02)` and the reveal filter, with the tint overlay opacity reduced to `.28`; confirm leaving or blurring returns to the dark teaser state.

- [x] **Step 3: Verify secondary-page isolation**

Open `?category=ip-visual`, `?category=campaign-visual`, and `?category=aigc-workflow`. Confirm `.work-project-art>img` on each page has no teaser brightness/saturation filter and retains the existing secondary-page hover behavior.

- [x] **Step 4: Verify mobile rendering**

Set the viewport to 390×844. Confirm all fifth-screen images compute to scale 1.035 with `brightness(.82) saturate(.82) contrast(1.03)`, cards remain fully visible, and there is no horizontal overflow. Reset the viewport.

- [x] **Step 5: Verify reduced-motion declarations and runtime logs**

Confirm the final CSS contains the reduced-motion selector scoped to `.project-art.has-cover img`, and inspect browser logs for new React, CSS, or runtime errors.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. The specification, checked plan, CSS contract assertion, build output, computed-style checks, screenshots, and runtime logs provide the execution record.
