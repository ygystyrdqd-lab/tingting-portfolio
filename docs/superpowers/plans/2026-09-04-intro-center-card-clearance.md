# Intro Center Card Clearance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the intro center card to 1.2× and move it downward so it no longer crowds the copy above it.

**Architecture:** Change only the final responsive geometry of `.intro-fan__slot--3` in `IntroHero.css`. The existing GSAP opening timeline already measures the final card rectangles at runtime, so it will automatically animate into the revised positions without JavaScript changes.

**Tech Stack:** CSS media queries, existing React 19 and GSAP 3 runtime
**Spec:** `docs/superpowers/specs/2026-09-04-intro-center-card-clearance-design.md`

## Global Constraints

- Only modify `.intro-fan__slot--3` geometry in `src/components/hero/IntroHero.css`.
- Keep the other four cards, title, copy, animation order, and opening duration unchanged.
- Center the card with a horizontal translation equal to half its own width.
- Add no dependencies and perform no unrelated refactoring.
- This workspace is not a Git repository, so commit steps are intentionally omitted.

---

## File Structure

- `src/components/hero/IntroHero.css`: owns the desktop, tablet, and mobile final center-card size and position.
- `src/hooks/usePortfolioAnimations.js`: unchanged; consumes the revised computed card rectangles automatically.

### Task 1: Update center-card responsive geometry

**Files:**
- Modify: `src/components/hero/IntroHero.css:22`
- Modify: `src/components/hero/IntroHero.css:56`
- Modify: `src/components/hero/IntroHero.css:71`

**Interfaces:**
- Consumes: `.intro-fan__slot--3` rendered by `IntroHero.jsx` and measured by `usePortfolioAnimations.js`.
- Produces: centered final widths and vertical positions for desktop, tablet, and mobile breakpoints.

- [ ] **Step 1: Confirm the current geometry**

Run:

```powershell
rg -n "intro-fan__slot--3" src/components/hero/IntroHero.css
```

Expected: the three current widths are `238px`, `188px`, and `140px`, with vertical translations of `-22px`, `-16px`, and `-12px`.

- [ ] **Step 2: Apply the approved desktop, tablet, and mobile values**

Replace the three center-slot declarations with:

```css
.intro-fan__slot--3{z-index:5;width:228px;transform:translateX(-114px) translateY(-8px)}

@media(max-width:900px){
  .intro-fan__slot--3{width:180px;transform:translateX(-90px) translateY(-6px)}
}

@media(max-width:620px){
  .intro-fan__slot--3{width:134px;transform:translateX(-67px) translateY(-4px)}
}
```

Keep these declarations in their existing rule locations rather than duplicating the media-query blocks.

- [ ] **Step 3: Run static checks**

Run:

```powershell
pnpm run lint
pnpm run build
```

Expected: Vite exits with code `0`; lint adds no issue beyond the pre-existing `react(only-export-components)` warning in `src/components/ui/button.tsx`.

### Task 2: Verify spacing and animation regression

**Files:**
- Verify: `src/components/hero/IntroHero.css`
- Verify: `src/hooks/usePortfolioAnimations.js`

**Interfaces:**
- Consumes: the running preview at `http://127.0.0.1:5173/#home`.
- Produces: visual confirmation that clearance improved without changing the opening sequence.

- [ ] **Step 1: Reload and watch the complete opening**

Reload the preview from the beginning.

Expected:

```text
loader → title wipe → copy → center card → inner pair → outer pair
```

The sequence and tempo must match the current implementation.

- [ ] **Step 2: Inspect the final desktop/tablet layout**

At the available desktop preview width, confirm the center card is still visibly larger than the side cards, centered in the fan, and separated from the Chinese copy above it.

- [ ] **Step 3: Inspect the mobile CSS geometry**

At a width at or below `620px`, confirm the center card resolves to `134px`, remains centered, and does not introduce new clipping or horizontal overflow in the intro section.

- [ ] **Step 4: Run final regression checks**

Run:

```powershell
pnpm run lint
pnpm run build
```

Expected: the production build succeeds and no new lint issue is present.
