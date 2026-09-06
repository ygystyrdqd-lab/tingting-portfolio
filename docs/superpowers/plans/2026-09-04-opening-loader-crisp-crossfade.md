# Opening Loader Crisp Crossfade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the percentage motion transition with an undistorted `0.08s` crossfade while retaining the five-second opening sequence.

**Architecture:** Keep the current component, CSS, percentage arrival times, progress rail, and Hero handoff. Simplify only the GSAP number initialization and replacement tweens to opacity changes.

**Tech Stack:** React 19, Vite 8, GSAP 3
**Spec:** `docs/superpowers/specs/2026-09-04-opening-loader-crisp-crossfade-design.md`

## Global Constraints

- Keep `openingStepTimes` equal to `[.72, 1.44, 2.16, 2.92]`.
- Fade outgoing and incoming values over exactly `.08s` at the same timeline position.
- Do not animate number translation, filter, or scale.
- Keep progress timing, Hero handoff, overlay exit, and total duration unchanged.
- Do not change markup, CSS, dependencies, accessibility, reduced motion, scroll locking, or cleanup.
- The workspace is not a Git repository, so implementation steps do not include commits.

---

### Task 1: Replace number motion with a crisp crossfade

**Files:**
- Modify: `src/hooks/usePortfolioAnimations.js:74-88`
- Test: `http://127.0.0.1:5173/`

**Interfaces:**
- Consumes: existing `openingNumbers`, `openingProgress`, and `openingStepTimes`.
- Produces: the same opening timeline with opacity-only number replacement.

- [ ] **Step 1: Record the current distorted states**

Run:

```powershell
rg -n "set\(openingNumbers|set\(openingNumbers\[0\]|to\(openingNumbers\[index\]|fromTo\(number" src/hooks/usePortfolioAnimations.js
```

Expected: translation, scale, blur, and `.14/.18` durations are present.

- [ ] **Step 2: Simplify number initialization**

Replace the shared initialization with:

```js
.set(openingNumbers, { autoAlpha: 0 })
```

Replace the first-number initialization with:

```js
if (openingNumbers[0]) opening.set(openingNumbers[0], { autoAlpha: 1 }, 0)
```

- [ ] **Step 3: Replace transition tweens with opacity-only crossfades**

Inside the existing loop, use:

```js
opening
  .to(openingNumbers[index], { autoAlpha: 0, duration: .08, ease: 'power1.out' }, time)
  .fromTo(number, { autoAlpha: 0 }, { autoAlpha: 1, duration: .08, ease: 'power1.out' }, time)
```

Keep the existing progress tween immediately afterward. Do not change `openingStepTimes` or any timeline positions after the loop.

- [ ] **Step 4: Run lint and production build**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run lint
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run build
```

Expected: both commands succeed. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain; no warning should reference the animation hook.

- [ ] **Step 5: Verify clear stable frames**

Reload the preview and sample at approximately `0.35s`, `1.05s`, `1.78s`, `2.50s`, and `3.25s`.

Expected: exactly one number is visible at opacity `1` at every sample, with computed filter `none` and transform `none`.

- [ ] **Step 6: Verify transition and cleanup**

Observe one number change, wait through the full opening, scroll, and inspect the console.

Expected: the number change is a brief clean fade with no movement or distortion; progress stays synchronized; the overlay exits around five seconds; scrolling is restored; no new runtime errors appear.

- [ ] **Step 7: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and reload.

Expected: the opening is skipped immediately and the page remains visible and scrollable.
