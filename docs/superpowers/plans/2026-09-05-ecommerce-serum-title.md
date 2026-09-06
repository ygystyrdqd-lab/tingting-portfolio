# Ecommerce Serum Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the ecommerce category's second project to 瑞美亚精华液 everywhere its project data is presented.

**Architecture:** Update the single source-of-truth project object so the card and media viewer inherit the new title, and update the associated image alternative text for consistency. No component or styling changes are required.

**Tech Stack:** React, Vite, JavaScript data module
**Spec:** `docs/superpowers/specs/2026-09-05-ecommerce-serum-title-design.md`

## Global Constraints

- Change only the title and image alternative text of `ecommerce-02`.
- Preserve its ID, metadata, cover, detail image, layout, and interactions.
- Do not modify the AIGC video project named 瑞美亚精华液广告.

---

### Task 1: Rename the ecommerce serum project

**Files:**
- Modify: `src/data/workCategories.js:47-56`

**Interfaces:**
- Consumes: the existing `ecommerce-02` project object
- Produces: the same project object with consistent new Chinese copy

- [x] **Step 1: Update the two strings**

```js
title: '瑞美亚精华液',
// ...
alt: '瑞美亚精华液电商视觉详情',
```

- [x] **Step 2: Confirm the old project name is absent from runtime source**

Run `rg -n "Eternal Cell 焕亮精华液" src` and expect no matches.

- [x] **Step 3: Run static verification**

Run `pnpm run lint` and expect no new errors. Run `pnpm run build` and expect a successful build; record the existing unrelated warning separately.

### Task 2: Verify visible copy and responsive layout

**Files:**
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/MediaViewer.jsx`

**Interfaces:**
- Consumes: updated `ecommerce-02` data from Task 1
- Produces: verified card title, dialog title, image alt text, and responsive layout

- [x] **Step 1: Verify desktop rendering**

Open `http://127.0.0.1:5173/?category=ecommerce`. Confirm the second card reads 瑞美亚精华液, its detail dialog has the same title, its image alt text is 瑞美亚精华液电商视觉详情, and there is no horizontal overflow.

- [x] **Step 2: Verify mobile rendering**

Set the viewport to 390×844. Confirm the updated title fits the second card without clipping and the page has no horizontal overflow. Reset the viewport afterward.

- [x] **Step 3: Inspect runtime logs**

Confirm the browser console contains no new React or runtime errors.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. Static checks and desktop/mobile browser verification provide the execution record.
