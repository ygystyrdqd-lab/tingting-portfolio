# Opening Percentage Loader Design

## Goal

Replace the current `LT / VISUAL DESIGN · SHENZHEN` opening mark with a large masked percentage sequence: `10% → 20% → 30% → 40% → 100%`. Preserve the existing Hero title, avatar, header, and overlay exit animation.

## Visual Design

- Display one percentage at a time in the center of the opening overlay.
- Use large ivory numerals sized with `clamp(72px, 12vw, 180px)` and the site's existing Geist typeface.
- Render the percent sign smaller and in champagne gold so the number remains the main visual anchor.
- Place the number inside an overflow-hidden mask. Each new value enters upward from below while the previous value exits upward.
- Apply a restrained horizontal compression and blur during entry, resolving to a crisp, full-width number.
- Add a thin champagne progress rail beneath the number. Its fill advances in five steps matching the displayed values.
- Keep the deep black-brown overlay and existing subtle panel treatment.

## Sequence and Timing

- `10%` appears at `0.00s`.
- `20%` replaces it at `0.24s`.
- `30%` replaces it at `0.48s`.
- `40%` replaces it at `0.72s`.
- `100%` replaces it at `1.04s` and remains visible for approximately `0.40s`.
- The loader fades and moves upward before the overlay exit begins.
- The overlay exits with the existing upward `power3.inOut` reveal.
- The Hero title and avatar retain their existing entrance style, but their timeline positions shift only as needed to begin after the percentage sequence reaches `100%`.
- Total opening duration remains approximately `3.0s` so the site does not feel delayed.

## Component Structure

`OpeningOverlay.jsx` renders the fixed five-value sequence, one masked number track, and one progress rail. The sequence is decorative and remains `aria-hidden="true"`, matching the current overlay behavior.

`usePortfolioAnimations.js` owns the sequence animation within the existing opening GSAP timeline. It targets stable data attributes for percentage items, the number track, and the progress fill. No timer or simulated network state is added.

## Responsive and Reduced Motion

- Desktop uses the full `clamp(72px, 12vw, 180px)` numeral scale.
- Mobile keeps the same centered composition and naturally resolves to the lower end of the clamp.
- With `prefers-reduced-motion: reduce`, the existing motion system skips the animated opening; the page remains immediately accessible without a loader delay.

## Error and Performance Behavior

- The loader is deterministic and does not wait for remote resources, preventing it from becoming stuck.
- The percentage items are static text and require no new dependency.
- GSAP animates transforms, opacity, filter, and the progress scale only.
- The existing opening fail-safe continues to remove the overlay and restore scrolling if timeline setup fails.

## Verification

- The opening overlay no longer displays the `LT` circle or `VISUAL DESIGN · SHENZHEN` label.
- The visible order is exactly `10%`, `20%`, `30%`, `40%`, `100%`.
- Each number uses an upward masked transition without bounce.
- The progress rail advances with the sequence and reaches full width at `100%`.
- The overlay exits upward and reveals the current Hero animation smoothly.
- Scrolling remains locked only during the opening and is restored afterward.
- Mobile layout remains centered, reduced-motion users are not delayed, and the production build completes without new errors.

