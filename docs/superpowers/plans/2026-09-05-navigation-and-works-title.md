# Navigation and Works Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the final navigation item to 项目 and retitle the third screen as SELECTED WORKS without changing anchors, structure, or animation hooks.

**Architecture:** Both visible strings live in `src/App.jsx`; update only the navigation label and heading text. Preserve the existing `projects` and `capabilities` identifiers so navigation and GSAP behavior continue unchanged.

**Tech Stack:** React, Vite, GSAP
**Spec:** `docs/superpowers/specs/2026-09-05-navigation-and-works-title-design.md`

## Global Constraints

- Final navigation labels must be 首页 / 关于 / 作品 / 项目.
- The 项目 item must keep target `projects`; the 作品 item must keep target `capabilities`.
- The third-screen title must render as two lines: SELECTED / WORKS.
- Preserve all section IDs, data attributes, category links, styling, and animations.

---

### Task 1: Update navigation and third-screen title copy

**Files:**
- Modify: `src/App.jsx:12`
- Modify: `src/App.jsx:172`

**Interfaces:**
- Consumes: the existing `navItems` array and `Capabilities` heading
- Produces: updated visible labels with unchanged anchor identifiers and animation attributes

- [x] **Step 1: Change the final navigation label while preserving its target**

```jsx
const navItems = [['首页', 'home'], ['关于', 'about'], ['作品', 'capabilities'], ['项目', 'projects']]
```

- [x] **Step 2: Change the third-screen heading while preserving its animation hook**

```jsx
<div className="capability-intro"><h2 data-section-title="capabilities">SELECTED<br />WORKS</h2><p data-capability-intro>从策略到落地，建立兼顾品牌一致性与传播效率的视觉表达。</p></div>
```

- [x] **Step 3: Verify source invariants**

Confirm `navItems` contains `['项目', 'projects']` and `['作品', 'capabilities']`, the title contains `SELECTED<br />WORKS`, and the third-screen section remains `id="capabilities"` with `data-motion-section="capabilities"`.

- [x] **Step 4: Run static checks**

Run `pnpm run lint` and expect no new errors. Run `pnpm run build` and expect a successful production build; record the existing unrelated warning separately.

### Task 2: Verify navigation, title, animation, and responsive layout

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/hooks/usePortfolioAnimations.js`
- Verify: `src/App.css`

**Interfaces:**
- Consumes: updated copy from Task 1
- Produces: verified navigation destinations and responsive third-screen title

- [x] **Step 1: Verify desktop rendering and anchors**

Open `http://127.0.0.1:5173/#capabilities`. Confirm navigation labels are 首页 / 关于 / 作品 / 项目, the title text is SELECTED WORKS, the title is split across two lines, and there is no horizontal overflow. Confirm the two link destinations remain `#capabilities` and `#projects`.

- [x] **Step 2: Verify the projects navigation item**

Activate 项目 and confirm the URL becomes `#projects` and the projects section is aligned in the viewport.

- [x] **Step 3: Verify mobile rendering**

Set the viewport to 390×844. Confirm SELECTED / WORKS is readable without clipping or horizontal overflow and the navigation remains usable. Reset the viewport afterward.

- [x] **Step 4: Inspect runtime logs**

Confirm the browser console contains no GSAP, React, or runtime errors introduced by the copy changes.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. Static checks and desktop/mobile browser verification provide the execution record.
