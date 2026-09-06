# Work Detail Top Reset and Sticky Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every work-category detail page open at scroll position zero and keep its capsule navigation visible while the page scrolls.

**Architecture:** `WorkCategoryPage` performs a synchronous layout-phase scroll reset whenever the category slug changes, covering clicks, direct URLs, and browser history navigation. CSS keeps the navigation in document flow with `position: sticky`; the page container uses `overflow: clip` so it preserves visual clipping without becoming a sticky containing block.

**Tech Stack:** React 19 `useLayoutEffect`, CSS sticky positioning, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-04-work-detail-top-sticky-nav-design.md`

## Global Constraints

- Apply the behavior to all four valid work categories and the invalid-category state.
- Use instant scrolling with `behavior: 'auto'`; do not animate the reset.
- Keep the existing back-to-works behavior, category animations, project cards, and media viewer unchanged.
- Keep the navigation's current capsule styling and `1200px` maximum width.
- Use `top: 18px` on desktop/tablet and `top: 10px` at `760px` or below.
- Add no dependencies and perform no unrelated refactoring.
- This workspace is not a Git repository, so commit steps are intentionally omitted.

---

## File Structure

- `src/components/work/WorkCategoryPage.jsx`: resets the viewport before paint when a detail category mounts or changes.
- `src/components/work/work-detail.css`: enables viewport-relative sticky behavior and responsive offsets.
- `src/App.jsx`: remains unchanged and continues to return users to `#capabilities`.

### Task 1: Add a layout-phase detail-page scroll reset

**Files:**
- Modify: `src/components/work/WorkCategoryPage.jsx:1-14`

**Interfaces:**
- Consumes: `category?.slug` from the existing `category` prop.
- Produces: `window.scrollY === 0` before the detail page is painted.

- [ ] **Step 1: Confirm the current component hooks**

Run:

```powershell
rg -n "useCallback|useWorkDetailAnimations|scrollTo" src/components/work/WorkCategoryPage.jsx
```

Expected: `useLayoutEffect` and a component-level `scrollTo` call are absent.

- [ ] **Step 2: Import and add the scroll-reset hook**

Change the React import and insert the hook before `useWorkDetailAnimations`:

```jsx
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

// Inside WorkCategoryPage, after closeViewer:
useLayoutEffect(() => {
  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  scrollToTop()
  const frame = window.requestAnimationFrame(scrollToTop)
  return () => window.cancelAnimationFrame(frame)
}, [category?.slug])

useWorkDetailAnimations(pageRef, category?.slug)
```

The synchronous call resets the initial render. The next-frame call runs after the outgoing home GSAP context has finished cleanup, preventing it from restoring the old scroll offset.

- [ ] **Step 3: Run the first static check**

Run:

```powershell
pnpm run lint
```

Expected: no new hook-order or dependency warning; the pre-existing `react(only-export-components)` warning in `src/components/ui/button.tsx` may remain.

### Task 2: Make the detail navigation reliably sticky

**Files:**
- Modify: `src/components/work/work-detail.css:1`
- Modify: `src/components/work/work-detail.css:4`
- Modify: `src/components/work/work-detail.css:11`

**Interfaces:**
- Consumes: existing `.work-detail` and `.work-detail-nav` markup.
- Produces: a sticky capsule positioned `18px` from the viewport top, or `10px` on mobile.

- [ ] **Step 1: Preserve clipping without creating a sticky container**

In `.work-detail`, replace:

```css
overflow:hidden
```

with:

```css
overflow:clip
```

- [ ] **Step 2: Enable sticky navigation**

In `.work-detail-nav`, replace `position:relative` and add the top offset:

```css
position:sticky;top:18px;z-index:50
```

Keep its width, height, margin, padding, grid, border, background, and backdrop-filter declarations unchanged.

- [ ] **Step 3: Add the mobile sticky offset**

At the beginning of the existing `@media(max-width:760px)` block, extend the `.work-detail-nav` rule to include:

```css
.work-detail-nav{top:10px;grid-template-columns:1fr auto}
```

- [ ] **Step 4: Run production checks**

Run:

```powershell
pnpm run lint
pnpm run build
```

Expected: Vite exits with code `0`; no new lint issue appears.

### Task 3: Verify all entry paths and sticky behavior

**Files:**
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: `http://127.0.0.1:5173/?category=brand` and the other category URLs.
- Produces: browser evidence for top reset, sticky position, return behavior, and regressions.

- [ ] **Step 1: Verify direct URL entry**

Open each URL directly:

```text
/?category=brand
/?category=ecommerce
/?category=packaging
/?category=3d
```

Expected: every page reports `window.scrollY === 0` after it loads.

- [ ] **Step 2: Verify navigation remains sticky**

On one category page, record the navigation's viewport top, scroll down into the project cards, and record it again.

Expected: `getBoundingClientRect().top` remains approximately `18px` at the current desktop/tablet width; the capsule remains visible above card content.

- [ ] **Step 3: Verify browser history entry**

Navigate between at least two category URLs, scroll the first page downward, then use browser back and forward.

Expected: each restored category is reset to `window.scrollY === 0`.

- [ ] **Step 4: Verify return-to-works behavior**

Click `返回作品`.

Expected: the query parameter is removed and the home page lands at `#capabilities`, not `#home`.

- [ ] **Step 5: Run final regression checks**

Run:

```powershell
pnpm run lint
pnpm run build
```

Expected: build succeeds and no new lint issue is present.
