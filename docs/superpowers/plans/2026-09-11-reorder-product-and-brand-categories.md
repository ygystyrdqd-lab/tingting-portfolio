# Product and Brand Category Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Product Visual the first work category and Brand Visual the second while preserving each category's complete secondary-page content and stable URL.

**Architecture:** The work list and detail lookup both derive from `src/data/workCategories.js`. Reorder the first two category objects and update only their display numbers; keep each object's slug, projects, media, theme, and copy intact so entry links and detail pages continue to resolve correctly.

**Tech Stack:** React 19, JavaScript, Vite 8, existing source verification and Playwright browser QA.
**Spec:** `docs/superpowers/specs/2026-09-11-reorder-product-and-brand-categories-design.md`

## Global Constraints

- Product Visual must be `01`; Brand Visual must be `02`.
- Keep `?category=ecommerce` and `?category=brand` unchanged.
- Do not modify category media, projects, copy, themes, or categories from position 3 onward.
- Preserve the current hover, entry-animation, back-navigation, and scroll-to-top behavior.

---

### Task 1: Reorder the two work category records

**Files:**
- Modify: `src/data/workCategories.js:3-77`

**Interfaces:**
- Consumes: `rawWorkCategories`, `resolveCategoryAssets(categories)`, and `getWorkCategory(slug)`.
- Produces: `workCategories[0]` as Product Visual with number `01`, and `workCategories[1]` as Brand Visual with number `02`.

- [ ] **Step 1: Record the failing order check**

Run a read-only source check that locates `slug: 'ecommerce'`, `slug: 'brand'`, and their adjacent number fields. Before the implementation, expect Brand Visual to appear before Product Visual.

- [ ] **Step 2: Apply the minimal data change**

Move the complete `ecommerce` category object above the complete `brand` category object. Change Product Visual's `number` from `02` to `01` and Brand Visual's `number` from `01` to `02`. Do not edit any other property inside either object.

- [ ] **Step 3: Verify source invariants**

Confirm Product Visual precedes Brand Visual, the slugs remain `ecommerce` and `brand`, Product Visual still has three projects, Brand Visual still has one project, and category `03` remains Packaging.

- [ ] **Step 4: Run automated project checks**

Run `pnpm run verify:desktop-experience` and expect `Desktop hero and mobile access gate verified`. Run `pnpm run build` and expect a successful Vite production build.

- [ ] **Step 5: Verify in the desktop browser**

At `http://localhost:5174/#capabilities`, confirm the first two entries are `01 产品视觉设计` and `02 品牌视觉设计`. Click each entry and confirm the first opens `?category=ecommerce` with three project cards, while the second opens `?category=brand` with one project card; both pages must start at the top.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/data/workCategories.js
git commit -m "feat: prioritize product visual category"
```
