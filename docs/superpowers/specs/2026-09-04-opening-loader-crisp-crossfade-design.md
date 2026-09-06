# Opening Loader Crisp Crossfade Design

## Goal

Make every percentage value unmistakably clear while keeping the opening near five seconds.

## Approved Motion

- Keep the current value order and `0.72s` interval between changes.
- Remove vertical movement, blur, and horizontal compression from percentage changes.
- Fade the outgoing value from opacity `1` to `0` over `0.08s`.
- Fade the incoming value from opacity `0` to `1` over `0.08s` at the same timeline position.
- Keep each value fully static and fully opaque for approximately `0.64s` before the next change.
- Preserve the current progress rail timing, `100%` hold, Hero handoff, overlay exit, and approximately five-second total duration.

## Scope

Only the percentage initialization and replacement tweens in `src/hooks/usePortfolioAnimations.js` change. React markup, CSS, dependencies, accessibility behavior, reduced-motion behavior, scroll locking, cleanup, and all non-loader animation remain unchanged.

## Verification

- At stable sample times, exactly one percentage is visible with opacity `1`, filter `none` or `blur(0px)`, and no scale or vertical transform.
- During each `0.08s` crossfade, no motion blur or geometric distortion appears.
- The progress rail remains synchronized with the visible percentage.
- The overlay completes around five seconds, scrolling is restored, and the browser console has no new errors.
