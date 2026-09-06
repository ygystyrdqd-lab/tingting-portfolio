# New Intro Hero With Fan Cards Design

## Goal

Add a new full-screen opening section inspired by `IMG_2662..PNG`, move the current `HI, I'M TINGTING` character Hero to the second screen, and remove the existing accordion gallery from the page flow.

## Page Order

1. Opening percentage overlay.
2. New intro Hero at `#home`.
3. Existing character Hero at `#profile`.
4. About at `#about`.
5. Capabilities/work categories at `#capabilities`.
6. Projects/advantages at `#projects`.
7. Contact footer.

The navigation item “首页” continues to target `#home`. The new intro Hero scroll cue targets `#profile`; the character Hero keeps its existing cue to `#about`.

## Intro Hero Layout

- Use one full viewport height with the existing site header overlaid above it.
- Center a small champagne-outlined pill reading `VISUAL DESIGNER · CREATIVE MAKER`.
- Use the two-line headline `Designing` / `Visual Experiences`, with “Visual Experiences” accented using the current champagne-to-wine palette rather than the purple reference color.
- Add the supporting copy: `用策略、审美与新技术，创造清晰而有记忆点的视觉体验。`
- Place five portrait-format visual placeholder cards in a shallow arc beneath the copy. The center card is largest and highest; outer cards rotate and sit lower to form a controlled fan.
- Use CSS-generated abstract artwork and existing visual categories as placeholder content. No portfolio image asset is required in this iteration.

## Card Content

The five cards represent:

1. Brand System / 品牌视觉
2. Campaign / 活动视觉
3. Visual Direction / 视觉创意
4. 3D & AIGC / 三维实验
5. Packaging / 包装延展

Each card includes a small sequence number, English category title, Chinese label, and abstract geometric artwork. The card data lives in the new intro component so later image URLs can be added without restructuring the layout.

## Motion

- After the percentage overlay reaches `100%`, reveal the intro pill, headline, copy, and scroll cue with the existing restrained GSAP visual language.
- Initialize all five cards overlapped at the middle with reduced scale and slight depth.
- Expand the cards from the center in a staggered sequence to their final fan positions. Use smooth `power3.out` or `power4.out` easing and no elastic bounce.
- On desktop hover, the targeted card rises slightly, straightens toward zero rotation, and gains a restrained champagne edge glow. Neighboring cards remain stable.
- When scrolling to the second character Hero, animate its title and portrait as an ordinary scroll-triggered reveal rather than as part of the opening overlay timeline.
- Reduced-motion users see both sections immediately with final card positions and no staged expansion.

## Color and Texture

- Retain the current graphite-black, ivory, champagne gold, warm brown, and restrained wine-red tokens.
- Do not introduce the reference image's saturated purple palette.
- Build the new background from layered radial gradients, subtle grain, and a faint central glow so it belongs to the current site.
- Cards use deep brown-black surfaces, warm abstract highlights, thin translucent borders, and restrained shadows.

## Component Structure

- Create `src/components/hero/IntroHero.jsx` for the new section and its five-card data.
- Create `src/components/hero/IntroHero.css` for the intro-only layout, card artwork, responsive rules, hover states, and reduced-motion fallback.
- Update `src/App.jsx` to render `IntroHero` before the current `Hero`, change the current Hero id to `profile`, and remove the `AccordionGallery` import, `galleryItems`, `Marquee` component, and `<Marquee />` render.
- Update `src/hooks/usePortfolioAnimations.js` to target the new intro opening hooks, remove the obsolete gallery scroll timeline, and add a scroll-triggered reveal for the character Hero.
- Preserve the existing accordion component files on disk but leave them unused, allowing recovery without destructive deletion.

## Responsive Behavior

- Desktop keeps the five-card fan visible within the viewport width and below the centered copy.
- Tablet reduces card width and fan spread while retaining all five cards.
- Mobile uses a shallower fan with partially overlapping cards; outer cards may extend slightly beyond the viewport, but the headline and central card remain fully visible.
- Hover motion is disabled for coarse pointers.

## Verification

- The new intro is the first page section and the current character Hero is the second.
- The old accordion gallery is not rendered and its gallery animation hook is removed.
- Five placeholder cards visibly expand from the center after the opening percentage overlay.
- The new section uses the current champagne/wine color system rather than purple.
- Header navigation, section anchors, category pages, mobile layout, reduced motion, and scroll restoration remain functional.
- Lint and production build complete without new errors.
