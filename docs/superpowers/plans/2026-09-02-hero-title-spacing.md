# Hero Title Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Halve the vertical gap between the two homepage title lines across desktop, short desktop, tablet, and mobile layouts.

**Architecture:** Update only the existing responsive positioning declarations in `src/App.css`. Preserve typography, layering, avatar composition, GSAP animation hooks, and pointer transforms.

**Tech Stack:** CSS, React 19, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-02-hero-title-spacing-design.md`

## Global Constraints

- Do not change title font sizes, tracking, colors, stacking order, or animation attributes.
- Do not change avatar sizing, cropping, background, or breakpoints.
- Use the four exact positioning pairs approved in the spec.

---

### Task 1: Tighten Hero title positioning

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `.hero-title-back` and `.hero-title-front` positioning declarations.
- Produces: unchanged class interfaces with updated responsive positions.

- [x] **Step 1: Verify the existing values**

Run:

```powershell
rg -n "hero-title-back|hero-title-front" src/App.css
```

Expected: base `29% / 15.5%`, short desktop `31% / 14%`, tablet `25% / 18%`, and mobile `20% / 23%` declarations are present in the final Hero composition block.

- [x] **Step 2: Apply the approved positioning pairs**

Update the final Hero composition rules to:

```css
/* Base desktop */
.hero-title-back { top: 34% !important; }
.hero-title-front { bottom: 22%; }

/* Desktop at max-height 760px */
.hero-title-back { top: 35% !important; }
.hero-title-front { bottom: 20%; }

/* Width at max 920px */
.hero-title-back { top: 29% !important; }
.hero-title-front { bottom: 23%; }

/* Width at max 620px */
.hero-title-back { top: 24% !important; }
.hero-title-front { bottom: 27%; }
```

- [x] **Step 3: Verify the new values and protected properties**

Run:

```powershell
rg -n "top:34%|bottom:22%|top:35%|bottom:20%|top:29%|bottom:23%|top:24%|bottom:27%" src/App.css
```

Expected: all eight values are present; no Hero font-size, avatar, or GSAP source changes are included.

- [x] **Step 4: Run code checks and production build**

Run `pnpm run lint` followed by `pnpm run build`.

Expected: no new errors; the existing `src/components/ui/button.tsx` Fast Refresh warning may remain, and Vite writes `dist` successfully.
