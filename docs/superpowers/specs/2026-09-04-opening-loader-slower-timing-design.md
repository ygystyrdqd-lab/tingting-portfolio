# Opening Loader Slower Timing Design

## Goal

Slow the existing `10% → 20% → 30% → 40% → 100%` opening animation so every value can be read clearly while preserving the premium masked transition and keeping the total opening near five seconds.

## Approved Rhythm

- Keep the current visual design, number order, upward mask, compression, blur resolution, champagne progress rail, and overlay treatment unchanged.
- Give `10%`, `20%`, `30%`, and `40%` approximately `0.6–0.7s` of readable dwell time each.
- Increase each outgoing/incoming transition to approximately `0.35s`, using the existing smooth non-bouncing eases.
- Let `100%` remain fully visible for approximately `0.8s` before the loader recedes.
- Start the Hero title and avatar only after the numerical sequence reaches `100%`.
- Complete the overlay exit at approximately `5.0s` from the opening start.

## Implementation Scope

Only the GSAP timing values in `src/hooks/usePortfolioAnimations.js` change. The React structure, CSS styling, accessibility behavior, fail-safe cleanup, scroll locking, and reduced-motion shortcut remain unchanged.

## Verification

- All five values are visually readable during a normal reload.
- No two values appear fully visible at the same time.
- The progress rail remains synchronized with each value.
- `100%` receives the longest readable pause.
- The Hero entrance remains smooth and begins after `100%`.
- Scroll unlocks after the overlay exits, reduced-motion users are not delayed, and lint/build continue to pass.
