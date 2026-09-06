import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useWorkDetailAnimations(rootRef, categorySlug) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!categorySlug || !root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let alive = true
    const context = gsap.context(() => {}, root)

    try {
      context.add(() => {
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .from('[data-detail-eyebrow]', { y: -36, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)', duration: .8 })
          .from('[data-detail-title]', { y: -120, scaleX: .8, transformOrigin: 'left center', letterSpacing: '-.09em', clipPath: 'inset(0 0 100% 0)', duration: 1.15 }, .12)
          .from('[data-detail-summary] > *', { y: -35, autoAlpha: 0, duration: .75, stagger: .1 }, .72)

        const cards = gsap.utils.toArray('[data-detail-card]')
        gsap.set(cards, { y: -90, autoAlpha: 0, clipPath: 'inset(0 0 12% 0)' })
        ScrollTrigger.batch(cards, {
          start: 'top 84%',
          once: true,
          onEnter: (batch) => gsap.to(batch, {
              y: 0,
              autoAlpha: 1,
              clipPath: 'inset(0% 0 0 0)',
              duration: 1.05,
              stagger: .14,
              ease: 'power3.out',
              onComplete: () => gsap.set(batch, { clearProps: 'transform,opacity,visibility,clipPath' }),
            }),
        })

        gsap.utils.toArray('[data-parallax]').forEach((element) => {
          gsap.fromTo(element, { yPercent: -3 }, {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
          })
        })
      })
    } catch {
      context.revert()
      return undefined
    }

    const refresh = () => alive && ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh).catch(() => {})

    return () => {
      alive = false
      context.revert()
    }
  }, [rootRef, categorySlug])
}
