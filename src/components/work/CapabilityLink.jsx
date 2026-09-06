import { ArrowUpRight } from 'lucide-react'

export default function CapabilityLink({ category, onOpen }) {
  const updatePointer = (event) => {
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
  }

  const handleClick = (event) => {
    event.preventDefault()
    onOpen(category.slug)
  }

  return <a
    className={`capability-item capability-link capability-${category.slug}`}
    href={`?category=${category.slug}`}
    onClick={handleClick}
    onPointerMove={updatePointer}
    aria-label={`查看${category.title}作品`}
    data-stagger-item
  >
    <span>{category.number}</span>
    <h3>{category.title}</h3>
    <em>{category.en}</em>
    <ArrowUpRight />
    <i className="capability-line" data-capability-line aria-hidden="true" />
  </a>
}
