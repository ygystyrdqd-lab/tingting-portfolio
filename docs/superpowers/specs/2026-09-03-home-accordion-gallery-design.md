# Homepage Accordion Gallery Design

## Goal

Replace the two-row infinite marquee below the homepage Hero with a single-row, five-panel accordion gallery inspired by React Bits Accordion Gallery. The result must feel like a high-end creative studio portfolio and remain consistent with the site's restrained champagne, oxblood, and black-brown visual system.

## Content

The gallery keeps the current five categories in this order:

1. Brand System — 品牌视觉系统
2. Visual Direction — 视觉创意方向
3. 3D & AIGC — 三维概念实验
4. Campaign — 营销活动视觉
5. Packaging — 包装与物料延展

The initial active panel is `3D & AIGC`. Each item is data-driven and accepts a future image URL without changing the gallery component. Until portfolio imagery is provided, every panel uses a distinct CSS-generated abstract composition based on the current card palette and shapes.

## Component Architecture

Create a focused `AccordionGallery` component under `src/components/gallery/`. It consumes an `items` array with `title`, `subtitle`, `description`, `className`, and optional `image` fields. The homepage `Marquee` section is replaced by a small wrapper that passes the existing five categories into this component.

The component owns only active-panel state, pointer parallax values, keyboard interaction, and its animation lifecycle. Page-level scroll animation continues to be handled by the existing homepage motion system.

## Desktop Interaction

- At widths of `768px` and above, all five panels share one horizontal row.
- The active panel occupies approximately `46%` of the gallery width; the other four divide the remaining width evenly.
- Hovering or focusing a panel activates it. Clicking also activates it.
- Leaving the gallery preserves the most recently active panel to prevent visual flicker.
- Panel expansion uses GSAP with a `0.75s` duration and a smooth `power3.inOut` ease. There is no elastic or bounce easing.
- The active panel's abstract artwork moves up to `10px` against pointer direction. Text reveals with a restrained masked upward movement and opacity transition.
- Inactive panels show a vertical index and compact title. The active panel reveals its index, English title, Chinese subtitle, and description.

## Mobile and Touch Interaction

- Below `768px`, the gallery becomes a horizontally scrollable snap row.
- The active card is wider than the viewport's side cards and is activated by tap or keyboard focus.
- Hover-only behavior is disabled on coarse pointers.
- The gallery must not trap horizontal page scrolling or interfere with vertical document scrolling.

## Visual System

- Section background remains a deep translucent black-brown connected to the Hero.
- Borders use low-opacity ivory and brighten to champagne on the active panel.
- Abstract placeholders combine radial gradients, thin line work, geometric rings, and subtle grain. Each category receives a distinct arrangement while sharing the same palette.
- Active content uses ivory type with champagne metadata. Inactive content remains muted but legible.
- Border Glow is not layered onto the new gallery; the accordion expansion and artwork parallax are the primary effects.
- The gallery is framed within the site's approximately `1200px` content width and uses larger top and bottom breathing room than the current marquee.

## Accessibility and Motion Preferences

- Each panel is a semantic button with an accessible label and visible keyboard focus treatment.
- Arrow Left and Arrow Right move the active panel; Home and End move to the first and last panels.
- With `prefers-reduced-motion: reduce`, expansion and text reveal complete immediately, artwork parallax is disabled, and no continuous animation runs.
- If an optional future image fails to load, the abstract CSS composition remains visible underneath it.

## Performance

- Reuse the project's existing GSAP dependency; add no new animation library.
- Animate only five panels.
- Pointer updates are batched through `requestAnimationFrame` and animate transforms rather than background positions.
- No continuous marquee loop remains after the replacement.

## Verification

- The existing two marquee rows are gone and one five-panel accordion gallery appears below the Hero.
- `3D & AIGC` is active on first load.
- Hover, click, focus, and keyboard navigation activate the correct panel.
- Expansion is slow and smooth without bounce, and the abstract artwork has subtle parallax.
- The gallery remains usable on a touch-width viewport and respects reduced-motion preferences.
- The homepage opening sequence and all later sections continue to work.
- Lint and production build complete without new errors.

