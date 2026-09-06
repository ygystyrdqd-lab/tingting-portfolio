# Desktop Avatar Safe Anchor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guarantee that the homepage avatar's right edge remains visible on PC without scaling the avatar or moving its container.

**Architecture:** `HeroAvatar` measures the rendered image after load and on layout changes, then writes the required negative pixel correction to `--avatar-safe-x`. CSS composes that correction with the existing centering, pointer-parallax, coarse-pointer, and reduced-motion transforms.

**Tech Stack:** React 19, CSS custom properties, ResizeObserver, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-02-hero-avatar-and-title-refinement-design.md`

## Global Constraints

- Run safety measurement when viewport width is greater than `620px`; widths at or below `620px` retain the approved mobile crop.
- Preserve avatar image height `170%`, avatar container sizing and position, pointer variables, and mobile cropping.
- Keep at least `32px` between the rendered image right edge and the viewport edge; use a `40px` calculation target so the existing maximum `7px` pointer movement still leaves at least `33px`.
- Remove all listeners, observers, and scheduled animation frames during cleanup.

---

### Task 1: Add adaptive desktop safe-anchor measurement

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `avatarRef`, a new `avatarImageRef`, and CSS variable `--avatar-safe-x`.
- Produces: a non-positive pixel correction stored on the rendered image element.

- [x] **Step 1: Add the image ref and measurement effect**

Create `avatarImageRef`, assign it to the hero image, and add an effect that:

```js
const updateSafePosition = () => {
  window.cancelAnimationFrame(safeFrame)
  safeFrame = window.requestAnimationFrame(() => {
    if (!desktopQuery.matches) {
      image.style.setProperty('--avatar-safe-x', '0px')
      return
    }
    const inlineTransition = image.style.transition
    image.style.transition = 'none'
    image.style.setProperty('--avatar-safe-x', '0px')
    const overflow = Math.max(0, image.getBoundingClientRect().right - (window.innerWidth - 40))
    image.style.setProperty('--avatar-safe-x', `${-Math.ceil(overflow)}px`)
    image.getBoundingClientRect()
    image.style.transition = inlineTransition
  })
}
```

Call it for an already loaded image, on image `load`, on window `resize`, on the desktop media query `change`, from a `ResizeObserver` observing the avatar container, and once after the 3.1-second Opening settles. Cleanup every subscription, frame, and timer. Measuring with inline transitions temporarily disabled prevents closely spaced events from accumulating correction while an earlier transform is still interpolating.

- [x] **Step 2: Compose the safety variable into CSS transforms**

Remove the fixed desktop `--avatar-base-x:-54%` override, retain base `--avatar-base-x:-50%`, and use:

```css
calc(var(--avatar-base-x) + var(--avatar-x) + var(--avatar-safe-x, 0px))
```

for pointer movement. Add `var(--avatar-safe-x, 0px)` to coarse-pointer keyframes and reduced-motion transform as well.

- [x] **Step 3: Verify the implementation contract**

Run:

```powershell
rg -n "avatarImageRef|avatar-safe-x|ResizeObserver|innerWidth - 40|min-width: 621px" src/App.jsx src/App.css
```

Expected: measurement, cleanup, and all transform modes reference the safety variable; the fixed `-54%` override is absent.

- [x] **Step 4: Run checks and build**

Run `pnpm run lint` followed by `pnpm run build`, then request `http://127.0.0.1:5173/#home`.

Expected: no new errors, Vite writes `dist`, and the homepage returns HTTP 200. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.
