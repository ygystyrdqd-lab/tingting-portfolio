# Hero Full-Body Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the red-dress hero portrait as a complete full-body figure with reliable top-hand clearance while preserving the hand-framing interaction and existing left-side typography.

**Architecture:** Keep the current React markup and interaction state unchanged. Extend the focused hero verification contract, then add a final desktop-only CSS override that fits the complete PNG inside the first viewport, realigns the viewfinder, and restores a grounded shadow. Validate geometry with a 1646 × 912 browser capture before accepting the values.

**Tech Stack:** React 19, CSS, Node.js verification script, Vite 8, Playwright with installed Microsoft Edge for local desktop QA
**Spec:** `docs/superpowers/specs/2026-09-10-hero-full-body-composition-design.md`

## Global Constraints

- Continue using `public/hero-avatar-framing.png`; do not edit or regenerate the image.
- Keep the complete head, both hands, full skirt, and both shoes visible at 1646 × 912.
- Preserve the existing `HI, I'M / TINGTING.` layout and `HeroAvatar` interaction logic.
- Keep the viewfinder aligned between the hands in active and reduced-motion states.
- Do not modify the second portrait, mobile experience, navigation, other pages, or deployment state.
- Add no dependencies.

## File Structure

- Modify `scripts/verify-hero-framing-avatar.mjs`: add static checks for the full-body override and ground shadow.
- Modify `src/App.css`: add the desktop full-body composition, viewfinder alignment, and ground shadow.

---

### Task 1: Define and implement the desktop full-body composition

**Files:**
- Modify: `scripts/verify-hero-framing-avatar.mjs`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `.hero-closeup .avatar-stage img`, `.avatar-viewfinder`, `.hero-closeup .avatar-ground`, and existing pointer variables.
- Produces: `.hero-full-body` verification marker, an 88%-height desktop portrait, a hand-aligned 28%-width viewfinder, bounded vertical pointer movement, and a visible static ground shadow.

- [ ] **Step 1: Add failing full-body contract checks**

Add these entries to the `checks` array in `scripts/verify-hero-framing-avatar.mjs`:

```js
['full-body composition marker', css.includes('/* HERO FULL-BODY COMPOSITION */')],
['desktop full-body height', css.includes('height:88%')],
['top hand clearance', css.includes('top:1%')],
['bounded vertical parallax', css.includes('--avatar-y-safe:clamp(-2px,var(--avatar-y),2px)')],
['ground shadow restored', css.includes('.hero-closeup .avatar-ground{display:block')],
```

- [ ] **Step 2: Run the focused verifier to confirm the new checks fail**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run verify:hero-framing
```

Expected: existing checks pass; the three new full-body checks fail.

- [ ] **Step 3: Add the final desktop composition override**

Append this block after the existing `HERO HAND-FRAME AVATAR` rules and before `ABOUT PORTRAIT`:

```css
/* HERO FULL-BODY COMPOSITION */
@media(min-width:921px){
  .hero-closeup .avatar-stage img{--avatar-base-x:-47%;--avatar-y-safe:clamp(-2px,var(--avatar-y),2px);top:1%;height:88%;transform:translate3d(calc(var(--avatar-base-x) + var(--avatar-x) + var(--avatar-safe-x)),var(--avatar-y-safe),30px) rotateX(var(--avatar-rx)) rotateY(var(--avatar-ry));transform-origin:50% 42%}
  .avatar-viewfinder{left:39.5%;top:14%;width:28%;aspect-ratio:1.24}
  .hero-closeup .avatar-ground{display:block;left:43%;right:auto;bottom:4%;width:39%;height:24px;opacity:.66;background:radial-gradient(ellipse,rgba(208,173,125,.34),rgba(101,49,42,.16) 42%,transparent 72%);filter:blur(9px)}
}
```

The later rule must win over the existing 145% and 150% desktop image-height rules without altering tablet or mobile declarations.

- [ ] **Step 4: Run focused and project-wide checks**

Run:

```powershell
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run verify:hero-framing
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run verify:desktop-experience
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run lint
& 'C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' run build
```

Expected: verification and build pass; no new lint warning appears.

- [ ] **Step 5: Capture and inspect desktop geometry**

Open `http://localhost:5174/#profile` at 1646 × 912 after the opening animation, then record these bounding boxes: `.hero-avatar img`, `.avatar-viewfinder`, `.hero-title-back`, and `.hero-title-front`.

Accept only when:

- image top is at least 120px;
- image bottom is at most 900px;
- image right is at most 1580px;
- the visible upper hand remains below the fixed navigation after hover activation;
- the viewfinder sits inside the image bounds and between the two hands;
- title rectangles remain readable and are not fully covered by the figure.

- [ ] **Step 6: Make one bounded optical correction if geometry requires it**

Change only `--avatar-base-x`, `top`, `height`, viewfinder `left/top/width`, or ground-shadow `left/width/bottom`. Repeat the same 1646 × 912 capture once and stop when all Step 5 limits pass.

- [ ] **Step 7: Commit the verified composition**

```powershell
git add scripts/verify-hero-framing-avatar.mjs src/App.css
git commit -m "feat: show full-body hero portrait"
```
