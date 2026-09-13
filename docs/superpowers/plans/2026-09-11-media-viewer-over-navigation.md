# Media Viewer Navigation Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the full-screen media viewer above the global navigation so project imagery has an uninterrupted viewing surface.

**Architecture:** Keep viewer state and content unchanged. Move only the viewer's rendered DOM into `document.body` with React `createPortal`, escaping the homepage `main` stacking context while retaining the existing fixed overlay and z-index styles.

**Tech Stack:** React 19, `react-dom` `createPortal`, JavaScript, existing MediaViewer CSS, Vite 8.
**Spec:** `docs/superpowers/specs/2026-09-11-media-viewer-over-navigation-design.md`

## Global Constraints

- The viewer must cover the global navigation while open.
- Viewer layout, media order, controls, close interactions, scroll lock, and URLs remain unchanged.
- Navigation must return automatically after the viewer closes.
- The same MediaViewer behavior must work from Projects cards and category detail pages.

---

### Task 1: Portal the media viewer above global navigation

**Files:**
- Modify: `src/components/work/MediaViewer.jsx:1-48`
- Modify: `scripts/verify-desktop-experience.mjs`

**Interfaces:**
- Consumes: `project`, `onClose`, `document.body`, and the existing viewer JSX.
- Produces: `MediaViewer({ project, onClose })` returning `createPortal(viewer, document.body)` for a selected project and `null` otherwise.

- [ ] **Step 1: Add the failing portal contract**

Extend `scripts/verify-desktop-experience.mjs` to read `src/components/work/MediaViewer.jsx` and assert that it imports `createPortal` from `react-dom` and returns the viewer through `createPortal(..., document.body)`.

- [ ] **Step 2: Confirm the contract fails before implementation**

Run `pnpm run verify:desktop-experience`. Expect failure stating that MediaViewer must render through a portal.

- [ ] **Step 3: Implement the portal**

Import `createPortal` from `react-dom`. Keep the early `if (!project) return null` guard. Wrap the existing viewer JSX with `createPortal(` and pass `document.body` as the second argument. Do not change the viewer markup, event handlers, or CSS classes.

- [ ] **Step 4: Run automated checks**

Run `pnpm run verify:desktop-experience` and expect all assertions to pass. Run `pnpm run build` and expect a successful Vite production build.

- [ ] **Step 5: Run desktop browser QA**

At `http://localhost:5174/#projects`, open the AOC project. Confirm the global header is visually absent, the viewer title and close button remain visible, the three images remain present, and the URL stays on `#projects`. Close the viewer and confirm the header returns. Open one category detail page and confirm its media viewer still opens normally.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/components/work/MediaViewer.jsx scripts/verify-desktop-experience.mjs
git commit -m "fix: cover navigation with media viewer"
```
