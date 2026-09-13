# Direct Project Media Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each card in the homepage Projects section open its real project media directly without navigating to a category detail page.

**Architecture:** Keep `featuredWorkCategories` as the single media source. Give `Projects` local selected-project state, pass the first project inside each featured category to the existing `MediaViewer`, and render the cards as semantic buttons instead of links. Existing category routing remains available only to the Capabilities section.

**Tech Stack:** React 19, JavaScript, existing `MediaViewer`, existing `SpotlightCard`, CSS, Vite 8.
**Spec:** `docs/superpowers/specs/2026-09-11-direct-project-media-viewer-design.md`

## Global Constraints

- Only the homepage Projects section loses category-page navigation.
- Capabilities category links and all existing `?category=` detail pages remain unchanged.
- Card visuals, spotlight interaction, sticky stack, and entrance animation remain unchanged.
- Clicking a Projects card must not change the URL.
- The viewer must retain close button, backdrop close, Escape close, scroll locking, image order, and video controls.

---

### Task 1: Open featured project media directly

**Files:**
- Modify: `src/App.jsx:1-10,268-282,333`
- Modify: `src/App.css:8`
- Modify: `scripts/verify-desktop-experience.mjs`

**Interfaces:**
- Consumes: `featuredWorkCategories: Category[]`, each with `projects[0]`, and `MediaViewer({ project, onClose })`.
- Produces: `Projects()` with local `selectedProject` state; selected viewer payload `{ ...project.projects[0], number: '01' | '02' | '03' }`.

- [ ] **Step 1: Add failing source-contract assertions**

Extend `scripts/verify-desktop-experience.mjs` with assertions that `App.jsx` imports `MediaViewer`, Projects cards render through `SpotlightCard as="button"`, the viewer receives `selectedProject`, and the featured-card markup no longer contains `href={`?category=${project.slug}`}`.

- [ ] **Step 2: Run the verification and confirm failure**

Run `pnpm run verify:desktop-experience`. Expect failure with the new direct-viewer contract message because `MediaViewer` is not yet imported by `App.jsx`.

- [ ] **Step 3: Implement local viewer state and direct card actions**

Import `MediaViewer` in `App.jsx`. Change `Projects({ onOpenCategory })` to `Projects()`, add `selectedProject` state, and on card click assign `{ ...project.projects[0], number: String(index + 1).padStart(2, '0') }`. Render `MediaViewer` beside the Projects section with `onClose={() => setSelectedProject(null)}`. Change every featured `SpotlightCard` to `as="button"`, `type="button"`, remove `href`, and update its accessible label to name the contained project. Change the main render call from `<Projects onOpenCategory={openCategory} />` to `<Projects />`.

- [ ] **Step 4: Preserve button visuals**

Add `width:100%`, `color:inherit`, `font:inherit`, `text-align:left`, and `cursor:pointer` to `.project-card` in `src/App.css` so semantic buttons match the previous link cards without layout shifts.

- [ ] **Step 5: Run automated checks**

Run `pnpm run verify:desktop-experience` and expect all assertions to pass. Run `pnpm run build` and expect a successful Vite production build.

- [ ] **Step 6: Run desktop browser QA**

At `http://localhost:5174/#projects`, click all three cards. Confirm the URL stays on `#projects`; viewer titles are `花小灵IP形象设计`, `AOC投影仪电商视觉`, and `AI空间场景生成工作流`; media counts are 1, 3, and 1. Close each viewer and verify background scroll returns to the Projects section. Then click one Capabilities card and confirm `?category=` routing still works.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/App.jsx src/App.css scripts/verify-desktop-experience.mjs
git commit -m "feat: open project media directly"
```
