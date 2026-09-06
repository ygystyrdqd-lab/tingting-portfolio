# Accordion Gallery Full-Bleed Compact Design

## Goal

Reduce the homepage accordion gallery to approximately half its current height and make the five-panel gallery span the full browser width without outer side whitespace.

## Layout

- The accordion panel row uses the full viewport width rather than the site's `1200px` content shell.
- The first panel touches the left viewport edge and removes its left border radius and left border.
- The fifth panel touches the right viewport edge and removes its right border radius and right border.
- Internal panel gaps remain at `8px` so the accordion structure stays legible.
- The `SELECTED DIRECTIONS / 01 — 05` metadata row remains aligned to the site's approximately `1200px` content shell.

## Dimensions

- Desktop and tablet widths of `768px` and above use `height: clamp(240px, 24vw, 300px)`.
- Mobile widths below `768px` use a fixed `240px` gallery height.
- The surrounding section spacing is reduced to keep the compact gallery from floating inside excessive empty space: `48px` above and `76px` below on desktop, `38px` above and `62px` below on mobile.

## Content Scaling

- Active English titles use `clamp(26px, 3.1vw, 44px)` on desktop and `clamp(26px, 8vw, 38px)` on mobile.
- Expanded copy moves closer to the panel edges and bottom: horizontal inset `20–34px`, bottom inset `20–30px`.
- Chinese subtitles remain visible at `9px`.
- Descriptions use `10px`, a tighter line height, and a smaller top margin.
- Compact vertical rail titles and two-digit indices remain present on desktop.

## Mobile Behavior

- The gallery remains a horizontally scrollable snap row.
- Remove the current `14px` horizontal gallery padding and scroll padding so the row starts flush with the viewport edge.
- Mobile panels use `82vw` width, allowing the next card to remain partially visible while preserving the edge-to-edge row.
- The first and last panel edge treatments match desktop.

## Interaction and Motion

- Keep the current active-panel proportions, initial `3D & AIGC` state, GSAP duration, easing, pointer parallax, click behavior, keyboard navigation, and reduced-motion handling.
- Abstract placeholder artwork remains unchanged except for its natural crop inside the shorter panel.

## Verification

- At PC width, the card row touches both viewport edges and contains five panels in one row.
- The panel height remains between `240px` and `300px` and is visually about half the previous height.
- There is no external left or right gap, while `8px` internal gaps remain.
- Active title, subtitle, and description remain readable without overflow.
- At mobile width, the row begins flush at the left edge, scrolls horizontally, and remains `240px` high.
- Hover, click, keyboard navigation, opening animation, and later sections continue working.
- Lint and production build complete without new errors.

