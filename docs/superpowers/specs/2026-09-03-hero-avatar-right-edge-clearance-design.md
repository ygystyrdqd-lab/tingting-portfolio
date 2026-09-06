# Hero Avatar Right-Edge Clearance Design

## Goal

Remove the visible hard-cut impression around the avatar's right sleeve on non-phone layouts while preserving the large waist-up portrait, the layered title composition, and the existing opening animation.

## Scope

- Applies to the homepage Hero avatar at viewport widths of `621px` and above.
- Keeps the current `145%` portrait height and top alignment.
- Keeps the phone layout at `620px` and below unchanged.
- Does not alter the source image, title typography, Hero column proportions, or GSAP timing.

## Design

The avatar will retain the existing dynamic right-edge anchoring, but its required right-side clearance will increase from `40px` to `80px`. This moves the portrait approximately `40–50px` further left at the current desktop preview width and creates visible breathing room around the transparent sleeve edge.

Pointer parallax will remain active. Its horizontal movement will be clamped so that positive pointer movement cannot reduce the `80px` right-side clearance. Vertical movement and rotation remain unchanged. The avatar stage remains overflow-visible, and its clip polygon must continue to extend beyond the content box so the sleeve is not cut by an internal stage boundary.

No gradient fade will be applied to the person. The garment edge must remain sharp and fully visible rather than being hidden with a mask.

## Behavior by Breakpoint

- `>= 621px`: preserve the `145%` portrait scale, maintain at least `80px` of viewport clearance to the image canvas, and clamp rightward parallax.
- `<= 620px`: retain the current mobile crop, scale, and motion behavior.

## Verification

- At the current PC preview size, the right sleeve and trailing transparent garment have visible space before the viewport edge.
- Moving the pointer to the right side does not create a hard cut or allow the garment to touch the viewport boundary.
- The portrait remains a large waist-up feature and is not reduced in scale.
- `HI, I'M` and `TINGTING.` remain in their current positions.
- The opening animation completes without a visible horizontal jump.
- Lint and production build complete without new errors.

