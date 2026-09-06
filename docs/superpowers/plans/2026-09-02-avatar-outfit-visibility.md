# Avatar Outfit Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveal more of the avatar's right arm and transparent garment on non-phone viewports while preserving the mobile close-up crop.

**Architecture:** Add one final responsive CSS override after the existing tablet and mobile Hero rules. This ensures widths of `621px` and above use `145%` image height, while widths of `620px` and below keep the existing `166%` rule.

**Tech Stack:** CSS, React 19, Vite 8
**Spec:** `docs/superpowers/specs/2026-09-02-hero-avatar-and-title-refinement-design.md`

## Global Constraints

- Preserve image top alignment, avatar container geometry, dynamic right-edge anchoring, title positions, GSAP Opening, and pointer parallax.
- Use image height `145%` for widths of `621px` and above.
- Preserve image height `166%` for widths of `620px` and below.

---

### Task 1: Apply the non-phone image height override

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `.hero-closeup .avatar-stage img` and the existing `620px` breakpoint.
- Produces: a final `min-width:621px` override with no component API changes.

- [x] **Step 1: Verify current image-height declarations**

Run:

```powershell
rg -n "avatar-stage img\{height:170%|avatar-stage img\{height:166%" src/App.css
```

Expected: the tablet override uses `170%` and the phone override uses `166%`.

- [x] **Step 2: Add the final responsive override**

After the `max-width:620px` Hero block, add:

```css
@media(min-width:621px){
  .hero-closeup .avatar-stage img{height:145%}
}
```

Placing it after the tablet rule guarantees it wins for the application browser's approximately `752px` content viewport.

- [x] **Step 3: Verify the cascade**

Run:

```powershell
rg -n "min-width:621px|height:145%|height:166%" src/App.css
```

Expected: the final non-phone override follows the phone and tablet declarations, while the mobile value remains present.

- [x] **Step 4: Run checks, build, and visual verification**

Run `pnpm run lint`, `pnpm run build`, reload `http://127.0.0.1:5173/#home`, and inspect the current browser viewport after Opening completes.

Expected: no new errors, the homepage returns successfully, the right edge remains visible, and more of the right arm and transparent garment appears. The existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.
