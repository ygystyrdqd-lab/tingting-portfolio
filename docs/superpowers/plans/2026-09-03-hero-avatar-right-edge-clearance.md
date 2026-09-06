# Hero Avatar Right-Edge Clearance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the hard-cut impression around the homepage avatar's right sleeve by reserving `80px` of right-side clearance on non-phone layouts and preventing pointer motion from consuming that space.

**Architecture:** Keep the existing `HeroAvatar` component, CSS transforms, and responsive image sizes. Change the neutral right-edge measurement in `src/App.jsx` from `40px` to `80px`, clamp only the avatar image's positive horizontal pointer offset, and verify the live computed inline safety offset after the opening animation settles.

**Tech Stack:** React 19, JavaScript, CSS, Vite 8, browser visual verification
**Spec:** `docs/superpowers/specs/2026-09-03-hero-avatar-right-edge-clearance-design.md`

## Global Constraints

- Preserve the current `145%` image height for widths of `621px` and above.
- Preserve all mobile behavior at widths of `620px` and below.
- Preserve title positions, Hero proportions, opening timing, vertical pointer motion, rotation, and decorative parallax.
- Do not mask, fade, regenerate, or replace the avatar image.
- Keep the avatar stage overflow-visible and retain its current expanded clip polygon.

---

### Task 1: Reserve the right-edge clearance and clamp rightward image motion

**Files:**
- Modify: `src/App.jsx:70-121`
- Verify: `src/App.css:37-90`

**Interfaces:**
- Consumes: `avatarImageRef`, `--avatar-safe-x`, `--avatar-x`, the `min-width: 621px` media query, and the existing pointer coordinates in `HeroAvatar`.
- Produces: a neutral image position whose right edge is at most `window.innerWidth - 80`, plus an image pointer offset that never exceeds `0px` horizontally.

- [x] **Step 1: Confirm the current safety target and pointer range**

Run:

```powershell
rg -n "window\.innerWidth - 40|x \* 7|avatar-safe-x|height:145%|clip-path:polygon" src/App.jsx src/App.css
```

Expected: the measurement uses `40`, horizontal image movement uses `x * 7`, the non-phone image height remains `145%`, and the expanded stage clip polygon is present.

- [x] **Step 2: Increase the neutral right-side clearance**

In `HeroAvatar`, replace the overflow calculation with:

```js
const overflow = Math.max(0, image.getBoundingClientRect().right - (window.innerWidth - 80))
```

Expected: after `updateSafePosition` settles, the image canvas ends `80px` before the right viewport boundary at widths of `621px` and above.

- [x] **Step 3: Prevent positive horizontal image parallax**

Replace the image horizontal variable assignment with:

```js
const avatarX = Math.min(x * 7, 0)
node.style.setProperty('--avatar-x', `${avatarX}px`)
```

Keep `--hero-x`, decorative offsets, vertical image motion, and rotations based on the original `x` and `y` values. This retains depth and responsiveness while preventing the portrait from moving toward the right crop boundary.

- [x] **Step 4: Verify the source changes and unchanged responsive rules**

Run:

```powershell
rg -n "window\.innerWidth - 80|Math\.min\(x \* 7, 0\)|height:145%|height:166%|clip-path:polygon" src/App.jsx src/App.css
```

Expected: the `80px` target and horizontal clamp are present; `145%`, `166%`, and the expanded clip polygon are unchanged.

- [x] **Step 5: Run static checks and production build**

Run the project lint and build scripts with the bundled Node runtime.

Expected: no new lint errors and a successful Vite production build. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.

- [x] **Step 6: Verify the live desktop/tablet composition**

Reload `http://127.0.0.1:5173/#home`, wait for the opening animation to finish, and inspect the Hero at the current browser width. Read the first avatar image's inline `style` attribute and visually test pointer movement near the right side.

Expected:

- `--avatar-safe-x` settles approximately `40px` farther left than the previous `-85px` value at the same viewport.
- The right sleeve and trailing transparent garment retain visible space before the viewport edge.
- Moving the pointer right does not move the portrait toward that edge.
- The portrait scale, waist-up crop, title placement, and mobile rules remain unchanged.

- [x] **Step 7: Record completion**

Mark all plan steps complete after lint, build, and browser verification succeed. No Git commit is required because this workspace is not a Git repository.
