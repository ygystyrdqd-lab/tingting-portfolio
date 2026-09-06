# Featured Project Category Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the fourth-screen ecommerce category, turn the fifth-screen cards into three named links, and add three independent secondary pages with one placeholder project each.

**Architecture:** Keep fourth-screen categories and fifth-screen featured categories in separate exported arrays so the new pages do not appear in the fourth-screen list. Extend the shared category lookup across both arrays and reuse the existing `WorkCategoryPage` and `MediaViewer`; make `SpotlightCard` element-polymorphic so the fifth-screen cards can become semantic links without losing their effects.

**Tech Stack:** React, Vite, JavaScript data modules, GSAP-compatible DOM attributes, CSS
**Spec:** `docs/superpowers/specs/2026-09-05-featured-project-category-pages-design.md`

## Global Constraints

- Rename the existing `ecommerce` category display title to `产品视觉设计` without changing its slug, three projects, covers, or detail media.
- The fifth-screen cards must be `IP视觉设计`, `电商与活动视觉`, and `AIGC工作流` in that order.
- Each fifth-screen card opens a separate secondary page containing exactly one empty-media placeholder card.
- Preserve fifth-screen Spotlight, reveal, parallax, sticky-stack, and scroll-entry behavior.
- Reuse the existing secondary-page and media-viewer components.
- New pages must open at scroll position zero and return to `#projects`.
- Do not upload or invent real media for the new placeholders.

---

### Task 1: Add and verify separate featured-category data

**Files:**
- Create: `scripts/verify_featured_categories.mjs`
- Modify: `src/data/workCategories.js`

**Interfaces:**
- Consumes: existing `workCategories` and `getWorkCategory(slug)` exports
- Produces: `featuredWorkCategories` array and a shared `getWorkCategory(slug)` lookup covering both arrays

- [x] **Step 1: Add a focused data verification script**

Create `scripts/verify_featured_categories.mjs`:

```js
import assert from 'node:assert/strict'
import { featuredWorkCategories, getWorkCategory, workCategories } from '../src/data/workCategories.js'

const ecommerce = workCategories.find(({ slug }) => slug === 'ecommerce')
assert.equal(ecommerce.title, '产品视觉设计')
assert.equal(ecommerce.projects.length, 3)

assert.deepEqual(
  featuredWorkCategories.map(({ slug, title }) => [slug, title]),
  [
    ['ip-visual', 'IP视觉设计'],
    ['campaign-visual', '电商与活动视觉'],
    ['aigc-workflow', 'AIGC工作流'],
  ],
)

for (const category of featuredWorkCategories) {
  assert.equal(category.projects.length, 1)
  assert.deepEqual(category.projects[0].media, [])
  assert.equal(getWorkCategory(category.slug), category)
}

console.log('featured category data verified')
```

- [x] **Step 2: Run the verification script and confirm it fails before implementation**

Run: `node scripts/verify_featured_categories.mjs`

Expected: FAIL because `featuredWorkCategories` is not yet exported and the ecommerce title is still `电商与活动视觉`.

- [x] **Step 3: Rename the existing fourth-screen category**

In the `ecommerce` entry of `src/data/workCategories.js`, set:

```js
title: '产品视觉设计',
en: 'Product Visual',
```

Keep its slug, description, theme, and all three existing project objects unchanged.

- [x] **Step 4: Add three isolated fifth-screen categories**

Append this export after `workCategories`:

```js
export const featuredWorkCategories = [
  {
    number: '01',
    slug: 'ip-visual',
    title: 'IP视觉设计',
    en: 'IP Visual Design',
    description: '围绕角色设定与品牌性格，建立可持续延展的IP视觉系统。',
    theme: { accent: '#d0ad7d', glow: 'rgba(208,173,125,.22)' },
    projects: [
      { id: 'ip-visual-01', title: 'IP视觉项目 01', meta: 'IP · CHARACTER SYSTEM', media: [] },
    ],
  },
  {
    number: '02',
    slug: 'campaign-visual',
    title: '电商与活动视觉',
    en: 'Campaign Visual',
    description: '面向电商转化与活动传播，组织清晰、有节奏的商业视觉。',
    theme: { accent: '#a9676b', glow: 'rgba(121,60,64,.22)' },
    projects: [
      { id: 'campaign-visual-01', title: '电商与活动项目 01', meta: 'CAMPAIGN · E-COMMERCE', media: [] },
    ],
  },
  {
    number: '03',
    slug: 'aigc-workflow',
    title: 'AIGC工作流',
    en: 'AIGC Workflow',
    description: '将生成式工具融入创意、制作与迭代流程，拓展视觉表达效率。',
    theme: { accent: '#a98ca8', glow: 'rgba(126,82,126,.24)' },
    projects: [
      { id: 'aigc-workflow-01', title: 'AIGC工作流项目 01', meta: 'AIGC · CREATIVE WORKFLOW', media: [] },
    ],
  },
]
```

- [x] **Step 5: Expand the shared lookup without changing the fourth-screen list**

Replace the lookup with:

```js
const allWorkCategories = [...workCategories, ...featuredWorkCategories]

export const getWorkCategory = (slug) => allWorkCategories.find((category) => category.slug === slug)
```

- [x] **Step 6: Run the data verification script and confirm it passes**

Run: `node scripts/verify_featured_categories.mjs`

Expected: `featured category data verified`.

### Task 2: Turn the fifth-screen cards into accessible category links

**Files:**
- Modify: `src/components/effects/SpotlightCard.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `featuredWorkCategories`, `openCategory(slug)`, and existing Spotlight card props
- Produces: semantic anchor cards at `?category=<slug>` that retain existing pointer and scroll effects

- [x] **Step 1: Make `SpotlightCard` element-polymorphic**

Update its signature and rendered element:

```jsx
export default function SpotlightCard({ as: Component = 'article', className = '', style, children, onPointerMove, ...props }) {
  // keep the existing refs, cleanup, and handlePointerMove body unchanged
  return <Component ref={cardRef} className={className} style={style} onPointerMove={handlePointerMove} {...props}>
    <span className="spotlight-card-glow" aria-hidden="true" />
    {children}
  </Component>
}
```

- [x] **Step 2: Replace the local fifth-screen card labels with route data**

Import `featuredWorkCategories` and derive the visual classes:

```js
import { featuredWorkCategories, getWorkCategory, workCategories } from './data/workCategories'

const projectClasses = ['project-one', 'project-two', 'project-three']
```

Remove the old local `projects` array.

- [x] **Step 3: Render each fifth-screen card as a complete link**

Change `Projects` to receive `onOpenCategory`, map `featuredWorkCategories`, and render:

```jsx
function Projects({ onOpenCategory }) {
  const handleOpen = (event, slug) => {
    event.preventDefault()
    onOpenCategory(slug)
  }

  return <section className="projects" id="projects" data-motion-section="projects">
    {/* keep the existing heading markup unchanged */}
    <div className="project-stack section-shell">
      {featuredWorkCategories.map((project, index) => <SpotlightCard
        as="a"
        className={`project-card ${projectClasses[index]}`}
        data-project-card
        href={`?category=${project.slug}`}
        onClick={(event) => handleOpen(event, project.slug)}
        aria-label={`查看${project.title}项目`}
        key={project.slug}
        style={{ '--index': index }}
      >
        <div className="project-meta"><span>{project.number}</span><span>{project.projects[0].meta}</span></div>
        {/* keep the existing project-art structure unchanged */}
        <div className="project-footer"><h3>{project.title}</h3><span aria-hidden="true"><ArrowUpRight /></span></div>
      </SpotlightCard>)}
    </div>
  </section>
}
```

Keep the current heading, concept art, animation data attributes, and `PROJECT PREVIEW` label unchanged. Replace the nested arrow `button` with a decorative `span` so the anchor has valid interactive markup.

- [x] **Step 4: Pass the route handler into the fifth screen and route returns to the correct section**

Change the home render call to:

```jsx
<Projects onOpenCategory={openCategory} />
```

Update the post-category scroll effect to use the hash target rather than always using `capabilities`:

```js
useEffect(() => {
  if (categorySlug !== null || !suppressHomeOpening) return undefined
  const frame = window.requestAnimationFrame(() => {
    const targetId = window.location.hash.slice(1) || 'capabilities'
    document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
  })
  return () => window.cancelAnimationFrame(frame)
}, [categorySlug, suppressHomeOpening])
```

Update `closeCategory` so the new fifth-screen category slugs return to `#projects`, while existing fourth-screen categories continue returning to `#capabilities`:

```js
const closeCategory = () => {
  const url = new URL(window.location.href)
  const isFeaturedCategory = featuredWorkCategories.some(({ slug }) => slug === categorySlug)
  setSuppressHomeOpening(true)
  url.searchParams.delete('category')
  url.hash = isFeaturedCategory ? 'projects' : 'capabilities'
  window.history.pushState({}, '', url)
  setCategorySlug(null)
}
```

- [x] **Step 5: Preserve arrow styling and add a visible keyboard focus state**

Change `.project-footer button` and its related selector to `.project-footer>span`, matching the existing dimensions and colors. Add:

```css
.project-card{text-decoration:none}
.project-card:focus-visible{outline:2px solid var(--champagne);outline-offset:5px}
```

Do not change card height, sticky position, color themes, Spotlight glow, or animations.

- [x] **Step 6: Run static checks**

Run in parallel:

```powershell
pnpm run lint
pnpm run build
```

Expected: successful production build, no new lint errors, and only the previously known unrelated `src/components/ui/button.tsx` Fast Refresh warning if still present.

### Task 3: Verify fourth-screen rename and three new page flows

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/data/workCategories.js`
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/MediaViewer.jsx`

**Interfaces:**
- Consumes: four existing fourth-screen routes and three new fifth-screen routes
- Produces: verified desktop/mobile navigation, placeholder viewer behavior, and error-free runtime

- [x] **Step 1: Verify the fourth-screen category rename**

Open `http://127.0.0.1:5173/#capabilities`. Confirm the fourth-screen list contains exactly five categories, the second is `产品视觉设计`, and its link remains `?category=ecommerce`. Open it and confirm all three existing project cards and media paths remain available.

- [x] **Step 2: Verify fifth-screen labels and links**

Return to `#projects`. Confirm exactly three cards appear in this order: `IP视觉设计`, `电商与活动视觉`, `AIGC工作流`. Confirm each is an anchor with the corresponding query URL, preserves the `project-card` class and Spotlight glow, and has no nested button.

- [x] **Step 3: Verify all three new secondary pages**

Open each route:

```text
http://127.0.0.1:5173/?category=ip-visual
http://127.0.0.1:5173/?category=campaign-visual
http://127.0.0.1:5173/?category=aigc-workflow
```

For each route confirm scroll position is zero, the title and English label are correct, exactly one `layout-single` project card exists, and no media element is loaded before interaction.

- [x] **Step 4: Verify placeholder viewer and return behavior**

Open each placeholder card and confirm the empty state contains `作品媒体将在后续上传`, closes with the close button and Escape key, and creates no image or video node. Confirm `返回作品` returns to `#projects` rather than `#capabilities`.

- [x] **Step 5: Verify mobile layout**

Set the viewport to 390×844. Confirm all three fifth-screen link cards and every new single-card secondary page fit without horizontal overflow; confirm the empty viewer close button is fully visible. Reset the viewport.

- [x] **Step 6: Inspect runtime logs**

Confirm the browser console has no missing-category, React nesting, missing-asset, or runtime errors introduced by this change.

## Repository Note

This project directory is not a Git repository, so implementation checkpoints cannot be committed. The specification, checked plan, data assertion script, build output, and browser verification provide the execution record.
