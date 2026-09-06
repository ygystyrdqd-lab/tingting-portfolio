# Homepage Accordion Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's two-row infinite marquee with a responsive five-panel accordion gallery using the existing category content and GSAP dependency.

**Architecture:** Create a self-contained `AccordionGallery` component with its own active state, GSAP panel expansion, pointer parallax, keyboard behavior, and reduced-motion handling. Keep the gallery data in `App.jsx`, replace the current `Marquee` markup with a small section wrapper, and update the existing page-level animation hook so it reveals the new gallery instead of pausing and starting marquee tracks.

**Tech Stack:** React 19, JavaScript, CSS, GSAP 3, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-03-home-accordion-gallery-design.md`

## Global Constraints

- Keep exactly five categories in this order: Brand System, Visual Direction, 3D & AIGC, Campaign, Packaging.
- Use `3D & AIGC` as the initial active panel.
- Use CSS-generated abstract placeholders until optional portfolio image URLs are supplied.
- Use the existing GSAP dependency; add no package.
- Use a `0.75s` `power3.inOut` expansion with no elastic or bounce easing.
- Keep the current Hero, opening animation, later page sections, and `1200px` content system unchanged.
- At `768px` and above use one horizontal accordion row; below `768px` use a horizontally scrollable snap row.
- Respect keyboard interaction, coarse pointers, image failure, and `prefers-reduced-motion`.

---

### Task 1: Build the reusable accordion gallery component

**Files:**
- Create: `src/components/gallery/AccordionGallery.jsx`
- Create: `src/components/gallery/AccordionGallery.css`

**Interfaces:**
- Consumes: `items: Array<{ title: string, subtitle: string, description: string, className: string, image?: string }>` and optional `initialIndex: number`.
- Produces: `AccordionGallery({ items, initialIndex = 2 })`, semantic panel buttons with `data-accordion-panel`, and artwork nodes with `data-accordion-art`.

- [x] **Step 1: Create the component state and refs**

Create `AccordionGallery.jsx` with imports and state:

```jsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import './AccordionGallery.css'

export default function AccordionGallery({ items, initialIndex = 2 }) {
  const rootRef = useRef(null)
  const frameRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [failedImages, setFailedImages] = useState(() => new Set())
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
```

Clamp the initial index before using it:

```js
const safeIndex = Math.min(Math.max(activeIndex, 0), items.length - 1)
```

- [x] **Step 2: Animate panel proportions and content**

Add a `useLayoutEffect` that scopes GSAP to `rootRef`, selects `[data-accordion-panel]`, and applies these values whenever `safeIndex` changes:

```js
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

panels.forEach((panel, index) => {
  const active = index === safeIndex
  panel.setAttribute('aria-pressed', String(active))
  if (isDesktop) {
    gsap.to(panel, {
      flexGrow: active ? 4.6 : 1,
      duration: reduced ? 0 : 0.75,
      ease: 'power3.inOut',
      overwrite: true,
    })
  }
  gsap.to(panel.querySelector('[data-accordion-copy]'), {
    autoAlpha: active ? 1 : 0,
    y: active ? 0 : 24,
    duration: reduced ? 0 : 0.48,
    delay: active && !reduced ? 0.18 : 0,
    ease: 'power3.out',
    overwrite: true,
  })
})
```

Track the breakpoint with a media-query listener:

```js
useEffect(() => {
  const query = window.matchMedia('(min-width: 768px)')
  const update = () => setIsDesktop(query.matches)
  query.addEventListener?.('change', update)
  return () => query.removeEventListener?.('change', update)
}, [])
```

Use `isDesktop` instead of a second desktop query inside the layout effect and include it in the dependency array. Scope animations with `const context = gsap.context(() => { ... }, rootRef)` and return `() => context.revert()`.

- [x] **Step 3: Add pointer parallax and keyboard navigation**

Use `requestAnimationFrame` to update CSS variables only on fine pointers when motion is allowed:

```js
const handlePointerMove = (event) => {
  if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return
  const panel = event.currentTarget
  const rect = panel.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * -20
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -20
  cancelAnimationFrame(frameRef.current)
  frameRef.current = requestAnimationFrame(() => {
    panel.style.setProperty('--gallery-art-x', `${x}px`)
    panel.style.setProperty('--gallery-art-y', `${y}px`)
  })
}
```

Reset both variables to `0px` on pointer leave. Handle ArrowLeft, ArrowRight, Home, and End by calculating the next index, calling `setActiveIndex(nextIndex)`, and focusing `rootRef.current.querySelectorAll('[data-accordion-panel]')[nextIndex]`.

- [x] **Step 4: Render semantic panels and image fallback**

Render one `button` per item with these essential attributes and handlers:

```jsx
<button
  type="button"
  className={`accordion-gallery__panel ${item.className}${index === safeIndex ? ' is-active' : ''}`}
  data-accordion-panel
  aria-label={`${item.title}，${item.subtitle}`}
  aria-pressed={index === safeIndex}
  onPointerEnter={() => setActiveIndex(index)}
  onPointerMove={handlePointerMove}
  onPointerLeave={resetPointer}
  onFocus={() => setActiveIndex(index)}
  onClick={() => setActiveIndex(index)}
  onKeyDown={(event) => handleKeyDown(event, index)}
>
```

Inside each panel render:

```jsx
<span className="accordion-gallery__index">{String(index + 1).padStart(2, '0')}</span>
<span className="accordion-gallery__rail-title">{item.title}</span>
<span className="accordion-gallery__art" data-accordion-art aria-hidden="true">
  <i />
  {item.image && !failedImages.has(index) && <img
    className="accordion-gallery__image"
    src={item.image}
    alt=""
    onError={() => setFailedImages(previous => {
      const next = new Set(previous)
      next.add(index)
      return next
    })}
  />}
</span>
<span className="accordion-gallery__copy" data-accordion-copy>
  <small>{item.subtitle}</small>
  <strong>{item.title}</strong>
  <span>{item.description}</span>
</span>
```

Close the root wrapper after mapping all panels and cancel `frameRef.current` in an unmount cleanup effect.

- [x] **Step 5: Add desktop, mobile, focus, and reduced-motion styles**

Create `AccordionGallery.css` with these structural rules:

```css
.accordion-gallery{display:flex;gap:10px;height:clamp(420px,48vw,590px);overflow:hidden}
.accordion-gallery__panel{--gallery-art-x:0px;--gallery-art-y:0px;position:relative;min-width:0;flex:1 1 0;border:1px solid rgba(240,236,229,.14);border-radius:20px;overflow:hidden;background:#120e0c;color:var(--ivory);text-align:left;cursor:pointer;isolation:isolate}
.accordion-gallery__panel.is-active{border-color:rgba(208,173,125,.5)}
.accordion-gallery__art{position:absolute;inset:-3%;transform:translate3d(var(--gallery-art-x),var(--gallery-art-y),0) scale(1.05);will-change:transform}
.accordion-gallery__image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.accordion-gallery__copy{position:absolute;z-index:4;left:clamp(24px,3vw,46px);right:clamp(24px,3vw,46px);bottom:clamp(26px,4vw,54px)}
.accordion-gallery__panel:focus-visible{outline:1px solid var(--champagne-hi);outline-offset:-5px}
```

Use `::before`, `::after`, and one inner artwork shape to create distinct gradient/ring compositions for `.card-a` through `.card-e`. Add an ivory-to-transparent bottom scrim beneath the copy.

For mobile:

```css
@media(max-width:767px){
  .accordion-gallery{height:430px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:0 14px}
  .accordion-gallery__panel{flex:0 0 78vw;scroll-snap-align:center}
  .accordion-gallery__copy{opacity:1!important;transform:none!important}
}
@media(prefers-reduced-motion:reduce){
  .accordion-gallery__art{transform:none!important;transition:none!important}
}
```

Expected: desktop panels expand without bounce; mobile panels scroll horizontally; focus is visible; abstract placeholders remain present without images.

---

### Task 2: Replace the homepage marquee and update its entrance animation

**Files:**
- Modify: `src/App.jsx:1-18,165-170`
- Modify: `src/hooks/usePortfolioAnimations.js:83-96`
- Modify: `src/App.css:6,120-132`

**Interfaces:**
- Consumes: `AccordionGallery` from Task 1 and the existing homepage `cards` data position.
- Produces: one `<section className="showreel accordion-showcase" data-motion-section="gallery">` containing the five-panel gallery and page-level reveal selectors `data-gallery-frame` and `data-accordion-panel`.

- [x] **Step 1: Replace the card data with complete gallery items**

Remove the `BorderGlow` import and import the new component:

```jsx
import AccordionGallery from './components/gallery/AccordionGallery'
```

Replace `cards` with:

```js
const galleryItems = [
  { title: 'Brand System', subtitle: '品牌视觉系统', description: '从定位到识别，建立清晰一致的品牌语言。', className: 'card-a' },
  { title: 'Visual Direction', subtitle: '视觉创意方向', description: '以构图、色彩与材质建立独特视觉情绪。', className: 'card-b' },
  { title: '3D & AIGC', subtitle: '三维概念实验', description: '融合三维表达与生成式工具，探索新的视觉边界。', className: 'card-c' },
  { title: 'Campaign', subtitle: '营销活动视觉', description: '围绕传播目标构建具有记忆点的整合视觉。', className: 'card-d' },
  { title: 'Packaging', subtitle: '包装与物料延展', description: '连接结构、材质与品牌识别的触点体验。', className: 'card-e' },
]
```

- [x] **Step 2: Replace the `Marquee` implementation**

Keep the function name to avoid unrelated call-site changes, but replace its body with:

```jsx
function Marquee() {
  return <section className="showreel accordion-showcase" aria-label="视觉方向展示" data-motion-section="gallery">
    <div className="accordion-showcase__shell" data-gallery-frame>
      <div className="accordion-showcase__meta"><span>SELECTED DIRECTIONS</span><span>01 — 05</span></div>
      <AccordionGallery items={galleryItems} initialIndex={2} />
    </div>
  </section>
}
```

- [x] **Step 3: Replace the marquee reveal block in `usePortfolioAnimations`**

Remove the query and timeline for `data-motion-section="marquee"`. Add:

```js
const gallery = root.querySelector('[data-motion-section="gallery"]')
if (gallery) {
  gsap.timeline({ scrollTrigger: { trigger: gallery, start: 'top 86%', once: true } })
    .from(gallery.querySelector('[data-gallery-frame]'), { y: 70, clipPath: 'inset(12% 0 0 0)', duration: 1.05, ease: 'power3.out' })
    .from(gallery.querySelectorAll('[data-accordion-panel]'), { y: 34, autoAlpha: 0, duration: .8, stagger: .075, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, .18)
}
```

Expected: the new gallery reveals once on scroll and no marquee animation state is referenced.

- [x] **Step 4: Remove obsolete marquee and Border Glow styles from `App.css`**

Replace the existing `.showreel` block with:

```css
.showreel{position:relative;z-index:4;padding:72px 0 132px;overflow:hidden;background:rgba(11,9,8,.78)}
.accordion-showcase__shell{width:min(calc(100% - 48px),var(--shell));margin:auto}
.accordion-showcase__meta{display:flex;justify-content:space-between;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid rgba(240,236,229,.12);color:rgba(240,236,229,.5);font-size:9px;letter-spacing:.16em}
@media(max-width:620px){.showreel{padding:52px 0 92px}.accordion-showcase__shell{width:100%}.accordion-showcase__meta{margin:0 20px 16px}}
```

Delete `.marquee-row`, `.marquee-track`, `.marquee-card`, `@keyframes marquee`, and the `.border-glow` rules that only target `.marquee-card`. Keep `src/components/effects/BorderGlow.jsx` on disk because deletion is not required for this feature.

- [x] **Step 5: Run source-level verification**

Run:

```powershell
rg -n "AccordionGallery|galleryItems|data-motion-section=\"gallery\"|data-gallery-frame" src/App.jsx src/hooks/usePortfolioAnimations.js
rg -n "data-motion-section=\"marquee\"|data-marquee|marquee-track|marquee-card" src
```

Expected: the first command finds the new integration; the second command returns no matches.

---

### Task 3: Validate behavior, performance, and regression safety

**Files:**
- Verify: `src/components/gallery/AccordionGallery.jsx`
- Verify: `src/components/gallery/AccordionGallery.css`
- Verify: `src/App.jsx`
- Verify: `src/hooks/usePortfolioAnimations.js`

**Interfaces:**
- Consumes: the completed gallery implementation from Tasks 1 and 2.
- Produces: a lint-clean, production-buildable, visually verified homepage replacement.

- [x] **Step 1: Run lint and production build**

Use the bundled Node runtime to run Oxlint and Vite build.

Expected: no new lint errors and a successful production build. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.

- [x] **Step 2: Verify desktop interaction in the live browser**

Reload `http://127.0.0.1:5173/#home`, scroll to the gallery, and inspect after the entrance reveal.

Expected:

- One row of five panels replaces both marquee rows.
- `3D & AIGC` is expanded initially.
- Hovering Brand System and Packaging expands the correct panel in approximately `0.75s` without bounce.
- Pointer movement creates only subtle artwork movement and does not shift the panel text.
- Pointer leave preserves the last active panel.

- [x] **Step 3: Verify keyboard and touch-width behavior**

Use Tab to focus a panel, then Arrow Left, Arrow Right, Home, and End. Resize or emulate a viewport below `768px` and activate panels by tap.

Expected: focus is visible, keyboard focus follows the active panel, the mobile row scrolls horizontally without blocking vertical scroll, and no hover-only behavior is required.

- [x] **Step 4: Verify reduced-motion and surrounding sections**

Emulate `prefers-reduced-motion: reduce`, reload, and inspect the gallery. Then return to the normal preference and check the Hero opening, About, capabilities, projects, and contact sections.

Expected: gallery state changes are immediate and artwork parallax is disabled under reduced motion; all surrounding sections continue to render and animate normally.

- [x] **Step 5: Record completion**

Mark every plan checkbox complete only after source verification, lint, production build, and browser checks pass. No Git commit is required because this workspace is not a Git repository.
