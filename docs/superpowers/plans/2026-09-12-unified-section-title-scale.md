# Unified Section Title Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce and unify the About, Works, and Projects display headings without changing any other portfolio content or behavior.

**Architecture:** Keep the current semantic `h2` and `data-section-title` hooks in `src/App.jsx`. Normalize all three through one CSS font-size rule, shared second-line offset, and a single champagne-period class. Remove the Works rule and Projects ghost markup. Update the existing static desktop verifier to reflect this contract.

**Tech Stack:** React 19, CSS, GSAP 3, Vite 8, Node.js static verification
**Spec:** `docs/superpowers/specs/2026-09-12-unified-section-title-scale-design.md`

## Global Constraints

- Keep the wording `ABOUT / ME.`, `SELECTED / WORKS.`, and `PROJECTS.` and the current `data-section-title` values.
- All three desktop headings use `clamp(82px,10.2vw,132px)`, `font-weight:800`, `line-height:.82`, and `letter-spacing:-.04em`.
- Use champagne only for the final period of each heading.
- Keep the two-line breaks in About and Works; Projects stays on one line.
- Use a shared 9% second-line offset for About and Works.
- Remove the Works decorative rule and Projects ghost duplicate.
- Preserve imagery, content, navigation, GSAP behavior, the desktop-only narrow-screen gate, and local-only delivery.

## File Structure

- `src/App.jsx`: heading text spans and the existing animation hooks.
- `src/App.css`: shared title type scale and accent/offset styling.
- `scripts/verify-desktop-experience.mjs`: static contract for the three headings.

---

### Task 1: Update the title contract and markup

**Files:**
- Modify: `scripts/verify-desktop-experience.mjs`
- Modify: `src/App.jsx:251-287`

**Interfaces:**
- Consumes: `.editorial-title-about`, `.editorial-title-works`, `.editorial-title-projects` and existing `data-section-title` hooks.
- Produces: three headings with a shared `.editorial-title-period` element and no `.editorial-title-ghost`.

- [ ] **Step 1: Change the static assertions**

Keep the three existing heading-class assertions. Replace the ghost assertion with:

```js
assert(!app.includes('editorial-title-ghost'), 'Projects ghost title must be removed')
assert((app.match(/className="editorial-title-period"/g) ?? []).length === 3, 'Each title needs one champagne period')
assert(appCss.includes('clamp(82px,10.2vw,132px)'), 'Section titles must share one display scale')
```

- [ ] **Step 2: Run the verifier and confirm it fails**

Run `pnpm run verify:desktop-experience`. Expected: FAIL with `Projects ghost title must be removed`.

- [ ] **Step 3: Update About and Works line markup**

Use these exact inner `h2` structures, preserving the current outer class names and `data-section-title` values:

```jsx
<span className="editorial-title-line">ABOUT</span>
<span className="editorial-title-line editorial-title-second">ME<span className="editorial-title-period">.</span></span>
```

```jsx
<span className="editorial-title-line">SELECTED</span>
<span className="editorial-title-line editorial-title-second">WORKS<span className="editorial-title-period">.</span></span>
```

- [ ] **Step 4: Remove the Projects ghost**

Use this single inner span:

```jsx
<span className="editorial-title-live">PROJECTS<span className="editorial-title-period">.</span></span>
```

- [ ] **Step 5: Run lint**

Run `pnpm run lint`. Expected: exit 0; the pre-existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.

### Task 2: Apply the common scale and remove incompatible decoration

**Files:**
- Modify: `src/App.css:219-235`

**Interfaces:**
- Consumes: `.editorial-title-second` and `.editorial-title-period` from Task 1.
- Produces: a common optical scale, shared offset, surface-aware foreground colors, and period-only champagne accents.

- [ ] **Step 1: Replace the current editorial title block**

Use the following final rules, retaining the existing small-screen fallback only where needed:

```css
.editorial-title{--editorial-font-size:clamp(82px,10.2vw,132px);position:relative;margin:0;font-size:var(--editorial-font-size);font-weight:800;line-height:.82;letter-spacing:-.04em}
.editorial-title-line{display:block;width:max-content;max-width:100%}
.editorial-title-second{margin-left:9%}
.editorial-title-period{color:var(--champagne)}
.about .editorial-title-about,.capability-intro .editorial-title-works,.projects-heading .editorial-title-projects{font-size:var(--editorial-font-size);line-height:.82;letter-spacing:-.04em}
.about .editorial-title-about{margin:72px 0 58px;color:var(--ivory)}
.capability-intro .editorial-title-works{margin:0;color:#17110d}
.projects-heading .editorial-title-projects{width:max-content;max-width:100%;margin:78px 0 0;color:var(--ivory)}
.projects-heading .editorial-title-live{display:block;color:inherit}
```

Remove `.editorial-title-works-line:after`, `.editorial-title-ghost`, and old section-specific font-size declarations from the editorial block. The grouped override is necessary because earlier compressed legacy selectors (`.about h2`, `.capability-intro h2`, `.projects-heading h2`) are more specific than `.editorial-title`. Delete any now-obsolete narrow-screen overrides for those section-specific sizes; the narrow-screen gate prevents these headings rendering below 768px.

- [ ] **Step 2: Run contract and build checks**

Run `pnpm run verify:desktop-experience`, `pnpm run lint`, and `pnpm run build`. Expected: all exit 0, apart from the existing nonfatal button Fast Refresh warning.

- [ ] **Step 3: Commit the implementation**

```bash
git add src/App.jsx src/App.css scripts/verify-desktop-experience.mjs
git commit -m "refactor: unify section display titles"
```

### Task 3: Check desktop composition and make one bounded correction pass

**Files:**
- Modify only if needed: `src/App.css`

**Interfaces:**
- Consumes: the local site and all three heading sections.
- Produces: verified 1280px and 1646px desktop presentation without heading collisions.

- [ ] **Step 1: Inspect About, Works, and Projects at desktop width**

At `http://localhost:5173/`, inspect `#about`, `#capabilities`, and `#projects` after the opening sequence. Compare computed `font-size`, `line-height`, and `letter-spacing`; they must match across all three. Check the title boxes against kickers, portrait, descriptions, first category row, and first project card.

- [ ] **Step 2: Check animation and accessibility**

Confirm the three `data-section-title` targets still animate into view, each `h2` has its exact text, and no decorative duplicate is exposed to assistive technology.

- [ ] **Step 3: If needed, correct only local spacing values**

If visual overlap is found, adjust only `.about .editorial-title-about`, `.capability-intro .editorial-title-works`, or `.projects-heading .editorial-title-projects` margin values. Rerun `pnpm run verify:desktop-experience` and `pnpm run build`.

- [ ] **Step 4: Commit a correction only if Step 3 changed CSS**

```bash
git add src/App.css
git commit -m "fix: balance unified title spacing"
```
