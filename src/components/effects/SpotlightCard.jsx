import { useEffect, useRef } from 'react'

export default function SpotlightCard({ as: Component = 'article', className = '', style, children, onPointerMove, ...props }) {
  const cardRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), [])

  const handlePointerMove = (event) => {
    onPointerMove?.(event)
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return
    const card = cardRef.current
    if (!card) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = window.requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect()
      card.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`)
      card.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`)
    })
  }

  return <Component ref={cardRef} className={className} style={style} onPointerMove={handlePointerMove} {...props}>
    <span className="spotlight-card-glow" aria-hidden="true" />
    {children}
  </Component>
}
