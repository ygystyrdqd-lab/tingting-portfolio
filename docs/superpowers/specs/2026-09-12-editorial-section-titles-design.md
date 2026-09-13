# Editorial Section Titles Design

## Goal

Refine the primary headings in the About, Works, and Projects sections into one coherent editorial typography system. The result should feel like a premium designer portfolio: bold and asymmetric, but controlled, readable, and consistent with the existing graphite, paper, and champagne palette.

## Scope

- Update only the main title markup and title-adjacent layout in the About, Capabilities/Works, and Projects sections.
- Preserve the existing section order, copy meaning, section kickers, content, cards, navigation, and category behavior.
- Preserve the existing `data-section-title` hooks so the GSAP scroll-entry sequences continue to work.
- Optimize this pass for the desktop presentation. Existing small-screen behavior remains intact but receives no separate redesign.

## Shared Typography System

- Each title uses explicit line wrappers so the two lines can be positioned independently without relying on a raw `<br>`.
- Use a tighter but readable display rhythm: line-height around `0.78–0.84` and tracking no tighter than approximately `-0.04em`.
- Use fluid `clamp()` sizing bounded by the current content shell so headings remain dramatic without colliding with adjacent content.
- Add a shared title class for reusable sizing, line treatment, and alignment; section-specific modifiers control offset and color.
- Champagne is used as a focused accent, not as the dominant title color.

## Section Treatments

### About

- Keep `ABOUT` as the large first line aligned to the left edge of the content shell.
- Place `ME.` on the second line with an intentional rightward offset of roughly 18%.
- Render `ME.` in champagne to connect the title to the portrait interaction and the site's warm highlight color.
- Reduce the current excessive negative tracking and rebalance the margin below the title so the portrait/copy grid feels connected to the heading.

### Works

- Keep `SELECTED` on the first line.
- Place `WORKS.` on the second line with a smaller rightward offset than About, around 10–12%, producing a related but distinct silhouette.
- Keep the main lettering dark for contrast on the paper background; add a restrained champagne rule aligned with the second line instead of coloring the whole word.
- Maintain room for the existing descriptive paragraph at the lower right of the intro block.

### Projects

- Keep the semantic title `PROJECTS.` on one strong line rather than splitting the word unnaturally.
- Add one subtle outlined duplicate behind the live title, offset by a small distance, to create depth without reducing legibility.
- Keep the live period in champagne.
- Rebalance the intro paragraph and top/bottom spacing so the title reads as a composed header rather than an isolated oversized word.

## Motion and Accessibility

- Existing section-level GSAP animations continue to target the outer heading through `data-section-title`.
- Decorative duplicate text is marked `aria-hidden="true"` and does not repeat content for assistive technology.
- Title text remains real HTML text rather than an image.
- No bouncing, continuous title animation, or expensive filter animation is added.
- Reduced-motion behavior remains governed by the existing global rules.

## Verification

- Run the production build and lint checks.
- Preview all three sections at the desktop target viewport (approximately 1646 × 912).
- Confirm no title overlaps the section kicker, description, portrait, capability list, project cards, or fixed navigation.
- Confirm the About, Works, and Projects GSAP title entrances still run.
- Confirm the Projects decorative duplicate is not exposed as duplicate accessible text.

