# Work Category Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the 01–04 work rows into pointer-reactive category links, add four full secondary pages, and provide project cards with an image/video-ready media viewer.

**Architecture:** Keep the Vite app dependency-free by using a `category` query parameter plus the History API. Move category data into a dedicated module, isolate row interaction and secondary-page UI into focused components, and let `App` own URL synchronization and main/detail switching.

**Tech Stack:** React 19, Vite 8, Lucide React, CSS custom properties
**Spec:** `docs/superpowers/specs/2026-09-02-work-category-pages-design.md`

## Global Constraints

- Use only `brand`, `ecommerce`, `packaging`, and `3d` category values.
- Do not install a routing or media-viewer dependency.
- Preserve existing main-page sections and content outside the 01–04 entry rows.
- Do not add real project images or videos in this implementation.
- Support mouse, keyboard, touch, browser back/forward, Escape, and reduced-motion behavior.
- Keep the project static-build compatible.
- The workspace has no Git repository, so commit steps are omitted.

---

### Task 1: Create the work-category data contract

**Files:**
- Create: `src/data/workCategories.js`
- Modify: `src/App.jsx` to remove the old `capabilities` tuple array

**Interfaces:**
- Produces: `workCategories: WorkCategory[]` and `getWorkCategory(slug: string): WorkCategory | undefined`.
- `WorkCategory`: `{ slug, number, title, en, description, projects }`.
- `WorkProject`: `{ id, title, meta, media }`.
- `WorkMedia`: `{ type: 'image'|'video', src, alt?, poster? }`.

- [ ] **Step 1: Create explicit category data**

Define four objects in order with the approved slugs and three category-specific project preparation cards each. Each project must use a stable ID such as `brand-01`, a concrete preparation title such as `品牌项目 01`, a category-specific meta label, and `media: []`.

- [ ] **Step 2: Export a lookup helper**

```js
export const getWorkCategory = (slug) => workCategories.find((category) => category.slug === slug)
```

- [ ] **Step 3: Verify the data contract**

Run:

```powershell
rg -n "slug: 'brand'|slug: 'ecommerce'|slug: 'packaging'|slug: '3d'|media: \[\]|getWorkCategory" src/data/workCategories.js
```

Expected: four slugs, twelve empty media arrays, and the lookup helper are present.

### Task 2: Build pointer-reactive category rows

**Files:**
- Create: `src/components/work/CapabilityLink.jsx`
- Modify: `src/App.jsx` in `Capabilities`
- Modify: `src/App.css` capability row styles

**Interfaces:**
- Consumes: `category: WorkCategory` and `onOpen(slug: string): void`.
- Produces: one semantic anchor with pointer CSS variables `--pointer-x` and `--pointer-y`.

- [ ] **Step 1: Implement `CapabilityLink`**

Render an anchor with `href={`?category=${category.slug}`}`. On click, prevent default and call `onOpen(category.slug)`. On pointer move, when the pointer is fine, calculate local x/y percentages from `getBoundingClientRect()` and write them to the anchor style. Keep the number, title, English label, and `ArrowUpRight` icon.

- [ ] **Step 2: Replace the inline row mapping**

Import `workCategories` and `CapabilityLink`, then render:

```jsx
<div className="capability-list">
  {workCategories.map((category) => (
    <CapabilityLink key={category.slug} category={category} onOpen={onOpenCategory} />
  ))}
</div>
```

Change `Capabilities` to accept `{ onOpenCategory }`.

- [ ] **Step 3: Add the spotlight and interaction styles**

Make `.capability-item` a positioned grid anchor with inherited color and no text decoration. Use `::before` with:

```css
background:radial-gradient(440px circle at var(--pointer-x,50%) var(--pointer-y,50%),rgba(208,173,125,.9),rgba(194,127,75,.42) 34%,transparent 70%);
```

Fade it in on hover/focus-visible, place content above it, change text contrast, and translate/rotate the icon. Add `:active` for touch and reduced-motion overrides.

- [ ] **Step 4: Verify semantic entry rows**

Run:

```powershell
rg -n "function CapabilityLink|--pointer-x|--pointer-y|onOpenCategory|href=.*category" src/components/work/CapabilityLink.jsx src/App.jsx src/App.css
```

Expected: pointer variables, link target, and category callback are connected.

### Task 3: Build the media viewer

**Files:**
- Create: `src/components/work/MediaViewer.jsx`
- Create: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: `project: WorkProject | null` and `onClose(): void`.
- Produces: a full-screen dialog-like overlay with empty, image, and video render states.

- [ ] **Step 1: Implement open/close effects**

When `project` is truthy, save the body's current overflow value, set it to `hidden`, listen for Escape, and restore overflow/remove the listener during cleanup. Return `null` when no project is selected.

- [ ] **Step 2: Render the viewer structure**

Use a fixed overlay with `role="dialog"`, `aria-modal="true"`, `aria-label={`${project.title}媒体查看器`}`, a close button, project title/meta, and a media region. Close when the overlay itself is clicked, but stop propagation inside the content panel.

- [ ] **Step 3: Render media types safely**

- `media.length === 0`: render `作品媒体将在后续上传`.
- `type === 'image'`: render `<img src={item.src} alt={item.alt || project.title} />`.
- `type === 'video'`: render `<video src={item.src} poster={item.poster} controls playsInline preload="metadata" />`.
- Unknown types are skipped rather than creating broken elements.

- [ ] **Step 4: Style viewer states**

Create a dark blurred overlay, constrained content panel, close button, responsive media area, contained images, full-width videos, and a centered empty state. Add phone and reduced-motion rules.

- [ ] **Step 5: Verify all render states**

Run:

```powershell
rg -n "role=\"dialog\"|aria-modal|Escape|body.style.overflow|type === 'image'|type === 'video'|作品媒体将在后续上传" src/components/work/MediaViewer.jsx
```

Expected: dialog semantics, scroll lock, keyboard close, and all three content states are present.

### Task 4: Build the secondary category page

**Files:**
- Create: `src/components/work/WorkCategoryPage.jsx`
- Modify: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: `category: WorkCategory | undefined` and `onBack(): void`.
- Produces: full detail page, invalid-category recovery state, three project cards, and viewer selection state.

- [ ] **Step 1: Implement the detail header**

Render a compact header with the existing `LT` brand, a back button calling `onBack`, and `mailto:806779987@qq.com`. Use `ArrowLeft` and `ArrowUpRight` icons with accessible labels.

- [ ] **Step 2: Implement invalid-category recovery**

When `category` is undefined, render a full-height dark state with `分类不存在` and a button invoking `onBack`. Do not fall back silently to the first category.

- [ ] **Step 3: Implement category hero and project cards**

Render number, Chinese title, English title, description, and a three-card grid. Each card is a button that sets `selectedProject`; use only CSS gradients and category-specific class names for the preparation preview.

- [ ] **Step 4: Connect `MediaViewer`**

Render `<MediaViewer project={selectedProject} onClose={() => setSelectedProject(null)} />` and clear the selected project when the category changes.

- [ ] **Step 5: Style desktop, tablet, and phone layouts**

Use a 1200px shell, three columns by default, two columns below 920px, and one below 620px. Prevent horizontal overflow and use the existing graphite/champagne visual tokens.

- [ ] **Step 6: Verify page states and card count**

Run:

```powershell
rg -n "分类不存在|work-detail-grid|selectedProject|MediaViewer|projects.map|onBack" src/components/work/WorkCategoryPage.jsx
```

Expected: recovery, grid, selection, viewer, and back behavior are connected.

### Task 5: Add URL/history state to `App`

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getWorkCategory`, `WorkCategoryPage`, and `Capabilities.onOpenCategory`.
- Produces: query-param routing, back/forward synchronization, and main/detail switching.

- [ ] **Step 1: Add a URL reader**

```js
const readCategorySlug = () => new URLSearchParams(window.location.search).get('category')
```

Initialize `categorySlug` state from this function and listen to `popstate` to update it.

- [ ] **Step 2: Implement category navigation**

`openCategory(slug)` must set the query parameter on a `new URL(window.location.href)`, clear the hash, call `history.pushState`, update state, and scroll to the top.

- [ ] **Step 3: Implement return navigation**

`closeCategory()` must remove the query parameter, set `#capabilities`, call `history.pushState`, clear state, then scroll the capabilities section into view after the main page renders.

- [ ] **Step 4: Make the global header detail-safe**

Change brand and navigation links from `#id` to `/#id` so they clear the category query when used from a secondary page.

- [ ] **Step 5: Switch the rendered surface**

When `categorySlug !== null`, render `<WorkCategoryPage category={getWorkCategory(categorySlug)} onBack={closeCategory} />`. Otherwise render the existing portfolio with `<Capabilities onOpenCategory={openCategory} />`.

- [ ] **Step 6: Verify routing code**

Run:

```powershell
rg -n "readCategorySlug|popstate|pushState|searchParams.set|searchParams.delete|getWorkCategory|WorkCategoryPage|onOpenCategory" src/App.jsx
```

Expected: query read, history sync, lookup, detail rendering, and entry callback are present.

### Task 6: Validate the complete local experience

**Files:**
- Verify: all files from Tasks 1–5

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: a compilable local portfolio with four addressable category pages.

- [ ] **Step 1: Run source consistency checks**

Verify all four slugs exist once in category data, every category has exactly three projects, the old tuple array is absent, and no new package dependency was added.

- [ ] **Step 2: Run the production build**

Run the existing `pnpm run build` script with the bundled Node runtime on `PATH`.

Expected: Vite exits with code 0 and emits `dist/index.html`.

- [ ] **Step 3: Verify local URLs**

Request the main page and these four URLs:

```text
http://127.0.0.1:5173/#capabilities
http://127.0.0.1:5173/?category=brand
http://127.0.0.1:5173/?category=ecommerce
http://127.0.0.1:5173/?category=packaging
http://127.0.0.1:5173/?category=3d
```

Expected: every request returns HTTP 200. Do not perform screenshots, DOM, click, or resize testing unless the user separately requests browser QA.
