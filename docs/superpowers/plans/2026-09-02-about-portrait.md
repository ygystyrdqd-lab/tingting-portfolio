# About Portrait Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a new crossed-arms pose of the Hero character and replace the About placeholder with the finished transparent portrait.

**Architecture:** Use `public/hero-avatar-closeup.png` as the image-generation reference, save the new result as a separate asset, verify or create a real alpha channel, then replace the placeholder geometry with a semantic image element. Keep the existing About card as the background environment and add only portrait-specific styles.

**Tech Stack:** React 19, Vite 8, imagegen, PNG alpha, CSS
**Spec:** `docs/superpowers/specs/2026-09-02-about-portrait-design.md`

## Global Constraints

- Preserve the same character, face, hair, copper-orange translucent outfit, and 3D visual style as the Hero reference.
- Pose: slight three-quarter turn toward screen right, face to camera, arms naturally crossed.
- Include the full hair, shoulders, arms, and body through the hip area.
- Save a separate `public/about-portrait.png`; never overwrite the Hero asset.
- Do not change About copy, facts, other sections, navigation, or the Hero.
- The workspace has no Git repository, so commit steps are omitted.

---

### Task 1: Generate and validate the new portrait asset

**Files:**
- Reference: `public/hero-avatar-closeup.png`
- Create: `public/about-portrait.png`
- Reuse if needed: `scripts/remove_black_background.py`

**Interfaces:**
- Consumes: the Hero portrait as visual identity reference.
- Produces: a vertical RGBA portrait usable at 540px card height.

- [ ] **Step 1: Generate one character-consistent portrait**

Use imagegen with the Hero image as the only referenced image and this complete brief:

```text
Create a new vertical 3D character portrait of exactly the same young Asian woman shown in the reference: identical facial identity, long wavy black hair, skin tone, refined semi-realistic 3D rendering, copper-orange translucent futuristic outfit, and warm orange-gold rim light. Change only the pose: a relaxed professional three-quarter stance angled slightly toward screen right, face looking at the camera, both arms naturally crossed in front of the torso. Show the complete head and hair, shoulders, both elbows and forearms, waist and upper hip. Keep all limbs anatomically correct and fully inside the frame. Center the subject slightly low with a small amount of space above the hair. Transparent background, clean smooth alpha edges, no floor, no shadow plate, no scenery, no text, no logos, no interface elements, no extra person. High-resolution vertical portfolio asset.
```

- [ ] **Step 2: Inspect identity, pose, crop, and edges**

Use the local image viewer at original detail.

Expected: one person; recognizable reference identity; crossed arms; complete hair and elbows; no text or props; no visibly baked checkerboard.

- [ ] **Step 3: Ensure real transparency**

Inspect image mode and alpha extrema. If the result has an opaque uniform black background, run:

```powershell
python scripts/remove_black_background.py GENERATED_IMAGE public/about-portrait.png
```

If the result already has real alpha, copy it unchanged to `public/about-portrait.png`. Expected final mode: RGBA with alpha extrema `(0, 255)`.

### Task 2: Replace the About placeholder markup

**Files:**
- Modify: `src/App.jsx:124-130`

**Interfaces:**
- Consumes: `/about-portrait.png`.
- Produces: `.about-portrait-card`, `.about-portrait-image`, `.portrait-orbit`, and `.portrait-label` markup.

- [ ] **Step 1: Replace the placeholder geometry**

Use:

```jsx
<div className="about-portrait-card">
  <div className="portrait-orbit" aria-hidden="true" />
  <img className="about-portrait-image" src="/about-portrait.png" alt="廖婷婷的个人3D形象" />
  <span className="portrait-label">PERSONAL PORTRAIT / 3D</span>
</div>
```

Do not add image loading state; the card background and label remain visible if the resource fails.

- [ ] **Step 2: Verify placeholder markup is gone**

Run:

```powershell
rg -n "portrait-placeholder|portrait-silhouette|about-portrait-image|PERSONAL PORTRAIT / 3D" src/App.jsx
```

Expected: only the new image class and label match.

### Task 3: Style the portrait card and responsive image

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: Task 2 class names.
- Produces: a 540px desktop card, 460px tablet card, full-subject image containment, and restrained hover motion.

- [ ] **Step 1: Add the card styles**

Append:

```css
.about-portrait-card{position:relative;height:540px;border:1px solid #ffffff29;border-radius:22px;overflow:hidden;isolation:isolate;background:radial-gradient(circle at 50% 34%,rgba(110,77,55,.72),rgba(43,37,32,.9) 34%,rgba(16,13,11,.96) 72%)}
.about-portrait-card:before{content:"";position:absolute;z-index:0;inset:0;background-image:linear-gradient(#ffffff0f 1px,transparent 1px),linear-gradient(90deg,#ffffff0f 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(black,transparent 78%)}
.about-portrait-image{position:absolute;z-index:2;inset:auto 0 0;width:100%;height:96%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 28px 28px rgba(0,0,0,.42));transition:transform .55s cubic-bezier(.2,.8,.2,1),filter .55s}
.about-portrait-card:hover .about-portrait-image{transform:scale(1.025);filter:drop-shadow(0 34px 32px rgba(0,0,0,.5)) drop-shadow(0 0 20px rgba(208,173,125,.16))}
.about-portrait-card .portrait-orbit{z-index:1}
.portrait-label{position:absolute;z-index:3;left:18px;bottom:16px;color:#ffffff80;font-size:8px;letter-spacing:.16em}
```

- [ ] **Step 2: Add responsive and reduced-motion rules**

```css
@media(max-width:920px){.about-portrait-card{height:460px}.about-portrait-image{height:98%}}
@media(max-width:620px){.about-portrait-card{height:440px}.about-portrait-image{height:96%}}
@media(prefers-reduced-motion:reduce){.about-portrait-image{transition:none!important}.about-portrait-card:hover .about-portrait-image{transform:none!important}}
```

- [ ] **Step 3: Verify selector scope**

Run:

```powershell
rg -n "about-portrait-card|about-portrait-image|portrait-label" src/App.css
```

Expected: all new selectors are scoped to the About portrait and do not change the Hero image.

### Task 4: Validate the local deliverable

**Files:**
- Verify: `public/about-portrait.png`
- Verify: `src/App.jsx`
- Verify: `src/App.css`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: a compilable local site with the new About portrait available.

- [ ] **Step 1: Run the production build**

Run the existing `pnpm run build` script with the bundled Node runtime on `PATH`.

Expected: Vite exits with code 0 and emits `dist/index.html`.

- [ ] **Step 2: Verify local availability**

Request `http://127.0.0.1:5173/#about` and `http://127.0.0.1:5173/about-portrait.png`.

Expected: both return HTTP 200. Do not perform screenshot, DOM, click, or resize testing unless the user separately requests browser QA.
