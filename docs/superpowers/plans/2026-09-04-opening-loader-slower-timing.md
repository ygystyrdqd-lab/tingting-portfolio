# Opening Loader Slower Timing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slow the percentage opening so all five values are readable and the complete Hero handoff finishes in approximately five seconds.

**Architecture:** Retain the existing React markup and CSS. Change only the timing constants and tween positions in the existing GSAP opening timeline, preserving its cleanup, scroll lock, fail-safe, and reduced-motion behavior.

**Tech Stack:** React 19, Vite 8, GSAP 3
**Spec:** `docs/superpowers/specs/2026-09-04-opening-loader-slower-timing-design.md`

## Global Constraints

- Keep the value order exactly `10% → 20% → 30% → 40% → 100%`.
- Keep the current upward mask, compression, blur, progress rail, and non-bouncing easing.
- Use arrival times `[0.72, 1.44, 2.16, 2.92]` seconds for `20%`, `30%`, `40%`, and `100%`.
- Hold `100%` until approximately `3.72s`, then begin the loader-to-Hero handoff.
- Complete the overlay exit at approximately `5.0s`.
- Do not change React structure, CSS, dependencies, accessibility behavior, fail-safe cleanup, scroll locking, or reduced-motion behavior.
- This workspace is not a Git repository, so implementation steps do not include commits.

---

### Task 1: Retune the opening GSAP timeline

**Files:**
- Modify: `src/hooks/usePortfolioAnimations.js:70-98`
- Test: browser preview at `http://127.0.0.1:5173/`

**Interfaces:**
- Consumes: existing `[data-opening-number]`, `[data-opening-progress]`, `[data-opening-loader]`, `[data-opening-title]`, `[data-opening-avatar]`, `[data-opening-header]`, `[data-opening-meta]`, and `[data-opening-overlay]` elements.
- Produces: the same GSAP timeline lifecycle and cleanup contract with slower display timing.

- [ ] **Step 1: Record the current source values**

Run:

```powershell
rg -n "openingStepTimes|duration: \.22|duration: \.3|data-opening-loader|data-opening-title|data-opening-avatar|data-opening-header|data-opening-meta|data-opening-overlay" src/hooks/usePortfolioAnimations.js
```

Expected: the current fast arrivals `[.24, .48, .72, 1.04]` and the existing Hero handoff positions are shown.

- [ ] **Step 2: Replace the percentage arrival times**

Change the timing constant to:

```js
const openingStepTimes = [.72, 1.44, 2.16, 2.92]
```

This gives each displayed value roughly three times the current cadence while keeping the sequence compact enough for a five-second opening.

- [ ] **Step 3: Slow the masked replacement tween**

Change the outgoing tween duration from `.22` to `.32` and the incoming tween duration from `.3` to `.4`, preserving `power3.in` and `power4.out`:

```js
.to(openingNumbers[index], { yPercent: -120, autoAlpha: 0, scaleX: .88, filter: 'blur(6px)', duration: .32, ease: 'power3.in' }, time)
.fromTo(number, { yPercent: 120, autoAlpha: 0, scaleX: .82, filter: 'blur(8px)' }, { yPercent: 0, autoAlpha: 1, scaleX: 1, filter: 'blur(0px)', duration: .4, ease: 'power4.out' }, time)
```

Keep the progress tween duration at `.24` so the rail signals each new value promptly rather than lagging behind the number.

- [ ] **Step 4: Move the loader-to-Hero handoff later**

Replace the existing final timeline positions with:

```js
opening
  .to('[data-opening-title]', { yPercent: 0, scaleX: 1, letterSpacing: '', duration: 1, stagger: .12 }, 3.72)
  .to('[data-opening-loader]', { autoAlpha: 0, y: -24, duration: .35, ease: 'power3.in' }, 3.72)
  .to('[data-opening-avatar]', { y: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0 0 0)', duration: 1.05 }, 3.87)
  .to('[data-opening-header]', { autoAlpha: 1, duration: .65 }, 4.08)
  .to('[data-opening-meta]', { y: 0, autoAlpha: 1, duration: .78, stagger: .09 }, 4.12)
  .to('[data-opening-overlay]', { yPercent: -100, duration: .62, ease: 'power3.inOut' }, 4.38)
```

Expected: `100%` is fully resolved at about `3.32s`, remains readable for about `0.4s` before its fade begins, and remains partially visible through the `.35s` fade; the perceived hold is approximately `0.8s`. The overlay completes at `5.0s`.

- [ ] **Step 5: Run static validation and production build**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run lint
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run build
```

Expected: both commands exit successfully. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain; no new warning should reference the animation hook.

- [ ] **Step 6: Verify the complete opening in the browser**

Reload `http://127.0.0.1:5173/` and observe from the first frame through the overlay exit.

Expected:

- each value is readable before the next transition begins;
- only one value is fully visible at a time;
- the order and progress rail stay synchronized;
- `100%` has the longest perceived pause;
- the Hero begins after `100%` and the overlay finishes close to five seconds;
- the page can scroll after completion and the browser console contains no new errors.

- [ ] **Step 7: Verify reduced motion remains unchanged**

Emulate `prefers-reduced-motion: reduce` and reload.

Expected: the opening overlay is skipped immediately and the page remains visible and scrollable without a five-second delay.
