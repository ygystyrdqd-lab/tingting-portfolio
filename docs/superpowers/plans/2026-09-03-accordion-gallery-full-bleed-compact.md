# Accordion Gallery Full-Bleed Compact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the homepage accordion gallery to approximately half its current height and make its five-panel row touch both viewport edges.

**Architecture:** Preserve the existing React and GSAP component behavior and implement the change entirely through the gallery and section CSS. The metadata row keeps the site's content-shell alignment while the panel row becomes full bleed.

**Tech Stack:** CSS, React 19, GSAP 3, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-03-accordion-gallery-full-bleed-compact-design.md`

## Global Constraints

- Do not change `AccordionGallery.jsx`, gallery data, active-panel proportions, initial index, GSAP duration, easing, pointer behavior, keyboard navigation, or reduced-motion logic.
- Desktop and tablet heights at `768px` and above must use `clamp(240px, 24vw, 300px)`.
- Mobile height below `768px` must be `240px`.
- The gallery panel row must touch both viewport edges with no outer whitespace.
- Keep `8px` gaps between panels.
- Keep the metadata row aligned to the approximately `1200px` content shell.

---

### Task 1: Apply compact full-bleed gallery layout

**Files:**
- Modify: `src/App.css:6-7`
- Modify: `src/components/gallery/AccordionGallery.css:1-45`

**Interfaces:**
- Consumes: `.showreel`, `.accordion-showcase__shell`, `.accordion-showcase__meta`, `.accordion-gallery`, and existing panel/copy selectors.
- Produces: a full-width gallery row with `240–300px` desktop height, `240px` mobile height, flush outer edges, and compact readable text.

- [x] **Step 1: Verify the current dimensions and shell width**

Run:

```powershell
rg -n "padding:72px 0 132px|width:min\(calc\(100% - 48px\)|height:clamp\(420px,48vw,590px\)|height:430px|gap:10px|padding:0 14px" src/App.css src/components/gallery/AccordionGallery.css
```

Expected: the current section spacing, `1200px`-limited gallery shell, tall desktop/mobile heights, and mobile side padding are present.

- [x] **Step 2: Make the section shell full width while retaining metadata alignment**

Replace the gallery section rules in `App.css` with:

```css
.showreel{position:relative;z-index:4;padding:48px 0 76px;overflow:hidden;background:rgba(11,9,8,.78)}
.accordion-showcase__shell{width:100%;margin:0}
.accordion-showcase__meta{display:flex;justify-content:space-between;width:min(calc(100% - 48px),var(--shell));margin:0 auto 18px;padding-bottom:12px;border-bottom:1px solid rgba(240,236,229,.12);color:rgba(240,236,229,.5);font-size:9px;letter-spacing:.16em}
@media(max-width:620px){.showreel{padding:38px 0 62px}.accordion-showcase__meta{width:calc(100% - 40px);margin:0 auto 16px}}
```

Expected: only the metadata row remains constrained; the gallery component inherits full viewport width.

- [x] **Step 3: Reduce the desktop panel row to half height and flush its outside edges**

Update the structural gallery rules in `AccordionGallery.css`:

```css
.accordion-gallery{display:flex;gap:8px;width:100%;height:clamp(240px,24vw,300px);overflow:hidden}
.accordion-gallery__panel:first-child{border-left:0;border-radius:0 16px 16px 0}
.accordion-gallery__panel:last-child{border-right:0;border-radius:16px 0 0 16px}
```

Change the base panel radius from `20px` to `16px`. Keep all interior panel radii intact.

- [x] **Step 4: Compact the text and metadata inside each panel**

Use these exact values:

```css
.accordion-gallery__index{top:16px;left:18px;font-size:8px}
.accordion-gallery__rail-title{bottom:18px;font-size:9px}
.accordion-gallery__copy{left:clamp(20px,2.4vw,34px);right:clamp(20px,2.4vw,34px);bottom:clamp(20px,2.4vw,30px)}
.accordion-gallery__copy small{margin-bottom:7px;font-size:9px}
.accordion-gallery__copy strong{font-size:clamp(26px,3.1vw,44px)}
.accordion-gallery__copy>span{max-width:360px;margin-top:10px;font-size:10px;line-height:1.5}
```

Expected: active copy fits inside a `240px`-high panel without clipping or overlapping its index.

- [x] **Step 5: Apply the compact full-bleed mobile row**

Replace the relevant rules inside `@media(max-width:767px)` with:

```css
.accordion-gallery{height:240px;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0;scrollbar-width:none}
.accordion-gallery__panel{flex:0 0 82vw;scroll-snap-align:center}
.accordion-gallery__copy strong{font-size:clamp(26px,8vw,38px)}
```

Remove `scroll-padding:14px`. Retain hidden scrollbars, always-visible mobile copy, and horizontal snapping.

- [x] **Step 6: Verify the final CSS declarations**

Run:

```powershell
rg -n "padding:48px 0 76px|width:100%|height:clamp\(240px,24vw,300px\)|height:240px|gap:8px|82vw|first-child|last-child|font-size:clamp\(26px" src/App.css src/components/gallery/AccordionGallery.css
```

Expected: all compact and full-bleed declarations are present, while the old `420–590px`, `430px`, `10px/12px` gaps, and `14px` mobile padding no longer match.

- [x] **Step 7: Run lint and production build**

Use the bundled Node runtime to run Oxlint and Vite build.

Expected: no new lint errors and a successful production build. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.

- [x] **Step 8: Verify PC and mobile layouts in the live browser**

Reload `http://127.0.0.1:5173/#home`. Inspect the gallery at `1440×900`, then below `768px`, and restore the default viewport.

Expected:

- At `1440px`, the panel row touches both viewport edges, remains one row, and is no taller than `300px`.
- Internal gaps remain visible at `8px`; there is no external left or right gap.
- Active title, subtitle, and description remain legible without clipping.
- At mobile width, the gallery is `240px` high, starts flush at the left edge, and scrolls horizontally.
- Hover, click, keyboard navigation, Hero opening, and later sections remain functional.

- [x] **Step 9: Record completion**

Mark each checkbox complete only after CSS verification, build, and browser checks pass. No Git commit is required because the workspace is not a Git repository.
