# Intro Sequential Text and Card Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the intro headline reveal quickly from left to right before five fan cards expand from the center, with the center card rendered at 1.25× the width of the side cards.

**Architecture:** Keep the existing `IntroHero` markup and GSAP opening timeline. CSS owns the final desktop/tablet/mobile fan geometry, while `usePortfolioAnimations` owns only the temporary opening state and sequencing; this preserves existing hover interactions and avoids another animation dependency.

**Tech Stack:** React 19, Vite 8, GSAP 3, CSS media queries
**Spec:** `docs/superpowers/specs/2026-09-04-intro-sequential-text-card-motion-design.md`

## Global Constraints

- Preserve the current percentage loader, intro copy, card content, background, and page structure.
- Do not restore the removed accordion gallery.
- Do not modify the profile, about, works, capabilities, or category-detail sections.
- Use the existing GSAP dependency; add no packages.
- Use non-elastic `power3.out` / `power4.out` easing and no bounce.
- Keep the full opening at approximately `5.4–5.6s`.
- Honor `prefers-reduced-motion: reduce` by showing the final state without staged movement.
- This workspace is not a Git repository, so commit steps are intentionally omitted.

---

## File Structure

- `src/components/hero/IntroHero.css`: final fan layout, center-card size and responsive geometry, and title reveal rendering hints.
- `src/hooks/usePortfolioAnimations.js`: opening timeline setup, title wipe timing, center-out card stagger, and cleanup.
- No JSX changes are required because `data-intro-title`, `data-intro-card`, and `data-intro-fan` hooks already exist.

### Task 1: Establish the 1.25× center-card geometry

**Files:**
- Modify: `src/components/hero/IntroHero.css:14-24`
- Modify: `src/components/hero/IntroHero.css:49-58`
- Modify: `src/components/hero/IntroHero.css:62-73`

**Interfaces:**
- Consumes: existing `.intro-fan__slot--1` through `.intro-fan__slot--5` markup from `IntroHero.jsx`.
- Produces: final card positions measured by `getBoundingClientRect()` in `usePortfolioAnimations.js`.

- [ ] **Step 1: Record the current responsive geometry**

Run:

```powershell
rg -n "intro-fan__slot|intro-hero__title-line" src/components/hero/IntroHero.css
```

Expected: desktop widths are `190px`, tablet widths are `150px`, and mobile widths are `112px`; all center slots currently inherit those widths.

- [ ] **Step 2: Add left-to-right reveal rendering support and desktop center-card sizing**

Replace the title element rule and desktop center slot rule with:

```css
.intro-hero__title-line>[data-intro-title]{display:block;will-change:transform,opacity,clip-path}
.intro-fan__slot--3{z-index:5;width:238px;transform:translateX(-119px) translateY(-22px)}
```

Keep the four side-card positions and their `190px` inherited width unchanged.

- [ ] **Step 3: Add tablet center-card sizing**

Inside `@media(max-width:900px)`, replace the center slot rule with:

```css
.intro-fan__slot--3{width:188px;transform:translateX(-94px) translateY(-16px)}
```

This keeps the center card at approximately `1.25×` the `150px` side-card width.

- [ ] **Step 4: Add mobile center-card sizing**

Inside `@media(max-width:620px)`, replace the center slot rule with:

```css
.intro-fan__slot--3{width:140px;transform:translateX(-70px) translateY(-12px)}
```

This keeps the center card at `1.25×` the `112px` side-card width and centers it exactly by half its own width.

- [ ] **Step 5: Build after the geometry change**

Run:

```powershell
pnpm run build
```

Expected: Vite exits with code `0`; no CSS syntax error is reported.

### Task 2: Sequence the headline before the center-out card expansion

**Files:**
- Modify: `src/hooks/usePortfolioAnimations.js:68-109`

**Interfaces:**
- Consumes: `[data-intro-title]`, `[data-intro-copy]`, `[data-intro-card]`, `[data-intro-scroll]`, and `[data-intro-fan]` elements.
- Produces: one opening timeline whose `onComplete` callback remains `finishOpening`.

- [ ] **Step 1: Change the title's initial state from vertical compression to a horizontal wipe**

Replace:

```js
.set('[data-intro-title]', { yPercent: 115, scaleX: .84, autoAlpha: 0, transformOrigin: 'center center' })
```

with:

```js
.set('[data-intro-title]', { x: -34, clipPath: 'inset(0 100% 0 0)', autoAlpha: 0 })
```

- [ ] **Step 2: Replace the intro reveal segment with the approved timing**

Replace the timeline calls from the intro pill reveal through the overlay exit with:

```js
opening
  .to('[data-opening-loader]', { autoAlpha: 0, y: -24, duration: .35, ease: 'power3.in' }, 3.72)
  .to('[data-opening-overlay]', { yPercent: -100, duration: .52, ease: 'power3.inOut' }, 3.72)
  .to('[data-intro-pill]', { y: 0, autoAlpha: 1, duration: .3 }, 4.22)
  .to('[data-intro-title]', {
    x: 0,
    clipPath: 'inset(0 0% 0 0)',
    autoAlpha: 1,
    duration: .42,
    stagger: .08,
    ease: 'power3.out',
  }, 4.28)
  .to('[data-opening-header]', { autoAlpha: 1, duration: .65 }, 4.22)
  .to('[data-intro-copy]', { y: 0, autoAlpha: 1, duration: .3 }, 4.68)
  .fromTo(introCards, {
    x: (index) => cardOffsets[index],
    y: 72,
    scale: .72,
    autoAlpha: 0,
  }, {
    x: 0,
    y: 0,
    scale: 1,
    autoAlpha: 1,
    duration: .55,
    stagger: { each: .05, from: 'center' },
    ease: 'power3.out',
    clearProps: 'transform,opacity,visibility',
  }, 4.94)
  .to('[data-intro-scroll]', { y: 0, autoAlpha: 1, duration: .4 }, 5.16)
```

The loading overlay exits before the title begins, so it cannot hide the horizontal wipe. The second title line finishes around `4.78s`; cards start at `4.94s`, leaving the approved `0.16s` visual pause. `from: 'center'` produces center → inner pair → outer pair ordering.

- [ ] **Step 3: Run static checks**

Run:

```powershell
pnpm run lint
pnpm run build
```

Expected: build exits with code `0`. Lint introduces no new warning; the pre-existing `react(only-export-components)` warning in `src/components/ui/button.tsx` may remain.

### Task 3: Verify motion, layout, and fallback behavior

**Files:**
- Verify: `src/components/hero/IntroHero.css`
- Verify: `src/hooks/usePortfolioAnimations.js`

**Interfaces:**
- Consumes: the running Vite preview at `http://127.0.0.1:5173/#home`.
- Produces: visual acceptance evidence for desktop and mobile widths.

- [ ] **Step 1: Verify the full desktop opening**

Reload `http://127.0.0.1:5173/#home` at approximately `1440×900` and watch from the loader through the settled fan.

Expected:

```text
loader → pill → Designing wipe → Visual Experiences wipe → Chinese copy → center card → inner pair → outer pair
```

Confirm the title is not a plain fade, the center card is visibly 25% wider, no card is clipped, and the animation has no bounce or flash.

- [ ] **Step 2: Verify the settled desktop interactions**

Move the pointer across all five cards after the opening completes.

Expected: existing hover lift and border glow still work because GSAP cleared temporary inline transforms.

- [ ] **Step 3: Verify mobile layout**

Reload at approximately `390×844`.

Expected: the center `140px` card is fully visible, outside cards form a balanced fan without creating a horizontal scrollbar, and the title remains readable.

- [ ] **Step 4: Verify reduced motion**

Enable reduced-motion emulation and reload the page.

Expected: the loader and staged opening are skipped or immediately completed; the final title, copy, and all five cards remain visible and usable.

- [ ] **Step 5: Run the final regression checks**

Run:

```powershell
pnpm run lint
pnpm run build
```

Expected: build exits with code `0`, no new lint issue appears, and the rest of the site remains unchanged.
