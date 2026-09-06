# Hero Horizontal Clip Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining right-side avatar crop without changing the subject's scale, position, or waist-level bottom crop.

**Architecture:** Replace the avatar stage's four-sided overflow clipping with a polygon clip region that extends 30% beyond both horizontal edges while keeping the top and bottom boundaries fixed. The existing Hero container remains the final page-level overflow guard.

**Tech Stack:** React 19, Vite 8, CSS `clip-path`
**Spec:** `docs/superpowers/specs/2026-09-02-hero-fixed-waist-crop-design.md`

## Global Constraints

- Keep the current 170% desktop/tablet and 166% phone subject scale.
- Keep the current desktop, tablet, and phone avatar positions.
- Preserve the waist crop and title layering.
- Expose both horizontal sides by 30% of the avatar stage width.
- Keep page-level horizontal overflow suppressed by `.hero`.
- The workspace has no Git repository, so commit steps are omitted.

---

### Task 1: Replace four-sided clipping with an expanded horizontal polygon

**Files:**
- Modify: `src/App.css` in `.hero-closeup .avatar-stage`

**Interfaces:**
- Consumes: the current fixed `.avatar-stage` rectangle and its animated child image.
- Produces: a `clip-path` whose visible region spans `-30%…130%` horizontally and `0…100%` vertically.

- [ ] **Step 1: Verify the current cause**

Run:

```powershell
rg -n "avatar-stage\{.*overflow:hidden" src/App.css
```

Expected: the final Hero override contains `overflow:hidden`.

- [ ] **Step 2: Apply the one-axis visual crop**

Replace the final avatar-stage rule with:

```css
.hero-closeup .avatar-stage{
  inset:-2% -2% 0 0;
  overflow:visible;
  clip-path:polygon(-30% 0,130% 0,130% 100%,-30% 100%);
  transform:none;
  transform-origin:54% 48%;
}
```

Do not alter the avatar image scale, positioning, or transform declarations.

- [ ] **Step 3: Verify the final rule**

Run:

```powershell
rg -n "clip-path:polygon\(-30% 0,130% 0,130% 100%,-30% 100%\)|avatar-stage\{.*overflow:visible" src/App.css
```

Expected: both expanded polygon and visible overflow are present in the final override.

### Task 2: Validate the local deliverable

**Files:**
- Verify: `src/App.css`
- Verify: `public/hero-avatar-closeup.png`

**Interfaces:**
- Consumes: Task 1.
- Produces: a compilable Hero whose stage cannot cut the right sleeve while the bottom remains clipped.

- [ ] **Step 1: Run the production build**

Run the existing `pnpm run build` script with the bundled Node runtime on `PATH`.

Expected: Vite exits with code 0 and writes `dist/index.html`.

- [ ] **Step 2: Verify local availability**

Request `http://127.0.0.1:5173/#home` and `http://127.0.0.1:5173/hero-avatar-closeup.png`.

Expected: both return HTTP 200. Do not perform screenshot, DOM, click, or resize testing unless the user separately requests browser QA.
