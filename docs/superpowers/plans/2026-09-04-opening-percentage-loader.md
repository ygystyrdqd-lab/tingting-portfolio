# Opening Percentage Loader Implementation Plan

> **For Codex:** Execute this plan task-by-task after the user chooses an execution mode. Keep the approved sequence and timing intact; do not convert it into real resource-loading state.

**Goal:** Replace the current opening badge with a deterministic `10% → 20% → 30% → 40% → 100%` masked-number animation that hands off smoothly to the existing Hero entrance.

**Architecture:** Keep `OpeningOverlay` presentational and store the five fixed values in that component. Extend the existing GSAP opening timeline in `usePortfolioAnimations` so the percentage sequence, progress rail, Hero entrance, and overlay exit remain one coordinated animation with the existing cleanup/fail-safe behavior. Replace only the obsolete opening-mark CSS while preserving the current overlay background and reduced-motion shortcut.

**Tech Stack:** React 19, Vite 8, GSAP 3, CSS

---

### Task 1: Replace the opening badge with percentage-loader markup

**Files:**
- Modify: `src/components/motion/OpeningOverlay.jsx`

**Step 1: Define the fixed display sequence**

Add a module-level constant so the order is explicit and easy to inspect:

```jsx
const loadingSteps = [10, 20, 30, 40, 100]
```

**Step 2: Replace the obsolete opening mark**

Inside the existing `opening-overlay`, keep `opening-panel` and replace `opening-mark` with this structure:

```jsx
<div className="opening-loader" data-opening-loader>
  <div className="opening-number-window">
    {loadingSteps.map((value) => (
      <span className="opening-number" data-opening-number key={value}>
        <strong>{value}</strong>
        <em>%</em>
      </span>
    ))}
  </div>
  <div className="opening-progress">
    <i data-opening-progress />
  </div>
</div>
```

Retain `aria-hidden="true"` on the overlay because this is decorative, not real loading status. Do not add timers, React state, or ARIA progress semantics.

**Step 3: Run a focused source check**

Run:

```powershell
rg -n "loadingSteps|data-opening-loader|data-opening-number|data-opening-progress|data-opening-mark" src/components/motion/OpeningOverlay.jsx
```

Expected: the five-value source and three new data hooks are present; `data-opening-mark` is absent.

---

### Task 2: Style the masked number sequence and progress rail

**Files:**
- Modify: `src/App.css:130-136`
- Modify: `src/App.css:157`

**Step 1: Remove the old badge styles**

Delete the `.opening-mark`, `.opening-mark>span`, `.opening-mark>i`, and `.opening-mark>small` rules. Preserve `.opening-overlay`, `.opening-panel`, and `.opening-panel:after` unchanged.

**Step 2: Add the desktop loader composition**

Add styles equivalent to:

```css
.opening-loader{position:relative;z-index:1;width:min(58vw,620px);display:grid;justify-items:center}
.opening-number-window{position:relative;width:100%;height:clamp(86px,14vw,210px);overflow:hidden}
.opening-number{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;line-height:.78;letter-spacing:-.08em;will-change:transform,opacity,filter}
.opening-number strong{font-size:clamp(72px,12vw,180px);font-weight:780}
.opening-number em{margin-left:.08em;align-self:flex-start;padding-top:.18em;color:var(--champagne);font-size:clamp(22px,3.2vw,48px);font-style:normal;font-weight:650;letter-spacing:-.04em}
.opening-progress{width:min(320px,62%);height:1px;margin-top:clamp(18px,2.4vw,34px);background:rgba(240,236,229,.12)}
.opening-progress i{display:block;width:100%;height:2px;transform:scaleX(.1);transform-origin:left center;background:var(--champagne);box-shadow:0 0 18px rgba(208,173,125,.6);will-change:transform}
```

Keep the typography visually dominant but contained within the mask at all viewport sizes. The percentage sign must remain smaller and champagne-colored.

**Step 3: Replace the obsolete mobile override**

Replace the `.opening-mark>span` mobile rule with:

```css
@media(max-width:620px){.opening-loader{width:82vw}.opening-number-window{height:100px}.opening-progress{width:72%}.contact-arrow{display:none}}
```

Leave the existing `prefers-reduced-motion` block in place; it already removes the overlay entirely for reduced-motion users.

**Step 4: Check for stale selectors**

Run:

```powershell
rg -n "opening-mark|opening-loader|opening-number|opening-progress" src/App.css
```

Expected: no `.opening-mark` rules remain, and the new desktop/mobile rules are present.

---

### Task 3: Coordinate the percentage sequence with the existing Hero opening

**Files:**
- Modify: `src/hooks/usePortfolioAnimations.js:68-81`

**Step 1: Capture the loader elements inside the GSAP context**

Before building the opening timeline, query the scoped root for all `[data-opening-number]` elements and the `[data-opening-progress]` fill. Keep this logic inside the existing GSAP context so cleanup remains automatic.

```js
const openingNumbers = gsap.utils.toArray('[data-opening-number]', root)
const openingProgress = root.querySelector('[data-opening-progress]')
```

**Step 2: Initialize every loading state explicitly**

In the existing opening timeline:

- initialize all number items below the mask with `yPercent: 120`, `autoAlpha: 0`, `scaleX: .82`, and `filter: 'blur(8px)'`;
- immediately place the first number at rest with `yPercent: 0`, `autoAlpha: 1`, `scaleX: 1`, and no blur;
- initialize the progress fill at `scaleX: .1` with a left-center transform origin;
- preserve the existing initial states for Hero title, avatar, header, and metadata.

Guard the array/fill assumptions so a missing optional node cannot prevent `finishOpening` from restoring scrolling.

**Step 3: Add the four masked number replacements**

Use the approved arrival times:

```js
const openingStepTimes = [.24, .48, .72, 1.04]
```

For each next item:

- move the previous item upward to `yPercent: -120`, fade it, compress it slightly, and reintroduce a small blur over about `.22s` with `power3.in`;
- bring the next item upward from below to rest over about `.30s` with `power4.out`;
- animate the progress fill to the matching fraction (`.2`, `.3`, `.4`, `1`) over about `.24s` with `power2.out`;
- use only transform, opacity, filter, and progress scale; do not add bounce, elastic easing, or layout-changing animation.

**Step 4: Retune the Hero handoff without changing its visual language**

Remove the old `[data-opening-mark]` animation calls. Schedule the existing Hero animation after `100%` arrives:

- loader fade/up: about `1.48s`, duration `.35s`;
- Hero title reveal: about `1.36s`, duration about `1.0s`, retaining the current stagger and horizontal decompression;
- Hero avatar reveal: about `1.52s`, duration about `1.05s`;
- header: about `1.82s`;
- Hero metadata: about `1.88s`;
- overlay upward exit: about `2.30s`, duration `.62s`, retaining `power3.inOut`.

The resulting opening should complete at approximately `2.9–3.0s`. Preserve `onComplete: finishOpening`, the existing `try/catch`, the fail-safe timeout, and timeline cleanup.

**Step 5: Run lint and production build**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands exit successfully with no new warnings or errors caused by the loader.

---

### Task 4: Verify the opening visually and behaviorally

**Files:**
- Verify: `src/components/motion/OpeningOverlay.jsx`
- Verify: `src/hooks/usePortfolioAnimations.js`
- Verify: `src/App.css`

**Step 1: Check the visible sequence on desktop**

Reload `http://127.0.0.1:5173/` at a desktop viewport and observe the full opening from the first frame.

Expected:

- only one number is visible at a time;
- the order is exactly `10%`, `20%`, `30%`, `40%`, `100%`;
- every replacement travels upward through a clipped window;
- the numerals briefly decompress and sharpen without bouncing;
- the thin rail reaches full width with `100%`;
- the old `LT / VISUAL DESIGN · SHENZHEN` opening mark never appears.

**Step 2: Check the Hero handoff and scroll restoration**

Observe the transition after `100%` and then scroll the page.

Expected: the loader recedes, the current Hero title/avatar/header/meta opening plays smoothly, the overlay exits upward, and the document becomes scrollable after completion.

**Step 3: Check mobile composition**

Repeat at approximately `390 × 844`.

Expected: the loader remains centered, the number does not clip horizontally, the progress rail stays proportionate, and the current mobile Hero layout remains intact after the opening.

**Step 4: Check reduced motion**

Emulate `prefers-reduced-motion: reduce` and reload.

Expected: the overlay is skipped, the page is immediately visible and scrollable, and no percentage animation delays access.

**Step 5: Inspect runtime health**

Check the browser console and network panel after a normal reload.

Expected: no React, GSAP, CSS, or missing-asset errors; no new dependency or remote request is introduced.

---

### Task 5: Final regression check

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/hooks/usePortfolioAnimations.js`
- Verify: `src/App.css`

**Step 1: Confirm unrelated sections still work**

After the opening, verify navigation anchors, the accordion gallery, About, capabilities, project spotlight cards, and contact section at a representative desktop width.

Expected: no layout shift or interaction regression outside the opening sequence.

**Step 2: Re-run final checks**

Run:

```powershell
npm run lint
npm run build
rg -n "data-opening-mark|opening-mark|10, 20, 30, 40, 100|data-opening-progress" src
```

Expected: lint/build pass; old mark selectors are absent; the approved sequence and progress hook remain present.
