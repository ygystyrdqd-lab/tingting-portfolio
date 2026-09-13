# Unified Section Title Scale Design

## Goal

Make the About, Works, and Projects main headings smaller and visibly consistent while preserving the portfolio's premium graphite, paper, and champagne identity.

## Current Issue

The three title caps are 210px, 158px, and 166px. About uses a fully champagne second word, Works has an ornamental rule, and Projects has an outlined duplicate. Their scale and accent treatments read as unrelated systems.

## Approved Direction

- Use one shared desktop display scale with a maximum around 140px, common 800 weight, 0.8 line-height, and -0.04em tracking.
- Aim for roughly a 20% perceived reduction overall. About may reduce further than 20% because it starts disproportionately larger; optical consistency takes priority over an identical numeric ratio.
- Keep the existing wording: `ABOUT / ME.`, `SELECTED / WORKS.`, and `PROJECTS.`.
- Keep the existing two-line breaks for About and Works. Preserve Projects as a single line.
- Align all titles to the same content-shell left edge. Reduce second-line offsets to a shared subtle amount, rather than using 18% and 11% independently.
- Use the existing foreground color on each section's dark or light surface. Restrict champagne to the final period in every title.
- Remove the Works ornamental rule and Projects outlined duplicate. Do not add replacement decoration.
- Keep the existing section spacing and explanatory text unless a bounded adjustment is required to avoid collision after the new type scale.

## Implementation Boundaries

- Change only the three main heading markups and their associated editorial-title CSS declarations. Do not alter navigation, section content, imagery, project interactions, or background treatments.
- Preserve `data-section-title` values so current GSAP entrances continue to work.
- Keep real HTML text and semantic `h2` elements. No decorative text copies are needed.
- Desktop is the target presentation; retain the existing desktop-only access gate for narrow screens.
- Save locally only; do not deploy or push.

## Verification

- At the desktop target viewport, all three titles have the same computed size and tracking.
- None overlap the kicker, portrait, description, category rows, sticky project cards, or fixed navigation.
- GSAP entrances still trigger and reduced-motion rules still reveal text.
- Production build and existing desktop contract checks pass.

