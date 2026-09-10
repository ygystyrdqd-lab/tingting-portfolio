# Desktop Hero and Mobile Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the PC hero headline with a one-line “PERSONAL PORTFOLIO”, enlarge its fan cards, and show a branded desktop-only notice below 768px.

**Architecture:** Keep the existing `IntroHero` animation contract and alter only its copy and wide-screen layout rules. Add a focused `MobileAccessGate` component and a viewport state in `App` so narrow screens render the notice instead of mounting the portfolio experience.

**Tech Stack:** React 19, Vite 8, CSS, GSAP, Node verification scripts
**Spec:** `docs/superpowers/specs/2026-09-10-desktop-hero-and-mobile-gate-design.md`

## Global Constraints

- Use `PERSONAL PORTFOLIO` as one unbroken PC headline.
- Keep `PERSONAL` ivory and emphasize `PORTFOLIO` with the existing champagne token.
- Enlarge the five fan cards by approximately 12% only in the wide-screen layout.
- Preserve the existing animation selectors and reduced-motion behavior.
- At `767px` and below, render only the desktop-access notice; at `768px` and above, render the portfolio.
- Add no image assets, dependencies, or high-cost mobile animation.

---

### Task 1: Lock the responsive behavior with a source verification script

**Files:**
- Create: `scripts/verify-desktop-experience.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: source files `src/App.jsx`, `src/components/hero/IntroHero.jsx`, `src/components/hero/IntroHero.css`, and `src/components/mobile/MobileAccessGate.css`
- Produces: `pnpm run verify:desktop-experience`, exiting nonzero when the required title, breakpoint, gate, or wide-screen card sizing is absent

- [ ] **Step 1: Write the failing verification script**

```js
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const app = read('src/App.jsx')
const hero = read('src/components/hero/IntroHero.jsx')
const heroCss = read('src/components/hero/IntroHero.css')
const gateCss = read('src/components/mobile/MobileAccessGate.css')

assert(hero.includes('aria-label="Personal Portfolio"'), 'Hero accessible title is missing')
assert(hero.includes('PERSONAL <em>PORTFOLIO</em>'), 'Hero must render the one-line title')
assert(heroCss.includes('@media(min-width:901px)'), 'Wide-screen hero rules are missing')
assert(heroCss.includes('width:213px'), 'Wide-screen fan cards are not enlarged')
assert(app.includes("'(min-width: 768px)'"), 'Desktop breakpoint is missing')
assert(app.includes('return <MobileAccessGate />'), 'Mobile gate branch is missing')
assert(gateCss.includes('@media(min-width:768px)'), 'Gate visibility breakpoint is missing')

console.log('Desktop hero and mobile access gate verified')
```

- [ ] **Step 2: Register and run the check to confirm it fails**

Add to `package.json`:

```json
"verify:desktop-experience": "node scripts/verify-desktop-experience.mjs"
```

Run: `pnpm run verify:desktop-experience`

Expected: FAIL because `MobileAccessGate.css` and the new title do not exist yet.

- [ ] **Step 3: Commit the failing check**

```bash
git add package.json scripts/verify-desktop-experience.mjs
git commit -m "test: define desktop portfolio experience"
```

### Task 2: Add the mobile desktop-access gate

**Files:**
- Create: `src/components/mobile/MobileAccessGate.jsx`
- Create: `src/components/mobile/MobileAccessGate.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `MobileAccessGate(): JSX.Element`
- Consumes: `window.matchMedia('(min-width: 768px)')`
- Produces: `isDesktop: boolean`, updated when the viewport crosses 768px

- [ ] **Step 1: Create the branded gate component**

```jsx
import './MobileAccessGate.css'

export default function MobileAccessGate() {
  return <main className="mobile-access-gate" role="status">
    <div className="mobile-access-gate__grid" aria-hidden="true" />
    <div className="mobile-access-gate__content">
      <div className="mobile-access-gate__brand"><span>LT</span><i /></div>
      <p className="mobile-access-gate__eyebrow"><i /> DESKTOP EXPERIENCE</p>
      <h1>请使用<br /><em>电脑端访问</em></h1>
      <p>为呈现完整的作品细节与动态体验，<br />请在电脑浏览器中打开本网站。</p>
      <small>PERSONAL PORTFOLIO · 2026</small>
    </div>
  </main>
}
```

- [ ] **Step 2: Style a lightweight full-screen notice**

Use a deep brown-black background, champagne accents, one static grid layer, and no animations. Default it to `display:grid`, then hide it for the supported experience:

```css
.mobile-access-gate{min-height:100svh;display:grid;place-items:center;position:relative;overflow:hidden;color:var(--ivory);background:radial-gradient(circle at 50% 32%,rgba(116,62,66,.24),transparent 35%),#090706}
.mobile-access-gate__grid{position:absolute;inset:0;opacity:.3;background-image:linear-gradient(rgba(208,173,125,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(208,173,125,.1) 1px,transparent 1px);background-size:42px 42px;mask-image:radial-gradient(circle at center,black,transparent 78%)}
.mobile-access-gate__content{position:relative;width:min(86vw,420px);text-align:center}
.mobile-access-gate__brand{display:inline-flex;align-items:center;gap:8px;margin-bottom:52px}.mobile-access-gate__brand span{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;color:#17110d;background:var(--champagne);font-weight:800}.mobile-access-gate__brand i{width:5px;height:5px;border-radius:50%;background:var(--champagne);box-shadow:0 0 12px var(--champagne)}
.mobile-access-gate__eyebrow{display:flex;justify-content:center;align-items:center;gap:8px;color:var(--champagne);font-size:9px;letter-spacing:.18em}.mobile-access-gate__eyebrow i{width:24px;height:1px;background:currentColor}
.mobile-access-gate h1{margin:24px 0;font-size:clamp(48px,14vw,72px);line-height:.9;letter-spacing:-.07em}.mobile-access-gate h1 em{color:var(--champagne);font-style:normal}.mobile-access-gate__content>p:not(.mobile-access-gate__eyebrow){color:rgba(240,236,229,.58);font-size:13px;line-height:1.8}.mobile-access-gate small{display:block;margin-top:56px;color:rgba(240,236,229,.32);font-size:8px;letter-spacing:.16em}
@media(min-width:768px){.mobile-access-gate{display:none}}
```

- [ ] **Step 3: Gate the portfolio render in `App`**

Import `MobileAccessGate`. Add viewport state and a change listener while leaving hooks unconditional:

```jsx
const desktopMedia = '(min-width: 768px)'

export default function App() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(desktopMedia).matches)
  // existing state and refs
  usePortfolioAnimations(mainPageRef, shouldAnimateHome && isDesktop)

  useEffect(() => {
    const query = window.matchMedia(desktopMedia)
    const syncViewport = () => setIsDesktop(query.matches)
    syncViewport()
    query.addEventListener('change', syncViewport)
    return () => query.removeEventListener('change', syncViewport)
  }, [])

  // existing effects and handlers
  if (!isDesktop) return <MobileAccessGate />
  // existing category and home returns
}
```

- [ ] **Step 4: Run focused and baseline checks**

Run: `pnpm run lint && pnpm run build`

Expected: build passes; lint has no new errors.

- [ ] **Step 5: Commit the access gate**

```bash
git add src/App.jsx src/components/mobile/MobileAccessGate.jsx src/components/mobile/MobileAccessGate.css
git commit -m "feat: add desktop-only portfolio gate"
```

### Task 3: Retype and rebalance the PC intro hero

**Files:**
- Modify: `src/components/hero/IntroHero.jsx`
- Modify: `src/components/hero/IntroHero.css`

**Interfaces:**
- Consumes: the existing GSAP selectors `[data-intro-title]`, `[data-intro-fan]`, and `[data-intro-card]`
- Produces: a single animated title line and enlarged wide-screen card geometry

- [ ] **Step 1: Replace the title without changing animation hooks**

```jsx
<h1 className="intro-hero__title" aria-label="Personal Portfolio">
  <span className="intro-hero__title-line"><span data-intro-title>PERSONAL <em>PORTFOLIO</em></span></span>
</h1>
```

- [ ] **Step 2: Add wide-screen-only card geometry**

Append these rules before the existing `max-width:900px` block so narrow layouts retain their current dimensions:

```css
@media(min-width:901px){
  .intro-hero__title{font-size:clamp(64px,7.4vw,108px);white-space:nowrap}
  .intro-fan{width:min(980px,92vw);height:370px;margin-top:34px}
  .intro-fan__slot{width:213px}
  .intro-fan__slot--1{transform:translateX(-414px) translateY(58px) rotate(-16deg)}
  .intro-fan__slot--2{transform:translateX(-258px) translateY(22px) rotate(-8deg)}
  .intro-fan__slot--3{width:255px;transform:translateX(-128px) translateY(2px)}
  .intro-fan__slot--4{transform:translateX(45px) translateY(22px) rotate(8deg)}
  .intro-fan__slot--5{transform:translateX(202px) translateY(58px) rotate(16deg)}
}
```

- [ ] **Step 3: Run the focused verification**

Run: `pnpm run verify:desktop-experience`

Expected: PASS with `Desktop hero and mobile access gate verified`.

- [ ] **Step 4: Commit the hero refinement**

```bash
git add src/components/hero/IntroHero.jsx src/components/hero/IntroHero.css
git commit -m "feat: refine desktop portfolio hero"
```

### Task 4: Perform bounded visual and production verification

**Files:**
- Modify only if verification exposes a concrete defect: `src/components/hero/IntroHero.css`, `src/components/mobile/MobileAccessGate.css`

**Interfaces:**
- Consumes: production build and local preview
- Produces: verified layouts at 1440×900, 1920×1080, 768×900, and 390×844

- [ ] **Step 1: Run the complete automated check set**

Run:

```bash
pnpm run lint
pnpm run verify:desktop-experience
pnpm run build
node scripts/verify-pages-paths.mjs
```

Expected: all checks pass; the existing Fast Refresh warning in `src/components/ui/button.tsx` may remain unchanged.

- [ ] **Step 2: Inspect all target viewports in one visual pass**

Start the local preview and capture the four target viewports. Confirm:

- At 1440×900 and 1920×1080, `PERSONAL PORTFOLIO` is one line, unobstructed, and the five cards fit inside the viewport.
- At 768×900, the full portfolio renders.
- At 390×844, only the static desktop-access notice renders.

- [ ] **Step 3: Apply at most one corrective CSS batch and recheck once**

If the visual pass finds overlap or clipping, adjust only the media-query geometry in the two CSS files, then repeat Step 1 and one final screenshot pass.

- [ ] **Step 4: Commit any verification correction**

```bash
git add src/components/hero/IntroHero.css src/components/mobile/MobileAccessGate.css
git commit -m "fix: finalize desktop hero responsive bounds"
```

### Task 5: Publish and verify GitHub Pages

**Files:**
- No source changes expected

**Interfaces:**
- Consumes: GitHub repository `ygystyrdqd-lab/tingting-portfolio`, branch `main`
- Produces: live deployment at `https://ygystyrdqd-lab.github.io/tingting-portfolio/`

- [ ] **Step 1: Publish the verified commits to GitHub**

Use the repository's authenticated publishing path, excluding `.env.local`, `.superpowers`, `node_modules`, `dist`, and the two release-hosted video working files.

- [ ] **Step 2: Wait for the Pages workflow**

Expected: the latest `Deploy GitHub Pages` run completes with conclusion `success`.

- [ ] **Step 3: Verify live assets and rendering**

Open `https://ygystyrdqd-lab.github.io/tingting-portfolio/` with a cache-busting query. Confirm the live bundle contains `Personal Portfolio`, the five card images return HTTP 200, desktop renders the full hero, and a narrow viewport shows the gate.

- [ ] **Step 4: Report the result**

Provide the live URL and summarize the PC title/card change plus the mobile access behavior.
