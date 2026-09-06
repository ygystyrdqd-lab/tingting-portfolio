# Hero Avatar and Title Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the full right side of the desktop avatar without scaling it, tighten desktop title spacing, and place the mobile upper title at 50%.

**Architecture:** Introduce one CSS custom property for the image's horizontal anchor and override only that property on desktop, so pointer, coarse-pointer, and reduced-motion transforms remain consistent. Update only the final responsive Hero title positioning declarations in `src/App.css`.

**Tech Stack:** CSS, React 19, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-02-hero-avatar-and-title-refinement-design.md`

## Global Constraints

- Do not change avatar scale, avatar container position, title typography, layering, breakpoints, GSAP animation, or pointer variables.
- Apply the avatar anchor adjustment only at widths of `921px` and above.
- Preserve tablet title positions at `29% / 23%` and mobile lower-title position at `27%`.

---

### Task 1: Refine desktop avatar anchor and responsive title positions

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: existing `.hero-closeup .avatar-stage img`, `.hero-title-back`, and `.hero-title-front` CSS contracts.
- Produces: the same CSS contracts with desktop-only avatar anchoring and approved title coordinates.

- [x] **Step 1: Verify current final Hero values**

Run:

```powershell
rg -n "avatar-stage img|top:34%|bottom:22%|top:35%|bottom:20%|top:24%|bottom:27%" src/App.css
```

Expected: the image uses base `-50%` horizontal translation and the current title positions are found.

- [x] **Step 2: Add the desktop-only avatar anchor override**

Use a base anchor custom property and add a desktop-only override:

```css
.hero-closeup .avatar-stage img{
  --avatar-base-x:-50%;
  transform:translate3d(calc(var(--avatar-base-x) + var(--avatar-x)),var(--avatar-y),30px) rotateX(var(--avatar-rx)) rotateY(var(--avatar-ry));
}
@media(min-width:921px){.hero-closeup .avatar-stage img{--avatar-base-x:-54%}}
```

Use `var(--avatar-base-x)` in the coarse-pointer keyframes and reduced-motion transform as well. This preserves scale and all motion modes while moving only the desktop image content four percent left inside its unchanged container.

- [x] **Step 3: Apply the approved title positions**

Use base desktop `top:38% / bottom:25%`, short desktop `top:39% / bottom:23%`, tablet `top:29% / bottom:23%`, and mobile `top:50% / bottom:27%`.

- [x] **Step 4: Verify scope and responsive values**

Run:

```powershell
rg -n "min-width:921px|calc\(-54%|top:38%|bottom:25%|top:39%|bottom:23%|top:29%|top:50%|bottom:27%" src/App.css
```

Expected: all approved values are present and the base `-50%` transform remains for tablet and mobile.

- [x] **Step 5: Run checks and build**

Run `pnpm run lint` followed by `pnpm run build`, then request `http://127.0.0.1:5173/#home`.

Expected: no new errors, Vite writes `dist`, and the homepage returns HTTP 200. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.
