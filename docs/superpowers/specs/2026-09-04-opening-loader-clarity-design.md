# Opening Loader Clarity Design

## Goal

Make `20%`, `30%`, `40%`, and `100%` immediately legible without losing the existing premium upward reveal or extending the approximately five-second opening.

## Approved Motion

- Keep the existing `0.72s` interval between percentage changes.
- Reduce the outgoing transition to `0.14s`.
- Reduce the incoming transition to `0.18s`.
- Reduce incoming blur from `8px` to `2px` and outgoing blur from `6px` to `1px`.
- Reduce horizontal compression: enter at `scaleX: 0.96` and exit at `scaleX: 0.98`.
- Keep the number fully opaque, unblurred, and uncompressed for approximately `0.5s` before the next change.
- Preserve the current upward masked direction and non-bouncing easing.

## Scope

Only the percentage initialization and transition properties in `src/hooks/usePortfolioAnimations.js` change. Arrival times, progress timing, total opening duration, Hero handoff, markup, CSS, reduced-motion behavior, scroll locking, cleanup, and dependencies remain unchanged.

## Verification

- Stable samples show each value at opacity `1`, blur `0px`, and `scaleX: 1`.
- Later values are readable without waiting for the transition to finish visually.
- Any overlap between outgoing and incoming values is brief and does not resemble a double-exposure effect.
- The progress rail stays synchronized.
- The overlay still finishes around five seconds, scroll is restored, and the browser console has no new errors.
