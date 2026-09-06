# Detail Pages Top-Down Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all four work-detail pages reveal from top to bottom and return directly to the homepage work-category section.

**Architecture:** Keep one shared GSAP hook responsible for all detail-page entrance motion so every category remains synchronized. Add a homepage-opening suppression state in `App` so returning from a detail page renders the homepage at `#capabilities` without replaying the homepage Opening.

**Tech Stack:** React 19, Vite 8, GSAP 3 with ScrollTrigger
**Spec:** `docs/superpowers/specs/2026-09-02-detail-pages-top-down-motion-design.md`

## Global Constraints

- Preserve the existing page layout, project data, media viewer, hover states, and homepage Opening on normal homepage entry.
- Use only `power3.out` and `power4.out`; no bounce or elastic easing.
- Preserve the existing `prefers-reduced-motion` static fallback.
- Apply identical behavior to `brand`, `ecommerce`, `packaging`, and `3d` detail routes.

---

### Task 1: Reverse the detail entrance direction

**Files:**
- Modify: `src/hooks/useWorkDetailAnimations.js`

**Interfaces:**
- Consumes: `useWorkDetailAnimations(rootRef, categorySlug)` and existing detail-page data attributes.
- Produces: the same hook interface with top-to-bottom GSAP movement.

- [x] **Step 1: Record the current direction values**

Run:

```powershell
rg -n "y: 36|y: 120|y: 35|y: 90|inset\(100%|inset\(12%" src/hooks/useWorkDetailAnimations.js
```

Expected: positive `y` values confirm that elements currently rise from below.

- [x] **Step 2: Reverse intro movement and clipping**

Change the shared intro timeline to:

```js
.from('[data-detail-eyebrow]', {
  y: -36,
  autoAlpha: 0,
  clipPath: 'inset(0 0 100% 0)',
  duration: .8,
})
.from('[data-detail-title]', {
  y: -120,
  scaleX: .8,
  transformOrigin: 'left center',
  letterSpacing: '-.09em',
  clipPath: 'inset(0 0 100% 0)',
  duration: 1.15,
}, .12)
.from('[data-detail-summary] > *', {
  y: -35,
  autoAlpha: 0,
  duration: .75,
  stagger: .1,
}, .72)
```

- [x] **Step 3: Reverse project card movement and reveal edge**

Initialize cards with:

```js
gsap.set(cards, {
  y: -90,
  autoAlpha: 0,
  clipPath: 'inset(0 0 12% 0)',
})
```

Keep batch order, duration, easing, parallax, and cleanup unchanged.

- [x] **Step 4: Verify the direction values**

Run:

```powershell
rg -n "y: -36|y: -120|y: -35|y: -90|inset\(0 0 100% 0\)|inset\(0 0 12% 0\)" src/hooks/useWorkDetailAnimations.js
```

Expected: all six top-down values are present.

### Task 2: Return directly to the work-category section

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/work/WorkCategoryPage.jsx`

**Interfaces:**
- Consumes: `closeCategory()` passed to `WorkCategoryPage` as `onBack`.
- Produces: `suppressHomeOpening`, which suppresses the homepage Opening while showing the category section after returning from a detail page.

- [x] **Step 1: Add a homepage Opening suppression state**

Add state in `App`:

```js
const [suppressHomeOpening, setSuppressHomeOpening] = useState(false)
const shouldAnimateHome = categorySlug === null && !suppressHomeOpening
usePortfolioAnimations(mainPageRef, shouldAnimateHome)
```

After the homepage renders, keep suppression active while the category screen is visible and scroll to it in a layout-safe animation frame. Reset suppression when another category route or browser history navigation is opened.

- [x] **Step 2: Update close-category routing**

Set the route and state with:

```js
setSuppressHomeOpening(true)
url.searchParams.delete('category')
url.hash = 'capabilities'
window.history.pushState({}, '', url)
setCategorySlug(null)
window.requestAnimationFrame(() => {
  document.getElementById('capabilities')?.scrollIntoView({ block: 'start' })
})
```

- [x] **Step 3: Update shared detail-page labels**

Use `返回作品` for the invalid-state and navigation buttons. Use `BACK TO WORK ↑` in the detail footer so all four routes have consistent navigation language.

- [x] **Step 4: Check navigation copy and hash target**

Run:

```powershell
rg -n "返回作品|BACK TO WORK|hash = 'capabilities'|suppressHomeOpening" src/App.jsx src/components/work/WorkCategoryPage.jsx
```

Expected: shared copy and the `capabilities` target are present; `返回首页` is absent from the detail-page button.

### Task 3: Validate the complete change

**Files:**
- Verify: `src/hooks/useWorkDetailAnimations.js`
- Verify: `src/App.jsx`
- Verify: `src/components/work/WorkCategoryPage.jsx`

**Interfaces:**
- Consumes: the completed Tasks 1–2.
- Produces: a buildable site with five working routes.

- [x] **Step 1: Run code checks**

Run `pnpm run lint`.

Expected: no new errors; the existing `src/components/ui/button.tsx` Fast Refresh warning may remain.

- [x] **Step 2: Run the production build**

Run `pnpm run build`.

Expected: Vite exits successfully and writes `dist`.

- [x] **Step 3: Verify all routes respond**

Request:

```text
http://127.0.0.1:5173/#home
http://127.0.0.1:5173/?category=brand
http://127.0.0.1:5173/?category=ecommerce
http://127.0.0.1:5173/?category=packaging
http://127.0.0.1:5173/?category=3d
```

Expected: HTTP 200 for every route.
