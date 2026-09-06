# Opening Loader Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every percentage value clearly readable by shortening and softening its GSAP transition without changing the five-second opening structure.

**Architecture:** Keep the existing component, CSS, arrival times, progress rail, and Hero handoff. Modify only the initial number state and the incoming/outgoing number tween properties inside `usePortfolioAnimations`.

**Tech Stack:** React 19, Vite 8, GSAP 3
**Spec:** `docs/superpowers/specs/2026-09-04-opening-loader-clarity-design.md`

## Global Constraints

- Keep the arrival times `[0.72, 1.44, 2.16, 2.92]` unchanged.
- Use outgoing duration `0.14s` and incoming duration `0.18s`.
- Use incoming blur `2px` and outgoing blur `1px`.
- Use incoming `scaleX: 0.96` and outgoing `scaleX: 0.98`.
- Keep the current easing, progress timing, Hero handoff, and total duration unchanged.
- Do not change markup, CSS, dependencies, reduced-motion behavior, scroll locking, or cleanup.
- The workspace is not a Git repository, so implementation steps do not include commits.

---

### Task 1: Reduce percentage transition distortion

**Files:**
- Modify: `src/hooks/usePortfolioAnimations.js:74-88`
- Test: `http://127.0.0.1:5173/`

**Interfaces:**
- Consumes: the existing `openingNumbers` array and `openingStepTimes` values.
- Produces: the same GSAP opening timeline with shorter, lower-distortion transitions.

- [ ] **Step 1: Capture the current transition properties**

Run:

```powershell
rg -n "openingStepTimes|set\(openingNumbers|to\(openingNumbers\[index\]|fromTo\(number" src/hooks/usePortfolioAnimations.js
```

Expected: initial `scaleX: .82`, incoming blur `8px`, outgoing blur `6px`, outgoing duration `.32`, and incoming duration `.4` are shown.

- [ ] **Step 2: Reduce distortion in the shared initial state**

Change the number initialization to:

```js
.set(openingNumbers, { yPercent: 120, autoAlpha: 0, scaleX: .96, filter: 'blur(2px)', transformOrigin: 'center center' })
```

Expected: numbers still begin below the clipping window but no longer start heavily compressed or blurred.

- [ ] **Step 3: Replace the outgoing and incoming transition properties**

Use exactly:

```js
.to(openingNumbers[index], { yPercent: -120, autoAlpha: 0, scaleX: .98, filter: 'blur(1px)', duration: .14, ease: 'power3.in' }, time)
.fromTo(number, { yPercent: 120, autoAlpha: 0, scaleX: .96, filter: 'blur(2px)' }, { yPercent: 0, autoAlpha: 1, scaleX: 1, filter: 'blur(0px)', duration: .18, ease: 'power4.out' }, time)
```

Do not modify `openingStepTimes` or the `.24s` progress tween.

- [ ] **Step 4: Run static checks and production build**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run lint
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run build
```

Expected: both commands succeed. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain; the animation hook must not add a warning.

- [ ] **Step 5: Verify stable reading frames**

Reload the local preview and inspect the sequence at approximately `0.35s`, `1.05s`, `1.78s`, `2.50s`, and `3.25s`.

Expected: each sample contains one dominant value at opacity `1`, blur `0px`, and `scaleX: 1`. The readable values are `10%`, `20%`, `30%`, `40%`, and `100%` in that order.

- [ ] **Step 6: Verify handoff and runtime state**

Observe the opening through five seconds, scroll after completion, and inspect browser console warnings/errors.

Expected: progress remains synchronized, the Hero transition is unchanged, the overlay exits around five seconds, scrolling is restored, and no new runtime errors appear.

- [ ] **Step 7: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and reload.

Expected: the opening overlay is skipped immediately and the page remains visible and scrollable.
