# Editorial Section Titles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the About, Works, and Projects main headings as a coherent editorial title system while preserving their existing GSAP entry hooks and page behavior.

**Architecture:** Keep the three headings in `App.jsx`, adding explicit line and accent wrappers rather than introducing a new component for three static variants. Add a shared `.editorial-title` foundation plus section modifiers in `App.css`, and extend the existing desktop verification script with deterministic markup and accessibility contracts.

**Tech Stack:** React 19 JSX, CSS, GSAP 3, Node.js contract verification, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-12-editorial-section-titles-design.md`

## Global Constraints

- Preserve the section order, copy meaning, section kickers, content, cards, navigation, and category behavior.
- Preserve every existing `data-section-title` value so the current GSAP timelines continue to target the headings.
- Use line-height between `0.78` and `0.84` and letter-spacing no tighter than `-0.04em` for the redesigned headings.
- Optimize this pass for the desktop presentation; do not introduce a separate mobile redesign.
- Use champagne as a focused accent rather than the dominant title color.
- Decorative duplicate text must be `aria-hidden="true"`.

## File Structure

- Modify `src/App.jsx`: owns semantic title text and the line/accent/decorative wrappers.
- Modify `src/App.css`: owns the shared editorial title system and each section's composition.
- Modify `scripts/verify-desktop-experience.mjs`: owns static contracts for the title hooks, classes, and accessible decorative layer.

---

### Task 1: Define the editorial-title verification contract

**Files:**
- Modify: `scripts/verify-desktop-experience.mjs`

**Interfaces:**
- Consumes: the raw `src/App.jsx` and `src/App.css` source strings.
- Produces: failing assertions until all three heading variants and their shared CSS contract exist.

- [ ] **Step 1: Read the stylesheet in the verifier**

Add beside the existing source reads:

```js
const appCss = read('src/App.css')
```

- [ ] **Step 2: Add the failing markup and style assertions**

Add before the final `console.log`:

```js
assert(app.includes('className="editorial-title editorial-title-about"'), 'About editorial title is missing')
assert(app.includes('className="editorial-title editorial-title-works"'), 'Works editorial title is missing')
assert(app.includes('className="editorial-title editorial-title-projects"'), 'Projects editorial title is missing')
assert(app.includes('className="editorial-title-ghost" aria-hidden="true"'), 'Projects decorative title must be hidden from assistive technology')
assert(appCss.includes('.editorial-title{'), 'Shared editorial title styles are missing')
assert(appCss.includes('.editorial-title-about'), 'About title composition styles are missing')
assert(appCss.includes('.editorial-title-works'), 'Works title composition styles are missing')
assert(appCss.includes('.editorial-title-projects'), 'Projects title composition styles are missing')
```

- [ ] **Step 3: Run the verifier and confirm the new contract fails**

Run: `pnpm run verify:desktop-experience`

Expected: FAIL with `About editorial title is missing`.

- [ ] **Step 4: Commit the failing contract**

```bash
git add scripts/verify-desktop-experience.mjs
git commit -m "test: define editorial title system"
```

### Task 2: Implement the semantic title structures

**Files:**
- Modify: `src/App.jsx:251-280`

**Interfaces:**
- Consumes: existing About, Capabilities, and Projects sections and their `data-section-title` hooks.
- Produces: `.editorial-title-about`, `.editorial-title-works`, and `.editorial-title-projects` markup for Task 3 styling.

- [ ] **Step 1: Replace the About heading with explicit lines**

Use:

```jsx
<h2 className="editorial-title editorial-title-about" data-section-title="about">
  <span className="editorial-title-line">ABOUT</span>
  <span className="editorial-title-line editorial-title-accent">ME.</span>
</h2>
```

- [ ] **Step 2: Replace the Works heading with explicit lines and a rule**

Use:

```jsx
<h2 className="editorial-title editorial-title-works" data-section-title="capabilities">
  <span className="editorial-title-line">SELECTED</span>
  <span className="editorial-title-line editorial-title-works-line">WORKS.</span>
</h2>
```

- [ ] **Step 3: Replace the Projects heading with one live and one decorative layer**

Use:

```jsx
<h2 className="editorial-title editorial-title-projects" data-section-title="projects">
  <span className="editorial-title-ghost" aria-hidden="true">PROJECTS.</span>
  <span className="editorial-title-live">PROJECTS<span>.</span></span>
</h2>
```

- [ ] **Step 4: Run lint and confirm semantic JSX passes**

Run: `pnpm run lint`

Expected: PASS with no diagnostics.

### Task 3: Build the shared editorial layout and section variants

**Files:**
- Modify: `src/App.css:7-9`

**Interfaces:**
- Consumes: the title class names introduced in Task 2.
- Produces: a shared readable display rhythm, About/Works staggered lines, and the Projects outlined depth layer.

- [ ] **Step 1: Add the shared title foundation**

Add after `.section-kicker` styles:

```css
.editorial-title{position:relative;margin:0;font-weight:800;line-height:.8;letter-spacing:-.04em}
.editorial-title-line{display:block;width:max-content}
```

- [ ] **Step 2: Replace the old About heading rules**

Replace `.about h2` and `.about h2 em` with:

```css
.about .editorial-title-about{margin:72px 0 58px;font-size:clamp(96px,15.5vw,210px)}
.editorial-title-about .editorial-title-accent{margin-left:18%;color:var(--champagne)}
```

- [ ] **Step 3: Replace the old Works heading rules**

Replace `.capability-intro h2` with:

```css
.capability-intro .editorial-title-works{font-size:clamp(78px,11.8vw,158px)}
.editorial-title-works-line{position:relative;margin-left:11%}
.editorial-title-works-line:after{content:"";position:absolute;left:calc(100% + 28px);top:52%;width:clamp(72px,9vw,126px);height:2px;background:var(--champagne)}
```

- [ ] **Step 4: Replace the old Projects heading rules and rebalance its intro**

Replace the `.projects-heading h2` declarations with:

```css
.projects-heading .editorial-title-projects{isolation:isolate;width:max-content;max-width:100%;margin:78px 0 0;font-size:clamp(76px,12.8vw,166px);line-height:.82}
.editorial-title-live{position:relative;z-index:1;display:block}
.editorial-title-live>span{color:var(--champagne)}
.editorial-title-ghost{position:absolute;z-index:0;left:10px;top:9px;color:transparent;-webkit-text-stroke:1px rgba(208,173,125,.3);pointer-events:none}
.projects-heading>p{width:340px;margin:28px 0 82px auto;color:#ffffff73;font-size:12px;line-height:1.7}
```

- [ ] **Step 5: Update the existing narrow-screen selectors without redesigning mobile**

Change only the obsolete selectors so current fallback sizing still applies:

```css
@media(max-width:620px){
  .about .editorial-title-about{margin-bottom:70px;font-size:28vw}
  .capability-intro .editorial-title-works{font-size:19vw}
}
```

- [ ] **Step 6: Run the static verification, lint, and production build**

Run:

```bash
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
```

Expected: verifier prints `Desktop hero and mobile access gate verified`, lint exits cleanly, and Vite completes a production build.

- [ ] **Step 7: Commit the implemented title system**

```bash
git add src/App.jsx src/App.css
git commit -m "feat: refine editorial section titles"
```

### Task 4: Verify the three desktop compositions in the browser

**Files:**
- Modify if visual correction is required: `src/App.css`

**Interfaces:**
- Consumes: the completed editorial title system and the running local Vite preview.
- Produces: a visually accepted 1646 × 912 desktop composition with preserved entry motion and no overlaps.

- [ ] **Step 1: Inspect About**

At `http://localhost:5174/#about` with a 1646 × 912 viewport, confirm `ABOUT` and champagne `ME.` read as two intentional lines; the title does not collide with the kicker, portrait, or introductory copy.

- [ ] **Step 2: Inspect Works**

At `http://localhost:5174/#capabilities`, confirm `SELECTED / WORKS.` remains readable on paper, the champagne rule has clear breathing room, and the description and first category row do not overlap.

- [ ] **Step 3: Inspect Projects**

At `http://localhost:5174/#projects`, confirm the outlined duplicate remains subtle, the live title and champagne period are crisp, and the description and first sticky card remain separated.

- [ ] **Step 4: Verify motion and accessibility behavior**

Reload and scroll through all three sections. Confirm each heading still enters once via its existing GSAP timeline. Inspect the Projects heading and confirm the ghost layer has `aria-hidden="true"` while the live `PROJECTS.` remains real text.

- [ ] **Step 5: Apply only bounded CSS corrections and rerun checks**

If a collision is visible, adjust only section-specific margin, font-size clamp, or line offset values in `src/App.css`; do not change copy, section order, animation hooks, or card behavior. Then rerun:

```bash
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
```

- [ ] **Step 6: Commit visual corrections if any were necessary**

```bash
git add src/App.css
git commit -m "fix: balance editorial title spacing"
```

