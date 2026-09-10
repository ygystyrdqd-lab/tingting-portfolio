import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Mail, Menu, X } from 'lucide-react'
import SpotlightCard from './components/effects/SpotlightCard'
import IntroHero from './components/hero/IntroHero'
import MobileAccessGate from './components/mobile/MobileAccessGate'
import OpeningOverlay from './components/motion/OpeningOverlay'
import CapabilityLink from './components/work/CapabilityLink'
import WorkCategoryPage from './components/work/WorkCategoryPage'
import { featuredWorkCategories, getWorkCategory, workCategories } from './data/workCategories'
import { assetUrl } from './lib/assetUrl'
import { usePortfolioAnimations } from './hooks/usePortfolioAnimations'
import './App.css'

const navItems = [['首页', 'home'], ['关于', 'about'], ['作品', 'capabilities'], ['项目', 'projects']]
const projectClasses = ['project-one', 'project-two', 'project-three']
const desktopMedia = '(min-width: 768px)'

function AmbientBackground() {
  return <div className="site-ambient" aria-hidden="true"><i className="ambient-gold" /><i className="ambient-wine" /></div>
}

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <header className={`header ${scrolled ? 'is-scrolled' : ''}`} data-opening-header>
    <a className="brand" href={assetUrl('#home')} aria-label="返回首页"><span>LT</span><i /></a>
    <nav className={`nav ${open ? 'is-open' : ''}`} aria-label="主导航">
      {navItems.map(([label, id]) => <a key={id} href={assetUrl(`#${id}`)} onClick={() => setOpen(false)}>{label}</a>)}
    </nav>
    <a className="contact-pill" href="mailto:806779987@qq.com">联系我 <ArrowUpRight size={15} /></a>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-label="切换导航">{open ? <X /> : <Menu />}</button>
  </header>
}

function GridField() { return <div className="grid-stage" aria-hidden="true"><div className="moving-grid" /><div className="grid-fade" /></div> }

function ParticleField() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, index) => ({ id: index, '--left': `${8 + ((index * 17) % 84)}%`, '--top': `${10 + ((index * 29) % 70)}%`, '--delay': `${(index % 7) * -.6}s` })), [])
  return <div className="particles" aria-hidden="true">{particles.map((particle) => <i key={particle.id} style={particle} />)}</div>
}

function HeroAvatar() {
  const avatarRef = useRef(null)
  const avatarImageRef = useRef(null)
  const frameRef = useRef(0)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), [])

  useEffect(() => {
    const avatar = avatarRef.current
    const image = avatarImageRef.current
    if (!avatar || !image) return undefined

    const desktopQuery = window.matchMedia('(min-width: 621px)')
    let safeFrame = 0
    let settleTimer = 0
    const updateSafePosition = () => {
      window.cancelAnimationFrame(safeFrame)
      safeFrame = window.requestAnimationFrame(() => {
        if (!desktopQuery.matches) {
          image.style.setProperty('--avatar-safe-x', '0px')
          return
        }
        const inlineTransition = image.style.transition
        image.style.transition = 'none'
        image.style.setProperty('--avatar-safe-x', '0px')
        const overflow = Math.max(0, image.getBoundingClientRect().right - (window.innerWidth - 80))
        image.style.setProperty('--avatar-safe-x', `${-Math.ceil(overflow)}px`)
        image.getBoundingClientRect()
        image.style.transition = inlineTransition
      })
    }

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateSafePosition)
    resizeObserver?.observe(avatar)
    image.addEventListener('load', updateSafePosition)
    window.addEventListener('resize', updateSafePosition, { passive: true })
    desktopQuery.addEventListener?.('change', updateSafePosition)
    if (image.complete) updateSafePosition()
    settleTimer = window.setTimeout(updateSafePosition, 3100)

    return () => {
      window.cancelAnimationFrame(safeFrame)
      window.clearTimeout(settleTimer)
      resizeObserver?.disconnect()
      image.removeEventListener('load', updateSafePosition)
      window.removeEventListener('resize', updateSafePosition)
      desktopQuery.removeEventListener?.('change', updateSafePosition)
    }
  }, [imageFailed])

  const handlePointerMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return
    const node = avatarRef.current
    if (!node) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = window.requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2
      const hero = node.closest('.hero')
      const avatarX = Math.min(x * 7, 0)
      node.style.setProperty('--avatar-x', `${avatarX}px`)
      node.style.setProperty('--avatar-y', `${y * 5}px`)
      node.style.setProperty('--avatar-rx', `${y * -1.2}deg`)
      node.style.setProperty('--avatar-ry', `${x * 1.5}deg`)
      node.style.setProperty('--decor-x', `${x * -5}px`)
      node.style.setProperty('--decor-y', `${y * -4}px`)
      hero?.style.setProperty('--hero-x', `${x * 7}px`)
      hero?.style.setProperty('--hero-y', `${y * 5}px`)
    })
  }

  const resetPointer = () => {
    const node = avatarRef.current
    if (!node) return
    const hero = node.closest('.hero')
    node.style.setProperty('--avatar-x', '0px')
    node.style.setProperty('--avatar-y', '0px')
    node.style.setProperty('--avatar-rx', '0deg')
    node.style.setProperty('--avatar-ry', '0deg')
    node.style.setProperty('--decor-x', '0px')
    node.style.setProperty('--decor-y', '0px')
    hero?.style.setProperty('--hero-x', '0px')
    hero?.style.setProperty('--hero-y', '0px')
  }

  return <div ref={avatarRef} className="hero-avatar" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
    <div className="avatar-opening-layer" data-profile-avatar>
      <ParticleField />
      <div className="avatar-aura" aria-hidden="true" />
      <div className="avatar-orbits" aria-hidden="true"><i /><i /><span>PERSONAL / 3D</span></div>
      <div className="avatar-stage">
        {imageFailed ? <div className="avatar-fallback" aria-label="个人3D形象暂不可用">LT</div> : <img ref={avatarImageRef} src={assetUrl('hero-avatar-closeup.png')} alt="廖婷婷的个人3D半身形象" onError={() => setImageFailed(true)} />}
      </div>
      <div className="avatar-ground" aria-hidden="true" />
      <div className="avatar-caption"><span>PERSONAL DIGITAL TWIN</span><span>HOVER TO INTERACT</span></div>
    </div>
  </div>
}

function Hero() {
  return <section className="hero hero-closeup" id="profile" data-motion-section="profile"><GridField /><div className="hero-facets" aria-hidden="true"><i /><i /><i /></div><div className="hero-grain" aria-hidden="true" /><div className="hero-halo" aria-hidden="true" />
    <div className="hero-shell hero-shell-layered"><div className="hero-heading hero-heading-layered">
      <p className="eyebrow" data-profile-meta><span /> VISUAL DESIGNER · SHENZHEN</p>
      <h1 className="hero-title-back" aria-label="Hi, I'm Tingting"><span className="opening-title-clip"><span data-profile-title>HI, I&apos;M</span></span></h1>
      <div className="hero-note" data-profile-meta><span>廖婷婷 / 视觉设计师</span><p>用策略、审美与新技术<br />创造清晰而有记忆点的视觉体验。</p></div>
    </div><HeroAvatar /><div className="hero-title-front" aria-hidden="true"><span className="opening-title-clip"><span data-profile-title>TINGTING<span className="hero-title-dot">.</span></span></span></div><div className="hero-side-tag" data-profile-meta><i /> PERSONAL · 3D AVATAR</div></div>
    <a className="scroll-cue" href="#about" data-profile-meta><span>SCROLL TO EXPLORE</span><ArrowDown size={17} /></a>
  </section>
}

function About() { return <section className="about section-dark" id="about" data-motion-section="about"><div className="section-shell">
  <div className="section-kicker"><span>( 01 )</span><span>ABOUT ME</span><span>SHENZHEN · CHINA</span></div>
  <h2 data-section-title="about">ABOUT<br /><em>ME</em></h2>
  <div className="about-grid"><div className="about-portrait-card" data-reveal-media><div className="portrait-orbit" aria-hidden="true" /><div className="about-portrait-parallax" data-parallax><img className="about-portrait-image" src={assetUrl('about-portrait.png')} alt="廖婷婷的个人3D形象" /></div><span className="portrait-label">PERSONAL PORTRAIT / 3D</span></div>
    <div className="about-copy" data-stagger-group><p className="about-lead" data-stagger-item>我是一名拥有 <strong>10 年</strong>商业设计经验的视觉设计师，关注品牌与内容如何在不同媒介中保持统一、清晰并产生情绪。</p>
      <p data-stagger-item>从品牌视觉、电商营销到三维与 AIGC，我习惯把审美判断、业务目标和执行效率放在同一个设计系统里思考。</p>
      <div className="about-facts"><div data-stagger-item><span>EXPERIENCE</span><strong>10 YEARS</strong></div><div data-stagger-item><span>EDUCATION</span><strong>BACHELOR</strong></div><div data-stagger-item><span>BASE</span><strong>SHENZHEN</strong></div><div data-stagger-item><span>EMAIL</span><a href="mailto:806779987@qq.com">806779987@qq.com</a></div></div>
    </div></div>
</div></section> }

function Capabilities({ onOpenCategory }) { return <section className="capabilities" id="capabilities" data-motion-section="capabilities"><div className="section-shell">
  <div className="section-kicker dark-text"><span>( 02 )</span><span>WHAT I DO</span><span>SELECTED SKILLS</span></div>
  <div className="capability-intro"><h2 data-section-title="capabilities">SELECTED<br />WORKS</h2><p data-capability-intro>从策略到落地，建立兼顾品牌一致性与传播效率的视觉表达。</p></div>
  <div className="capability-list">{workCategories.map((category) => <CapabilityLink category={category} onOpen={onOpenCategory} key={category.slug} />)}</div>
</div></section> }

function Projects({ onOpenCategory }) {
  const handleOpen = (event, slug) => {
    event.preventDefault()
    onOpenCategory(slug)
  }

  return <section className="projects" id="projects" data-motion-section="projects"><div className="section-shell projects-heading">
  <div className="section-kicker"><span>( 03 )</span><span>SELECTED WORK</span><span>2024 — 2026</span></div><h2 data-section-title="projects">PROJECTS<span>.</span></h2>
  <p data-project-intro>当前使用概念视觉占位，后续替换为真实项目封面与案例内容。</p></div>
  <div className="project-stack section-shell">{featuredWorkCategories.map((project, index) => <SpotlightCard as="a" className={`project-card ${projectClasses[index]}`} data-project-card href={`?category=${project.slug}`} onClick={(event) => handleOpen(event, project.slug)} aria-label={`查看${project.title}项目`} key={project.slug} style={{ '--index': index }}>
    <div className="project-meta"><span>{project.number}</span><span>{project.projects[0].meta}</span></div><div className={`project-art${project.projects[0].cover ? ' has-cover' : ''}`} data-reveal-media><div className="project-art-inner" data-parallax>{project.projects[0].cover ? <img src={project.projects[0].cover} alt="" loading="lazy" decoding="async" /> : <><div className="shape shape-one" /><div className="shape shape-two" /><div className="shape shape-three" /></>}</div><span>PROJECT PREVIEW</span></div>
    <div className="project-footer"><h3>{project.title}</h3><span aria-hidden="true"><ArrowUpRight /></span></div>
  </SpotlightCard>)}</div>
</section> }

function Contact() { return <footer className="contact" id="contact" data-motion-section="contact"><i className="contact-motion-wipe" data-contact-wipe aria-hidden="true" /><div className="contact-top"><span data-stagger-item>AVAILABLE FOR SELECTED PROJECTS</span><span data-stagger-item>© 2026</span></div>
  <div className="contact-center"><p data-contact-intro>有一个想法，或一个值得被看见的项目？</p><a href="mailto:806779987@qq.com" data-section-title="contact"><span className="contact-line"><span data-contact-line-inner>LET&apos;S</span></span><span className="contact-line"><em><span data-contact-line-inner>TALK</span></em></span><span className="contact-arrow" data-contact-arrow><ArrowUpRight /></span></a></div>
  <div className="contact-bottom"><span data-stagger-item>LIAO TINGTING · VISUAL DESIGNER</span><a href="mailto:806779987@qq.com" data-stagger-item><Mail size={16} /> 806779987@qq.com</a><a href="#home" data-stagger-item>BACK TO TOP ↑</a></div>
</footer> }

const readCategorySlug = () => new URLSearchParams(window.location.search).get('category')

export default function App() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(desktopMedia).matches)
  const [categorySlug, setCategorySlug] = useState(readCategorySlug)
  const [suppressHomeOpening, setSuppressHomeOpening] = useState(false)
  const mainPageRef = useRef(null)
  const shouldAnimateHome = categorySlug === null && !suppressHomeOpening
  usePortfolioAnimations(mainPageRef, shouldAnimateHome && isDesktop)

  useEffect(() => {
    const query = window.matchMedia(desktopMedia)
    const syncViewport = () => setIsDesktop(query.matches)
    syncViewport()
    query.addEventListener('change', syncViewport)
    return () => query.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      setSuppressHomeOpening(false)
      setCategorySlug(readCategorySlug())
    }
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    if (categorySlug !== null || !suppressHomeOpening) return undefined
    const frame = window.requestAnimationFrame(() => {
      const targetId = window.location.hash.slice(1) || 'capabilities'
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [categorySlug, suppressHomeOpening])

  const openCategory = (slug) => {
    const url = new URL(window.location.href)
    url.searchParams.set('category', slug)
    url.hash = ''
    window.history.pushState({}, '', url)
    setSuppressHomeOpening(false)
    setCategorySlug(slug)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const closeCategory = () => {
    const url = new URL(window.location.href)
    const isFeaturedCategory = featuredWorkCategories.some(({ slug }) => slug === categorySlug)
    setSuppressHomeOpening(true)
    url.searchParams.delete('category')
    url.hash = isFeaturedCategory ? 'projects' : 'capabilities'
    window.history.pushState({}, '', url)
    setCategorySlug(null)
  }

  if (!isDesktop) return <MobileAccessGate />

  if (categorySlug !== null) return <><AmbientBackground /><WorkCategoryPage key={categorySlug} category={getWorkCategory(categorySlug)} onBack={closeCategory} /></>

  return <div className="portfolio-page" ref={mainPageRef}><OpeningOverlay /><AmbientBackground /><Header /><main><IntroHero /><Hero /><About /><Capabilities onOpenCategory={openCategory} /><Projects onOpenCategory={openCategory} /></main><Contact /></div>
}
