# New Intro Hero With Fan Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new champagne-and-wine intro Hero with five cards expanding from the center, move the current character Hero to screen two, and remove the rendered accordion gallery.

**Architecture:** Create a focused `IntroHero` component and stylesheet that own the five-card content and layout. Integrate the section into `App.jsx`, then retarget the existing GSAP opening to the new intro and give the character Hero its own scroll-triggered reveal. Preserve the existing accordion source files without importing or rendering them.

**Tech Stack:** React 19, Vite 8, GSAP 3, CSS
**Spec:** `docs/superpowers/specs/2026-09-04-new-intro-hero-fan-cards-design.md`

## Global Constraints

- Render the new intro at `#home` before the existing character Hero at `#profile`.
- Remove the accordion gallery from the page flow without deleting its source files.
- Use exactly five placeholder cards and the approved `Designing / Visual Experiences` copy.
- Use the existing graphite, ivory, champagne, warm brown, and wine palette; do not add saturated purple.
- Cards begin overlapped at the center and expand outward without elastic or bounce easing.
- Disable hover movement for coarse pointers and staged expansion for reduced-motion users.
- Preserve category routing, navigation, the percentage loader, scroll restoration, and existing later sections.
- The workspace is not a Git repository, so implementation steps do not include commits.

---

### Task 1: Build the intro Hero component

**Files:**
- Create: `src/components/hero/IntroHero.jsx`
- Test: source inspection

**Interfaces:**
- Consumes: `ArrowDown` from `lucide-react` and `src/components/hero/IntroHero.css`.
- Produces: default React component `IntroHero` with `#home`, `[data-intro-hero]`, opening hooks, and five `[data-intro-card]` nodes.

- [ ] **Step 1: Create the five-card data**

At module scope, define:

```jsx
const introCards = [
  { number: '01', title: 'Brand System', label: '品牌视觉', tone: 'brand' },
  { number: '02', title: 'Campaign', label: '活动视觉', tone: 'campaign' },
  { number: '03', title: 'Visual Direction', label: '视觉创意', tone: 'visual' },
  { number: '04', title: '3D & AIGC', label: '三维实验', tone: 'aigc' },
  { number: '05', title: 'Packaging', label: '包装延展', tone: 'packaging' },
]
```

- [ ] **Step 2: Implement the section structure**

Create the component with this hierarchy and exact animation hooks:

```jsx
import { ArrowDown } from 'lucide-react'
import './IntroHero.css'

export default function IntroHero() {
  return <section className="intro-hero" id="home" data-intro-hero>
    <div className="intro-hero__aurora" aria-hidden="true"><i /><i /><i /></div>
    <div className="intro-hero__content">
      <p className="intro-hero__pill" data-intro-pill><i /> VISUAL DESIGNER · CREATIVE MAKER</p>
      <h1 className="intro-hero__title" aria-label="Designing Visual Experiences">
        <span data-intro-title>Designing</span>
        <span data-intro-title>Visual <em>Experiences</em></span>
      </h1>
      <p className="intro-hero__copy" data-intro-copy>用策略、审美与新技术，创造清晰而有记忆点的视觉体验。</p>
      <div className="intro-fan" data-intro-fan>
        {introCards.map((card, index) => <div className={`intro-fan__slot intro-fan__slot--${index + 1}`} key={card.number}>
          <article className={`intro-card intro-card--${card.tone}`} data-intro-card>
            <span className="intro-card__number">{card.number}</span>
            <div className="intro-card__art" aria-hidden="true"><i /><i /><i /></div>
            <div className="intro-card__label"><small>{card.label}</small><strong>{card.title}</strong></div>
          </article>
        </div>)}
      </div>
    </div>
    <a className="intro-hero__scroll" href="#profile" data-intro-scroll>SCROLL TO PROFILE <ArrowDown size={16} /></a>
  </section>
}
```

- [ ] **Step 3: Verify the component contract**

Run:

```powershell
rg -n "id=\"home\"|data-intro-(hero|pill|title|copy|fan|card|scroll)|introCards|Visual Experiences" src/components/hero/IntroHero.jsx
```

Expected: one `#home`, five card records, and all required animation hooks are present.

---

### Task 2: Integrate the new page order and remove the accordion render

**Files:**
- Modify: `src/App.jsx:1-20`
- Modify: `src/App.jsx:55-176`
- Modify: `src/App.jsx:253`

**Interfaces:**
- Consumes: default `IntroHero` from `./components/hero/IntroHero`.
- Produces: page order `IntroHero → Hero → About → Capabilities → Projects` and profile-specific animation hooks.

- [ ] **Step 1: Replace the gallery import and data**

Remove:

```jsx
import AccordionGallery from './components/gallery/AccordionGallery'
```

Add:

```jsx
import IntroHero from './components/hero/IntroHero'
```

Delete the `galleryItems` constant. Keep `projects` and all other data unchanged.

- [ ] **Step 2: Retarget the character Hero**

Change the character section from:

```jsx
<section className="hero hero-closeup" id="home">
```

to:

```jsx
<section className="hero hero-closeup" id="profile" data-motion-section="profile">
```

Rename its animation attributes:

- `data-opening-title` → `data-profile-title`
- `data-opening-avatar` → `data-profile-avatar`
- every `data-opening-meta` inside the character Hero → `data-profile-meta`

Do not rename `data-opening-header` on the global header.

- [ ] **Step 3: Remove the obsolete Marquee component**

Delete the complete `Marquee()` function that renders `.accordion-showcase`. Do not delete `src/components/gallery/AccordionGallery.jsx` or its stylesheet.

- [ ] **Step 4: Update the main render order**

Replace:

```jsx
<main><Hero /><Marquee /><About /><Capabilities onOpenCategory={openCategory} /><Projects /></main>
```

with:

```jsx
<main><IntroHero /><Hero /><About /><Capabilities onOpenCategory={openCategory} /><Projects /></main>
```

- [ ] **Step 5: Check the integration statically**

Run:

```powershell
rg -n "AccordionGallery|galleryItems|function Marquee|<Marquee|IntroHero|id=\"profile\"|data-profile-" src/App.jsx
```

Expected: no accordion references remain in `App.jsx`; `IntroHero`, `#profile`, and the profile hooks are present.

---

### Task 3: Style the intro Hero and fan layout

**Files:**
- Create: `src/components/hero/IntroHero.css`

**Interfaces:**
- Consumes: the class names and five slot modifiers from `IntroHero.jsx`, plus existing CSS variables `--ivory`, `--champagne`, and `--graphite`.
- Produces: full-screen intro layout, five-card fan, abstract artwork, hover feedback, and responsive/reduced-motion behavior.

- [ ] **Step 1: Add the full-screen background and centered typography**

Implement these base rules, retaining the exact color family:

```css
.intro-hero{position:relative;min-height:100svh;overflow:hidden;isolation:isolate;display:grid;place-items:center;padding:104px 24px 34px;color:var(--ivory);background:radial-gradient(circle at 50% 18%,rgba(116,62,66,.38),transparent 34%),radial-gradient(circle at 20% 34%,rgba(48,43,78,.18),transparent 36%),linear-gradient(145deg,#080707,#130c0d 54%,#090707)}
.intro-hero__aurora{position:absolute;inset:0;pointer-events:none}
.intro-hero__aurora i{position:absolute;border-radius:50%;filter:blur(80px);opacity:.24}
.intro-hero__content{position:relative;z-index:2;width:min(1200px,100%);display:grid;justify-items:center;text-align:center}
.intro-hero__pill{display:flex;align-items:center;gap:8px;margin:0 0 24px;padding:9px 15px;border:1px solid rgba(208,173,125,.28);border-radius:999px;color:var(--champagne);background:rgba(20,12,12,.42);font-size:9px;letter-spacing:.18em}
.intro-hero__title{margin:0;font-size:clamp(54px,7.4vw,108px);line-height:.88;letter-spacing:-.075em;font-weight:780}
.intro-hero__title>span{display:block}
.intro-hero__title em{color:var(--champagne);font-style:normal;text-shadow:0 0 42px rgba(208,173,125,.14)}
.intro-hero__copy{margin:24px 0 0;color:rgba(240,236,229,.54);font-size:14px;letter-spacing:.04em}
```

- [ ] **Step 2: Build the five-card fan**

Use a fixed visual stage with slot transforms so the inner card can animate independently:

```css
.intro-fan{position:relative;width:min(880px,90vw);height:330px;margin-top:28px}
.intro-fan__slot{position:absolute;left:50%;bottom:10px;width:190px;aspect-ratio:.72;transform-origin:50% 112%}
.intro-fan__slot--1{transform:translateX(-370px) translateY(52px) rotate(-16deg)}
.intro-fan__slot--2{transform:translateX(-230px) translateY(18px) rotate(-8deg)}
.intro-fan__slot--3{z-index:3;transform:translateX(-95px) translateY(-8px)}
.intro-fan__slot--4{z-index:2;transform:translateX(40px) translateY(18px) rotate(8deg)}
.intro-fan__slot--5{transform:translateX(180px) translateY(52px) rotate(16deg)}
.intro-card{position:relative;width:100%;height:100%;overflow:hidden;border:1px solid rgba(227,197,158,.2);border-radius:22px;background:linear-gradient(160deg,rgba(48,32,29,.96),rgba(12,9,9,.98));box-shadow:0 28px 70px rgba(0,0,0,.45);transition:transform .55s cubic-bezier(.2,.8,.2,1),border-color .4s,box-shadow .4s;will-change:transform}
.intro-card:hover{transform:translateY(-18px) scale(1.025);border-color:rgba(227,197,158,.52);box-shadow:0 32px 84px rgba(0,0,0,.52),0 0 34px rgba(208,173,125,.12)}
```

Add internal number, label, and art rules. Give each tone modifier a distinct warm gradient using wine, brown, champagne, muted graphite-blue, and ivory accents; do not use saturated purple.

- [ ] **Step 3: Add responsive fan transforms**

At `max-width: 900px`, reduce card width to `150px`, fan height to `280px`, and horizontal slot offsets proportionally. At `max-width: 620px`, use `112px` cards, a `220px` fan height, shallower rotations `-11deg/-5deg/0/5deg/11deg`, and preserve the center card fully inside the viewport.

- [ ] **Step 4: Add interaction fallbacks**

Add:

```css
@media(pointer:coarse){.intro-card:hover{transform:none}}
@media(prefers-reduced-motion:reduce){.intro-card,.intro-hero__aurora i{transition:none!important;animation:none!important}.intro-card:hover{transform:none}}
```

- [ ] **Step 5: Verify CSS selectors and forbidden color**

Run:

```powershell
rg -n "intro-hero|intro-fan__slot--[1-5]|intro-card:hover|pointer:coarse|prefers-reduced-motion" src/components/hero/IntroHero.css
rg -ni "#([89a-f][0-9a-f])?([0-9a-f]{2})?ff|purple|magenta" src/components/hero/IntroHero.css
```

Expected: all structural/responsive selectors are present; the saturated-purple search returns no matches.

---

### Task 4: Retarget the GSAP opening and add the profile reveal

**Files:**
- Modify: `src/hooks/usePortfolioAnimations.js:68-116`

**Interfaces:**
- Consumes: intro hooks from `IntroHero.jsx` and profile hooks from `App.jsx`.
- Produces: intro opening animation, center-expanding cards, and scroll-triggered character Hero animation.

- [ ] **Step 1: Replace old Hero initial states with intro states**

Keep the percentage loader setup unchanged. Replace the current opening sets for `[data-opening-title]`, `[data-opening-avatar]`, and `[data-opening-meta]` with:

```js
.set('[data-intro-pill]', { y: 18, autoAlpha: 0 })
.set('[data-intro-title]', { yPercent: 115, scaleX: .84, autoAlpha: 0, transformOrigin: 'center center' })
.set('[data-intro-copy]', { y: 22, autoAlpha: 0 })
.set('[data-intro-scroll]', { y: 16, autoAlpha: 0 })
```

Preserve the `[data-opening-header]` initial state.

- [ ] **Step 2: Calculate center offsets for the fan cards**

Before creating the opening timeline, add:

```js
const introFan = root.querySelector('[data-intro-fan]')
const introCards = gsap.utils.toArray('[data-intro-card]', root)
const fanCenter = introFan ? introFan.getBoundingClientRect().left + introFan.getBoundingClientRect().width / 2 : 0
const cardOffsets = introCards.map((card) => {
  const rect = card.getBoundingClientRect()
  return fanCenter - (rect.left + rect.width / 2)
})
```

- [ ] **Step 3: Replace the old character-Hero handoff tweens**

Keep loader fade at `3.72`, header reveal at `4.08`, and overlay exit at `4.38`. Replace the old title/avatar/meta tweens with:

```js
.to('[data-intro-pill]', { y: 0, autoAlpha: 1, duration: .55 }, 4.02)
.to('[data-intro-title]', { yPercent: 0, scaleX: 1, autoAlpha: 1, duration: .86, stagger: .08 }, 4.08)
.to('[data-intro-copy]', { y: 0, autoAlpha: 1, duration: .58 }, 4.22)
.fromTo(introCards, { x: (index) => cardOffsets[index], y: 72, scale: .72, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: .76, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, 4.30)
.to('[data-intro-scroll]', { y: 0, autoAlpha: 1, duration: .5 }, 4.58)
```

The fan completes near `5.3s`; `finishOpening` then restores scrolling. Do not change the percentage transitions.

- [ ] **Step 4: Remove the obsolete gallery timeline**

Delete the complete block beginning with:

```js
const gallery = root.querySelector('[data-motion-section="gallery"]')
```

and ending after its accordion-panel stagger timeline.

- [ ] **Step 5: Add the second-screen profile reveal**

Before the About timeline, add:

```js
const profile = root.querySelector('[data-motion-section="profile"]')
if (profile) {
  gsap.timeline({ scrollTrigger: { trigger: profile, start: 'top 78%', once: true } })
    .from(profile.querySelectorAll('[data-profile-title]'), { yPercent: 115, scaleX: .82, transformOrigin: 'left center', duration: 1, stagger: .1, ease: 'power4.out' })
    .from(profile.querySelector('[data-profile-avatar]'), { y: 70, scale: 1.05, filter: 'blur(8px)', clipPath: 'inset(100% 0 0 0)', duration: 1.05, ease: 'power4.out' }, .18)
    .from(profile.querySelectorAll('[data-profile-meta]'), { y: 24, autoAlpha: 0, duration: .68, stagger: .08, ease: 'power3.out' }, .42)
}
```

- [ ] **Step 6: Check animation hooks**

Run:

```powershell
rg -n "data-intro-|data-profile-|data-motion-section=\"gallery\"|data-accordion-panel|data-opening-(title|avatar|meta)" src/hooks/usePortfolioAnimations.js src/App.jsx src/components/hero/IntroHero.jsx
```

Expected: intro/profile hooks exist; gallery and old character-opening hooks are absent.

---

### Task 5: Build and browser regression verification

**Files:**
- Verify: `src/components/hero/IntroHero.jsx`
- Verify: `src/components/hero/IntroHero.css`
- Verify: `src/App.jsx`
- Verify: `src/hooks/usePortfolioAnimations.js`

**Interfaces:**
- Consumes: the complete implementation from Tasks 1–4.
- Produces: a validated desktop/mobile homepage with no accordion render regression.

- [ ] **Step 1: Run lint and production build**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run lint
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run build
```

Expected: both succeed. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain; no new warning references the new Hero.

- [ ] **Step 2: Verify desktop page order and motion**

Reload `http://127.0.0.1:5173/` at approximately `1440 × 900` and observe through the opening.

Expected: percentage overlay → new intro → character Hero → About; five cards expand from the center; the accordion gallery does not appear; no saturated purple is present.

- [ ] **Step 3: Verify desktop hover and anchors**

Hover each fan card, activate the intro scroll cue, and use the header anchors.

Expected: only the hovered card rises; the cue lands on `#profile`; “首页” returns to `#home`; later anchors still reach their sections.

- [ ] **Step 4: Verify mobile and coarse-pointer layout**

Check approximately `390 × 844`.

Expected: headline and central card fit; all five cards remain represented in a shallow overlapping fan; hover-dependent movement is absent; no horizontal document overflow appears.

- [ ] **Step 5: Verify reduced motion and runtime health**

Emulate reduced motion, reload, inspect the console, and scroll through all sections.

Expected: loader staging and fan expansion are skipped; final layouts remain visible; scrolling works; console contains no new error; category detail pages still open and return to `#capabilities`.
