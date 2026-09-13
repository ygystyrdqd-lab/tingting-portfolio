# About Portrait Fingertip Ripple Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present a clean 2K transparent version of `个人ID/1.png` in the second screen and add a precise, low-cost champagne ripple when the desktop pointer meets the foreground fingertip.

**Architecture:** Keep the interaction local to a focused `InteractiveAboutPortrait` React component. The component converts pointer coordinates into card-local CSS custom properties, compares them with a proportional fingertip hotspot, and retriggers three transform/opacity-only ripple rings on hotspot entry. Existing GSAP section reveal and parallax remain unchanged.

**Tech Stack:** React 19, Vite 8, CSS custom properties/keyframes, Pointer Events, built-in ImageGen, Node verification script
**Spec:** `docs/superpowers/specs/2026-09-10-about-fingertip-ripple-design.md`

## Global Constraints

- Use `个人ID/1.png` as the second-screen portrait and copy it into the app's public assets.
- Preserve the site's graphite, champagne, and wine visual system.
- Enable full interaction only for desktop precise pointers.
- Animate only transforms and opacity; add no WebGL, canvas, or dependency.
- Respect `prefers-reduced-motion` and keep touch behavior holders static.
- Preserve the subject's face, pose, hands, red clothing, proportions, and composition while removing white/gray alpha contamination.
- Deliver an actual transparent PNG at a minimum height of 2000px.
- Do not publish or deploy this change.

---

### Task 1: Add the portrait asset and structural verification

**Files:**
- Create: `public/about-portrait-interactive.png`
- Create: `scripts/verify-about-portrait-interaction.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: public asset URL `assetUrl('about-portrait-interactive.png')`
- Produces: `npm run verify:about-portrait` verification command

- [ ] **Step 1: Copy the approved source asset**

Run:

```powershell
Copy-Item -LiteralPath '..\个人ID\1.png' -Destination 'public\about-portrait-interactive.png'
```

- [ ] **Step 2: Write the failing verifier**

Create a Node script that reads `src/App.jsx`, `src/App.css`, and the copied PNG, then asserts:

```js
assert.match(app, /InteractiveAboutPortrait/)
assert.match(app, /about-portrait-interactive\.png/)
assert.match(app, /onPointerMove/)
assert.match(css, /about-fingertip-ripple/)
assert.match(css, /prefers-reduced-motion/)
assert.ok((await stat(assetPath)).size > 100_000)
```

- [ ] **Step 3: Run the verifier and confirm the implementation checks fail**

Run: `node scripts/verify-about-portrait-interaction.mjs`

Expected: failure because the component and ripple styles do not exist yet.

- [ ] **Step 4: Register the verification command**

Add to `package.json` scripts:

```json
"verify:about-portrait": "node scripts/verify-about-portrait-interaction.mjs"
```

- [ ] **Step 5: Commit the asset and verification scaffold**

```powershell
git add public/about-portrait-interactive.png scripts/verify-about-portrait-interaction.mjs package.json
git commit -m "test: define about portrait interaction checks"
```

### Task 2: Implement the pointer-aware portrait component

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `assetUrl('about-portrait-interactive.png')`
- Produces: `InteractiveAboutPortrait()` with card-local pointer tracking and a retriggerable ripple key

- [ ] **Step 1: Add React state and ref imports**

Change the React import to include `useRef` and `useState` while preserving existing hooks.

- [ ] **Step 2: Add `InteractiveAboutPortrait`**

Implement a component with:

```jsx
const fingertip = { x: 24, y: 38 }
const hotspotRadius = 9
```

On pointer move, calculate percentage coordinates from `getBoundingClientRect()`, set `--pointer-x`, `--pointer-y`, and `--contact-strength`, and increment a ripple key only when distance first crosses into the hotspot. Reset the latch on pointer leave or when distance exits the hotspot.

Render the existing orbit, parallax wrapper, new portrait image, three `.about-fingertip-ripple` rings keyed by the contact counter, a `.about-pointer-glow`, and the portrait label. Mark all decoration `aria-hidden="true"`.

- [ ] **Step 3: Replace the old About portrait markup**

Replace the inline `.about-portrait-card` block with:

```jsx
<InteractiveAboutPortrait />
```

Keep `data-reveal-media` on the component root and `data-parallax` on the image wrapper so existing animations continue working.

- [ ] **Step 4: Run the verifier**

Run: `npm run verify:about-portrait`

Expected: component assertions pass; CSS assertion may still fail until Task 3.

### Task 3: Style, accessibility, and visual verification

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `--pointer-x`, `--pointer-y`, `--contact-strength`, and `.is-fingertip-contact`
- Produces: isolated, transform/opacity-only ripple and glow presentation

- [ ] **Step 1: Update the portrait composition**

Set the transparent PNG to `object-fit: contain`, preserve its full front fingertip, and use a restrained dark radial background. Keep the image inside the current 540px desktop card without changing the About text layout.

- [ ] **Step 2: Add the fingertip light and ripple system**

Position `.about-fingertip-fx` at `left:24%; top:38%`. Use three rings with staggered `animation-delay`, a champagne border, and a soft bounded shadow. Run each contact sequence once with an 820ms `cubic-bezier(.16,1,.3,1)` animation.

- [ ] **Step 3: Add pointer-capability and reduced-motion guards**

Use:

```css
@media (hover:hover) and (pointer:fine) { /* full effect */ }
@media (prefers-reduced-motion:reduce) { /* no spatial ripple; brief glow only */ }
```

Touch devices retain the static portrait with no cursor-following visual.

- [ ] **Step 4: Run all automated checks**

Run:

```powershell
npm run verify:about-portrait
npm run verify:desktop-experience
npm run lint
npm run build
```

Expected: all commands exit with code 0.

- [ ] **Step 5: Preview at desktop size**

Open the local Vite page at 1646×912, scroll to `#about`, and verify that the ripple origin aligns with the foreground fingertip, the full hand remains visible, and rapid pointer entry/exit leaves no stale rings.

- [ ] **Step 6: Read the craft floor and polish before finalizing**

Read `C:/Users/Mayn/.codex/skills/impeccable/reference/craft-floor.md`, then correct any spacing, focus, overflow, contrast, or motion issues found during visual inspection.

- [ ] **Step 7: Commit the local implementation**

```powershell
git add src/App.jsx src/App.css
git commit -m "feat: add interactive about portrait ripple"
```

Do not run the GitHub publishing script.

### Task 4: Refine the transparent portrait asset

**Files:**
- Create: `public/about-portrait-interactive-v2.png`
- Modify: `src/App.jsx`
- Modify: `scripts/verify-about-portrait-interaction.mjs`

**Interfaces:**
- Consumes: approved source `public/about-portrait-interactive.png`
- Produces: high-fidelity `assetUrl('about-portrait-interactive-v2.png')` with real alpha transparency and a height of at least 2000px

- [ ] **Step 1: Generate a non-destructive high-fidelity edit**

Use the built-in image editing tool with the source image as the edit target and this invariant set:

```text
Remove only the white and gray fringe contamination from the transparent subject edges. Preserve the exact identity, facial features, hair shape and strands, pose, hand anatomy, fingertip position, red clothing, fabric transparency, shoes, body proportions, perspective, crop, and composition. Increase fine-detail clarity for a 2K-tall web asset. Keep a genuine fully transparent background. Add no outline, shadow, backdrop, text, watermark, objects, or new styling.
```

- [ ] **Step 2: Inspect the generated output at original detail**

Verify the face, both hands, foreground fingertip, hair silhouette, translucent skirt layers, and shoes against the source. Reject the output if identity, anatomy, pose, clothing, or composition changed.

- [ ] **Step 3: Copy the approved output into the project**

Copy the generated PNG to `public/about-portrait-interactive-v2.png` without overwriting the source asset. Confirm the PNG height is at least 2000px and that its pixel format contains alpha.

- [ ] **Step 4: Write the failing asset-quality assertions**

Update `scripts/verify-about-portrait-interaction.mjs` to assert:

```js
assert(app.includes("assetUrl('about-portrait-interactive-v2.png')"), 'Refined portrait asset is not connected')
assert(statSync(refinedPortrait).size > 250_000, 'Refined portrait asset is unexpectedly small')
```

Run: `node scripts/verify-about-portrait-interaction.mjs`

Expected: failure until `src/App.jsx` references the new versioned asset.

- [ ] **Step 5: Connect the refined asset**

Change the `InteractiveAboutPortrait` image source to:

```jsx
src={assetUrl('about-portrait-interactive-v2.png')}
```

Keep the existing pointer hotspot calculation based on the rendered image rectangle so it remains aligned after the resolution change.

- [ ] **Step 6: Rebuild and visually verify on the dark card**

Run:

```powershell
npm run verify:about-portrait
npm run lint
npm run build
```

Preview `#about` at 1440px or wider. Verify that no continuous pale fringe is visible around hair, fingers, sleeves, skirt, or shoes and that the ripple still begins at the foreground fingertip.

- [ ] **Step 7: Commit the local refinement**

```powershell
git add public/about-portrait-interactive-v2.png src/App.jsx scripts/verify-about-portrait-interaction.mjs
git commit -m "feat: refine about portrait image quality"
```

Do not run the GitHub publishing script.
