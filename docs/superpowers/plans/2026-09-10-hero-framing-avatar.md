# Hero Framing Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the personal-introduction hero portrait with the supplied red-dress image and add a champagne-gold framing interaction tied to the model's hand gesture.

**Architecture:** Keep `HeroAvatar` as the single owner of image loading and pointer state. Add a decorative framing layer inside that component, drive it with a local hover state and existing CSS position variables, and express all visual motion in CSS. Add a focused source-and-asset verification script so the asset, markup, accessibility fallback, and reduced-motion contract remain testable.

**Tech Stack:** React 19, JavaScript, CSS custom properties/keyframes, Vite 8, Node.js verification scripts
**Spec:** `docs/superpowers/specs/2026-09-10-hero-framing-avatar-design.md`

## Global Constraints

- Use `C:\Users\Mayn\Desktop\3ff9b4dabb7721283769ffc4d94e78f9d0ca2c2ee19c713d87d6ffc7783fcd02.png` without altering the original source file.
- Do not add a dependency or introduce Canvas, WebGL, or GSAP for this interaction.
- Preserve the existing `LT` image-load fallback.
- Keep the interaction decorative with `aria-hidden="true"` and `pointer-events: none`.
- Provide an intentional `prefers-reduced-motion: reduce` state.
- Do not modify the second-screen portrait, intro fan cards, navigation, or copy.
- Do not publish to GitHub Pages; complete local implementation and verification only.
- Do not restore or extend the mobile layout.

## File Structure

- Create `public/hero-avatar-framing.png`: stable public copy of the supplied transparent portrait.
- Create `scripts/verify-hero-framing-avatar.mjs`: focused static contract test for the new asset and interaction.
- Modify `package.json`: expose the focused verification command.
- Modify `src/App.jsx`: reference the new portrait, expose activation state, and render the framing decoration.
- Modify `src/App.css`: compose the new portrait and implement the bounded framing, scan, fingertip light, pointer parallax, and reduced-motion states.

---

### Task 1: Add the portrait asset and failing verification contract

**Files:**
- Create: `public/hero-avatar-framing.png`
- Create: `scripts/verify-hero-framing-avatar.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: supplied 1086 × 1448 ARGB PNG.
- Produces: `/hero-avatar-framing.png` and the `npm run verify:hero-framing` command used by later tasks.

- [ ] **Step 1: Copy the user asset into the public asset directory**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\Mayn\Desktop\3ff9b4dabb7721283769ffc4d94e78f9d0ca2c2ee19c713d87d6ffc7783fcd02.png' -Destination 'public\hero-avatar-framing.png'
```

Expected: `public/hero-avatar-framing.png` exists and retains the original byte length.

- [ ] **Step 2: Write the source-and-asset contract**

Create `scripts/verify-hero-framing-avatar.mjs` with:

```js
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const app = await readFile(resolve(root, 'src/App.jsx'), 'utf8')
const css = await readFile(resolve(root, 'src/App.css'), 'utf8')
const asset = await stat(resolve(root, 'public/hero-avatar-framing.png'))

const checks = [
  ['portrait reference', app.includes("assetUrl('hero-avatar-framing.png')")],
  ['framing layer', app.includes('className="avatar-viewfinder"')],
  ['decorative semantics', app.includes('className="avatar-viewfinder" aria-hidden="true"')],
  ['activation state', app.includes("className={`hero-avatar${isFramingActive ? ' is-framing-active' : ''}`}")],
  ['viewfinder styles', css.includes('.avatar-viewfinder{')],
  ['scan animation', css.includes('@keyframes viewfinderScan')],
  ['reduced motion', /prefers-reduced-motion:reduce[\\s\\S]*avatar-viewfinder/.test(css)],
  ['valid asset size', asset.size > 500_000],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exitCode = 1
```

- [ ] **Step 3: Register and run the verifier to confirm the implementation checks fail**

Add this script to `package.json`:

```json
"verify:hero-framing": "node scripts/verify-hero-framing-avatar.mjs"
```

Run: `npm run verify:hero-framing`

Expected: asset-size passes; portrait reference, framing markup, activation state, animation, and reduced-motion checks fail.

- [ ] **Step 4: Commit the asset and contract**

```powershell
git add public/hero-avatar-framing.png scripts/verify-hero-framing-avatar.mjs package.json
git commit -m "test: define hero framing avatar contract"
```

---

### Task 2: Replace the portrait and add interaction markup

**Files:**
- Modify: `src/App.jsx:47-145`
- Test: `scripts/verify-hero-framing-avatar.mjs`

**Interfaces:**
- Consumes: `/hero-avatar-framing.png`, existing `--avatar-x`, `--avatar-y`, `--decor-x`, and `--decor-y` CSS variables.
- Produces: `.hero-avatar.is-framing-active`, `.avatar-viewfinder`, four `.viewfinder-corner` nodes, `.viewfinder-reticle`, `.viewfinder-scan`, and two `.viewfinder-touch` nodes.

- [ ] **Step 1: Add activation state and pointer lifecycle**

Inside `HeroAvatar`, add:

```jsx
const [isFramingActive, setIsFramingActive] = useState(false)
```

At the beginning of `handlePointerMove`, after the reduced-motion/coarse-pointer guard, add:

```jsx
setIsFramingActive(true)
```

At the beginning of `resetPointer`, add:

```jsx
setIsFramingActive(false)
```

Change the root element to:

```jsx
<div
  ref={avatarRef}
  className={`hero-avatar${isFramingActive ? ' is-framing-active' : ''}`}
  onPointerEnter={() => setIsFramingActive(true)}
  onPointerMove={handlePointerMove}
  onPointerLeave={resetPointer}
>
```

- [ ] **Step 2: Render the hand-framing decoration behind the foreground title**

Insert immediately after `.avatar-orbits`:

```jsx
<div className="avatar-viewfinder" aria-hidden="true">
  <i className="viewfinder-corner viewfinder-corner-tl" />
  <i className="viewfinder-corner viewfinder-corner-tr" />
  <i className="viewfinder-corner viewfinder-corner-br" />
  <i className="viewfinder-corner viewfinder-corner-bl" />
  <span className="viewfinder-reticle" />
  <span className="viewfinder-scan" />
  <span className="viewfinder-touch viewfinder-touch-left" />
  <span className="viewfinder-touch viewfinder-touch-right" />
</div>
```

- [ ] **Step 3: Replace the image reference and accessible name**

Change the image branch to:

```jsx
<img
  ref={avatarImageRef}
  src={assetUrl('hero-avatar-framing.png')}
  alt="廖婷婷以双手构成取景框的个人形象"
  onError={() => setImageFailed(true)}
/>
```

- [ ] **Step 4: Run the focused verifier**

Run: `npm run verify:hero-framing`

Expected: JSX-related checks pass; CSS animation and reduced-motion checks still fail.

- [ ] **Step 5: Commit the component change**

```powershell
git add src/App.jsx
git commit -m "feat: add hero framing avatar markup"
```

---

### Task 3: Compose the portrait and implement the framing motion

**Files:**
- Modify: `src/App.css:15-90`
- Test: `scripts/verify-hero-framing-avatar.mjs`

**Interfaces:**
- Consumes: markup and state class from Task 2 plus the existing pointer-driven CSS variables.
- Produces: a readable desktop composition, one-shot viewfinder scan, fingertip highlights, layered parallax, and reduced-motion fallback.

- [ ] **Step 1: Add the viewfinder base composition**

Append a focused `HERO HAND-FRAME AVATAR` section after the current hero-waist-crop overrides. Define `.avatar-viewfinder` with these exact base values, then refine only its `left`, `top`, and `width` during the bounded browser QA task if the rendered hand positions require alignment:

```css
.avatar-viewfinder{
  position:absolute;
  z-index:4;
  left:31%;
  top:17%;
  width:46%;
  aspect-ratio:1.36;
  pointer-events:none;
  opacity:.26;
  transform:translate3d(calc(var(--decor-x)*-1.2),calc(var(--decor-y)*-1.2),48px) scale(.82);
  transition:opacity .45s ease,transform .68s cubic-bezier(.16,1,.3,1);
}
.hero-avatar.is-framing-active .avatar-viewfinder{
  opacity:.9;
  transform:translate3d(calc(var(--decor-x)*-1.2),calc(var(--decor-y)*-1.2),48px) scale(1);
}
```

Use four corner nodes with border fragments rather than a full box so the frame remains refined and does not obscure the face.

- [ ] **Step 2: Add the reticle, fingertip response, and one-shot scan**

Implement a small central reticle and two radial fingertip lights aligned to the source image's left/lower and right/upper fingertips. Keep the lights below 80px and use opacity/scale only. Define:

```css
@keyframes viewfinderScan{
  0%{opacity:0;transform:translate3d(-115%,0,0)}
  16%{opacity:.72}
  82%{opacity:.42}
  100%{opacity:0;transform:translate3d(115%,0,0)}
}
.hero-avatar.is-framing-active .viewfinder-scan{
  animation:viewfinderScan .82s cubic-bezier(.16,1,.3,1) both;
}
```

The scan animation must restart only on a fresh pointer enter, not loop continuously.

- [ ] **Step 3: Recompose the supplied portrait for desktop**

Override the previous 145% close-up rule for viewports above 620px. Use an explicit height and horizontal position that keeps both hands and the right sleeve inside the viewport. Preserve `width:auto`, `max-width:none`, and `object-fit:contain`; adjust `--avatar-base-x`, `top`, and `height` based on the actual local browser render rather than cropping with `overflow:hidden`.

Expected visual state at 1646 × 912: both hands are present, the face sits in the right half, the dress remains visible below the title, and the right sleeve has breathing room before the viewport edge.

- [ ] **Step 4: Add reduced-motion behavior**

Inside the existing reduced-motion query, add:

```css
.avatar-viewfinder{
  opacity:.48!important;
  transform:none!important;
  transition:none!important;
}
.viewfinder-scan{animation:none!important;opacity:0!important}
.viewfinder-touch{transform:none!important;transition:none!important}
```

This leaves a legible static framing cue while removing scan and parallax movement.

- [ ] **Step 5: Run focused and project-wide automated checks**

Run:

```powershell
npm run verify:hero-framing
npm run verify:desktop-experience
npm run verify:about-portrait
npm run lint
npm run build
```

Expected: all verification and build commands pass. Existing non-blocking lint warnings outside the touched files may remain documented, but no new warning may be introduced.

- [ ] **Step 6: Commit the visual implementation**

```powershell
git add src/App.css
git commit -m "feat: animate hero hand framing effect"
```

---

### Task 4: Browser visual QA and final refinement

**Files:**
- Modify if needed: `src/App.css`
- Test: local Vite page at `http://localhost:5174/#profile`

**Interfaces:**
- Consumes: completed hero asset, markup, and CSS motion.
- Produces: visually verified desktop composition with no clipping, obstruction, or unstable interaction.

- [ ] **Step 1: Open the personal hero at the top of its section**

Use the existing local Vite server and navigate to `http://localhost:5174/#profile`. Reload once to ensure the new public asset is not a stale cached image.

- [ ] **Step 2: Verify the static composition at the target viewport**

At approximately 1646 × 912 confirm:

- both hands, head, and major dress area are visible;
- no hard cut appears on the right edge;
- `HI, I'M` and `TINGTING.` remain readable;
- the inactive frame is subtle and sits between the hands.

- [ ] **Step 3: Verify interaction and interruption**

Move the pointer into, across, out of, and back into the portrait. Confirm the frame expands smoothly, the scan plays once per entry, the layers track without jitter, and leaving returns the composition to rest.

- [ ] **Step 4: Verify the fallback and reduced-motion paths**

Temporarily use browser emulation for `prefers-reduced-motion: reduce` and confirm the frame remains visible without scan or spatial motion. Confirm the existing `LT` fallback still occupies the portrait area if the image request is intentionally blocked, then restore normal loading.

- [ ] **Step 5: Apply only bounded CSS corrections and rerun checks**

If framing alignment or edge clearance needs correction, change only the new hero-hand-frame override values in `src/App.css`, then rerun:

```powershell
npm run verify:hero-framing
npm run lint
npm run build
```

- [ ] **Step 6: Commit any QA adjustment**

```powershell
git add src/App.css
git commit -m "fix: refine hero framing composition"
```
