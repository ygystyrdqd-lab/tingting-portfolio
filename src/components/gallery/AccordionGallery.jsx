import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import './AccordionGallery.css'

export default function AccordionGallery({ items, initialIndex = 2 }) {
  const rootRef = useRef(null)
  const frameRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [failedImages, setFailedImages] = useState(() => new Set())
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const safeIndex = Math.min(Math.max(activeIndex, 0), items.length - 1)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tweens = []
    root.querySelectorAll('[data-accordion-panel]').forEach((panel, index) => {
      const active = index === safeIndex
      const copy = panel.querySelector('[data-accordion-copy]')
      if (isDesktop) {
        tweens.push(
          gsap.to(panel, {
            flexGrow: active ? 4.6 : 1,
            duration: reduced ? 0 : .75,
            ease: 'power3.inOut',
            overwrite: true,
          }),
          gsap.to(copy, {
            autoAlpha: active ? 1 : 0,
            y: active ? 0 : 24,
            duration: reduced ? 0 : .48,
            delay: active && !reduced ? .18 : 0,
            ease: 'power3.out',
            overwrite: true,
          }),
        )
      } else {
        gsap.set(panel, { clearProps: 'flexGrow' })
        gsap.set(copy, { clearProps: 'opacity,visibility,transform' })
      }
    })
    return () => tweens.forEach(tween => tween.kill())
  }, [isDesktop, safeIndex])

  const activate = (index) => setActiveIndex(index)

  const handlePointerMove = (event) => {
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return
    const panel = event.currentTarget
    const rect = panel.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - .5) * -20
    const y = ((event.clientY - rect.top) / rect.height - .5) * -20
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = window.requestAnimationFrame(() => {
      panel.style.setProperty('--gallery-art-x', `${x}px`)
      panel.style.setProperty('--gallery-art-y', `${y}px`)
    })
  }

  const resetPointer = (event) => {
    event.currentTarget.style.setProperty('--gallery-art-x', '0px')
    event.currentTarget.style.setProperty('--gallery-art-y', '0px')
  }

  const handleKeyDown = (event, index) => {
    let nextIndex = index
    if (event.key === 'ArrowLeft') nextIndex = Math.max(0, index - 1)
    else if (event.key === 'ArrowRight') nextIndex = Math.min(items.length - 1, index + 1)
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = items.length - 1
    else return
    event.preventDefault()
    setActiveIndex(nextIndex)
    rootRef.current?.querySelectorAll('[data-accordion-panel]')[nextIndex]?.focus()
  }

  return <div ref={rootRef} className="accordion-gallery">
    {items.map((item, index) => <button
      type="button"
      className={`accordion-gallery__panel ${item.className}${index === safeIndex ? ' is-active' : ''}`}
      data-accordion-panel
      aria-label={`${item.title}，${item.subtitle}`}
      aria-pressed={index === safeIndex}
      onPointerEnter={() => activate(index)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onFocus={() => activate(index)}
      onClick={() => activate(index)}
      onKeyDown={(event) => handleKeyDown(event, index)}
      key={item.title}
    >
      <span className="accordion-gallery__index">{String(index + 1).padStart(2, '0')}</span>
      <span className="accordion-gallery__rail-title">{item.title}</span>
      <span className="accordion-gallery__art" data-accordion-art aria-hidden="true">
        <i />
        {item.image && !failedImages.has(index) && <img
          className="accordion-gallery__image"
          src={item.image}
          alt=""
          onError={() => setFailedImages(previous => {
            const next = new Set(previous)
            next.add(index)
            return next
          })}
        />}
      </span>
      <span className="accordion-gallery__scrim" aria-hidden="true" />
      <span className="accordion-gallery__copy" data-accordion-copy>
        <small>{item.subtitle}</small>
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </span>
    </button>)}
  </div>
}
