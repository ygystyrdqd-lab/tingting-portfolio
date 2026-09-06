# Navigation Target Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the confirmed C mapping: `作品 → #capabilities`, `优势 → #projects`, with Capabilities rendered before Projects.

**Architecture:** Change only the `navItems` tuples and the two component calls in `src/App.jsx`. Preserve the already-shortened four-row capability data and all component internals.

**Tech Stack:** React 19, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-02-navigation-section-order-design.md`

## Global Constraints

- Keep navigation labels ordered as `首页 / 关于 / 作品 / 优势`.
- Map `作品` to `capabilities` and `优势` to `projects` exactly.
- Render `Capabilities` before `Projects`.
- Do not restore the deleted AIGC capability.
- Do not modify CSS, IDs, content, or interactions.
- The workspace has no Git repository, so commit steps are omitted.

---

### Task 1: Correct navigation targets and module order

**Files:**
- Modify: `src/App.jsx:6,154`

**Interfaces:**
- Consumes: `navItems`, `Capabilities`, and `Projects`.
- Produces: the confirmed navigation mapping and render order.

- [ ] **Step 1: Apply the exact navigation tuple list**

```jsx
const navItems = [['首页', 'home'], ['关于', 'about'], ['作品', 'capabilities'], ['优势', 'projects']]
```

- [ ] **Step 2: Restore the component order**

```jsx
<main><Hero /><Marquee /><About /><Capabilities /><Projects /></main>
```

- [ ] **Step 3: Verify the mapping, order, and deletion**

Run:

```powershell
rg -n "\['作品', 'capabilities'\]|\['优势', 'projects'\]|<Capabilities /><Projects />|AIGC 创意工作流" src/App.jsx
```

Expected: the first three patterns match and `AIGC 创意工作流` does not match.

### Task 2: Validate the local deliverable

**Files:**
- Verify: `src/App.jsx`

**Interfaces:**
- Consumes: Task 1.
- Produces: a compilable local site with the confirmed target mapping.

- [ ] **Step 1: Run the production build**

Run the existing `pnpm run build` script with the bundled Node runtime on `PATH`.

Expected: Vite exits with code 0 and emits `dist/index.html`.

- [ ] **Step 2: Verify the local route**

Request `http://127.0.0.1:5173/#home`.

Expected: HTTP 200. Do not perform screenshot, DOM, click, or resize testing unless the user separately requests browser QA.
