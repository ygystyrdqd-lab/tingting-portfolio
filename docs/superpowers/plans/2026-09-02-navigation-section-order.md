# Navigation and Section Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the navigation to `首页 / 关于 / 作品 / 优势`, align its targets with page order, and remove the fifth AIGC capability.

**Architecture:** Make a single focused data-and-composition change in `src/App.jsx`: update the navigation tuple list, remove one capability tuple, and swap the two component calls in the main render tree. Component markup, IDs, CSS, and interactions remain unchanged.

**Tech Stack:** React 19, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-02-navigation-section-order-design.md`

## Global Constraints

- Preserve `#home`, `#about`, `#projects`, and `#capabilities` IDs.
- Preserve all component internals and CSS.
- The page order after About must be Projects, then Capabilities.
- The capability list must end at `04` with no AIGC row.
- The workspace has no Git repository, so commit steps are omitted.

---

### Task 1: Align navigation, data, and render order

**Files:**
- Modify: `src/App.jsx:6-16,155`

**Interfaces:**
- Consumes: `navItems`, `capabilities`, `Projects`, and `Capabilities`.
- Produces: semantically aligned navigation and content order.

- [ ] **Step 1: Record the current mismatches**

Run:

```powershell
rg -n "\['能力', 'capabilities'\]|\['项目', 'projects'\]|AIGC 创意工作流|<Capabilities /><Projects />" src/App.jsx
```

Expected: all four current values are found.

- [ ] **Step 2: Update the navigation tuples**

Use:

```jsx
const navItems = [['首页', 'home'], ['关于', 'about'], ['作品', 'projects'], ['优势', 'capabilities']]
```

- [ ] **Step 3: Remove the fifth capability tuple**

The final array must be:

```jsx
const capabilities = [
  ['01', '品牌视觉设计', 'Brand Visual'], ['02', '电商与活动视觉', 'E-commerce'],
  ['03', '包装与物料延展', 'Packaging'], ['04', '三维视觉表现', '3D Visual'],
]
```

- [ ] **Step 4: Swap the two rendered sections**

The final main tree must contain:

```jsx
<main><Hero /><Marquee /><About /><Projects /><Capabilities /></main>
```

- [ ] **Step 5: Verify source state**

Run:

```powershell
rg -n "\['作品', 'projects'\]|\['优势', 'capabilities'\]|<Projects /><Capabilities />|AIGC 创意工作流" src/App.jsx
```

Expected: the first three patterns match and `AIGC 创意工作流` does not match.

### Task 2: Validate the local deliverable

**Files:**
- Verify: `src/App.jsx`

**Interfaces:**
- Consumes: Task 1.
- Produces: a compilable local site with correct labels, anchors, order, and four capability rows.

- [ ] **Step 1: Run the production build**

Run the existing `pnpm run build` script with the bundled Node runtime on `PATH`.

Expected: Vite exits with code 0 and emits `dist/index.html`.

- [ ] **Step 2: Verify the local route**

Request `http://127.0.0.1:5173/#home`.

Expected: HTTP 200. Do not perform screenshot, DOM, click, or resize testing unless the user separately requests browser QA.
