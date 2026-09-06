import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

const parallax = (element, trigger = element) => gsap.fromTo(element, { yPercent: -3 }, {
  yPercent: 4,
  ease: 'none',
  scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
})

export function usePortfolioAnimations(rootRef, enabled) {
  useLayoutEffect(() => {
    if (!enabled) return undefined
    const root = rootRef.current
    if (!root) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined

    const html = document.documentElement
    const body = document.body
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    }
    let alive = true
    let scrollLocked = false
    let openingFinished = false

    const lockScroll = () => {
      if (scrollLocked) return
      scrollLocked = true
      const gutter = window.innerWidth - html.clientWidth
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      if (gutter > 0) body.style.paddingRight = `${gutter}px`
    }

    const restoreScroll = () => {
      if (!scrollLocked) return
      scrollLocked = false
      html.style.overflow = previous.htmlOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.paddingRight = previous.bodyPaddingRight
    }

    const finishOpening = () => {
      if (openingFinished) return
      openingFinished = true
      root.classList.remove('motion-opening')
      restoreScroll()
      ScrollTrigger.refresh()
    }

    const failSafe = () => {
      root.classList.remove('motion-ready', 'motion-opening')
      restoreScroll()
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
    root.classList.add('motion-ready', 'motion-opening')
    lockScroll()

    const context = gsap.context(() => {}, root)

    try {
      context.add(() => {
        const openingNumbers = gsap.utils.toArray('[data-opening-number]', root)
        const openingProgress = root.querySelector('[data-opening-progress]')
        const introFan = root.querySelector('[data-intro-fan]')
        const introCards = gsap.utils.toArray('[data-intro-card]', root)
        const introFanRect = introFan?.getBoundingClientRect()
        const fanCenter = introFanRect ? introFanRect.left + introFanRect.width / 2 : 0
        const cardOffsets = introCards.map((card) => {
          const rect = card.getBoundingClientRect()
          return fanCenter - (rect.left + rect.width / 2)
        })
        const openingStepTimes = [.72, 1.44, 2.16, 2.92]
        const opening = gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: finishOpening })
        opening
          .set('[data-opening-overlay]', { yPercent: 0, autoAlpha: 1 })
          .set(openingNumbers, { autoAlpha: 0 })
          .set('[data-intro-pill]', { y: 18, autoAlpha: 0 })
          .set('[data-intro-title]', { x: -34, clipPath: 'inset(0 100% 0 0)', autoAlpha: 0 })
          .set('[data-intro-copy]', { y: 22, autoAlpha: 0 })
          .set('[data-intro-scroll]', { y: 16, autoAlpha: 0 })
          .set('[data-opening-header]', { autoAlpha: 0 })

        if (openingNumbers[0]) opening.set(openingNumbers[0], { autoAlpha: 1 }, 0)
        if (openingProgress) opening.set(openingProgress, { scaleX: .1, transformOrigin: 'left center' }, 0)

        openingNumbers.slice(1).forEach((number, index) => {
          const time = openingStepTimes[index]
          const progress = Number(number.textContent.replace('%', '')) / 100
          opening
            .to(openingNumbers[index], { autoAlpha: 0, duration: .08, ease: 'power1.out' }, time)
            .fromTo(number, { autoAlpha: 0 }, { autoAlpha: 1, duration: .08, ease: 'power1.out' }, time)
          if (openingProgress) opening.to(openingProgress, { scaleX: progress, duration: .24, ease: 'power2.out' }, time)
        })

        opening
          .to('[data-opening-loader]', { autoAlpha: 0, y: -24, duration: .35, ease: 'power3.in' }, 3.72)
          .to('[data-opening-overlay]', { yPercent: -100, duration: .52, ease: 'power3.inOut' }, 3.72)
          .to('[data-intro-pill]', { y: 0, autoAlpha: 1, duration: .3 }, 4.22)
          .to('[data-intro-title]', {
            x: 0,
            clipPath: 'inset(0 0% 0 0)',
            autoAlpha: 1,
            duration: .42,
            stagger: .08,
            ease: 'power3.out',
          }, 4.28)
          .to('[data-opening-header]', { autoAlpha: 1, duration: .65 }, 4.22)
          .to('[data-intro-copy]', { y: 0, autoAlpha: 1, duration: .3 }, 4.68)
          .fromTo(introCards, {
            x: (index) => cardOffsets[index],
            y: 72,
            scale: .72,
            autoAlpha: 0,
          }, {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: .55,
            stagger: { each: .05, from: 'center' },
            ease: 'power3.out',
            clearProps: 'transform,opacity,visibility',
          }, 4.94)
          .to('[data-intro-scroll]', { y: 0, autoAlpha: 1, duration: .4 }, 5.16)

        const profile = root.querySelector('[data-motion-section="profile"]')
        if (profile) {
          gsap.timeline({ scrollTrigger: { trigger: profile, start: 'top 78%', once: true } })
            .from(profile.querySelectorAll('[data-profile-title]'), { yPercent: 115, scaleX: .82, transformOrigin: 'left center', duration: 1, stagger: .1, ease: 'power4.out' })
            .from(profile.querySelector('[data-profile-avatar]'), { y: 70, scale: 1.05, filter: 'blur(8px)', clipPath: 'inset(100% 0 0 0)', duration: 1.05, ease: 'power4.out' }, .18)
            .from(profile.querySelectorAll('[data-profile-meta]'), { y: 24, autoAlpha: 0, duration: .68, stagger: .08, ease: 'power3.out' }, .42)
        }

        const about = root.querySelector('[data-motion-section="about"]')
        if (about) {
          gsap.timeline({ scrollTrigger: { trigger: about, start: 'top 82%', once: true } })
            .from('[data-section-title="about"]', { y: 160, scaleX: .8, skewY: 3, transformOrigin: 'left bottom', duration: 1.25, ease: 'power4.out' })
            .from(about.querySelector('[data-reveal-media]'), { y: 45, clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'power4.out' }, .16)
            .from(about.querySelectorAll('[data-stagger-item]'), { y: 38, autoAlpha: 0, duration: .82, stagger: .1, ease: 'power3.out' }, .42)
          about.querySelectorAll('[data-parallax]').forEach((element) => parallax(element, about))
        }

        const capabilities = root.querySelector('[data-motion-section="capabilities"]')
        if (capabilities) {
          gsap.timeline({ scrollTrigger: { trigger: capabilities, start: 'top 82%', once: true } })
            .from('[data-section-title="capabilities"]', { xPercent: -32, scaleX: .78, transformOrigin: 'left center', duration: 1.25, ease: 'power4.out' })
            .from('[data-capability-intro]', { y: 30, autoAlpha: 0, duration: .7, ease: 'power3.out' }, .35)
            .from(capabilities.querySelectorAll('[data-stagger-item]'), { y: 70, autoAlpha: 0, duration: .9, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, .52)
            .from(capabilities.querySelectorAll('[data-capability-line]'), { scaleX: 0, transformOrigin: 'left center', duration: .82, stagger: .1, ease: 'power3.out', clearProps: 'transform' }, .52)
        }

        const projects = root.querySelector('[data-motion-section="projects"]')
        if (projects) {
          gsap.timeline({ scrollTrigger: { trigger: projects, start: 'top 82%', once: true } })
            .from('[data-section-title="projects"]', { y: 130, scale: 1.16, transformOrigin: 'left bottom', duration: 1.3, ease: 'power4.out' })
            .from('[data-project-intro]', { y: 30, autoAlpha: 0, duration: .72, ease: 'power3.out' }, .4)

          projects.querySelectorAll('[data-project-card]').forEach((card) => {
            const art = card.querySelector('[data-reveal-media]')
            const inner = card.querySelector('[data-parallax]')
            gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
              .fromTo(card, { y: 90, autoAlpha: 0, clipPath: 'inset(14% 0 0 0)' }, { y: 0, autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.05, ease: 'power3.out' })
              .from(art, { scale: .96, duration: .8, ease: 'power3.out' }, .15)
              .set(card, { clearProps: 'transform,opacity,visibility,clipPath' })
            if (inner) parallax(inner, card)
          })
        }

        const contact = root.querySelector('[data-motion-section="contact"]')
        if (contact) {
          gsap.timeline({ scrollTrigger: { trigger: contact, start: 'top 78%', once: true } })
            .fromTo('[data-contact-wipe]', { scaleY: 1 }, { scaleY: 0, transformOrigin: 'top center', duration: 1.15, ease: 'power3.inOut' })
            .from('[data-contact-line-inner]', { yPercent: 115, duration: 1.05, stagger: .12, ease: 'power4.out' }, .2)
            .from('[data-contact-intro]', { y: 24, autoAlpha: 0, duration: .65, ease: 'power3.out' }, .48)
            .from(contact.querySelectorAll('[data-stagger-item]'), { y: 22, autoAlpha: 0, duration: .7, stagger: .08, ease: 'power3.out' }, .58)
            .from('[data-contact-arrow]', { rotation: -35, scale: .8, autoAlpha: 0, duration: .85, ease: 'power3.out' }, .64)
        }
      })
    } catch {
      context.revert()
      failSafe()
      return undefined
    }

    const refresh = () => alive && ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh).catch(() => {})
    window.addEventListener('load', refresh, { once: true })

    return () => {
      alive = false
      window.removeEventListener('load', refresh)
      context.revert()
      failSafe()
    }
  }, [rootRef, enabled])
}
