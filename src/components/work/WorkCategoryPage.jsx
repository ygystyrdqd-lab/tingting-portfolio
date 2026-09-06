import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useWorkDetailAnimations } from '../../hooks/useWorkDetailAnimations'
import { assetUrl } from '../../lib/assetUrl'
import MediaViewer from './MediaViewer'
import './work-detail.css'

const formatProjectNumber = (index) => String(index + 1).padStart(2, '0')

export default function WorkCategoryPage({ category, onBack }) {
  const [selectedProject, setSelectedProject] = useState(null)
  const pageRef = useRef(null)
  const closeViewer = useCallback(() => setSelectedProject(null), [])
  useLayoutEffect(() => {
    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    scrollToTop()
    const frame = window.requestAnimationFrame(scrollToTop)
    return () => window.cancelAnimationFrame(frame)
  }, [category?.slug])
  useWorkDetailAnimations(pageRef, category?.slug)

  if (!category) {
    return <main className="work-detail work-detail-invalid">
      <div className="work-detail-shell invalid-content">
        <span>404 / CATEGORY NOT FOUND</span>
        <h1>这个作品分类<br />暂时不存在。</h1>
        <button type="button" onClick={onBack}><ArrowLeft /> 返回作品</button>
      </div>
    </main>
  }

  const projectLayout = category.projects.length === 1
    ? 'single'
    : category.projects.length === 2
      ? 'pair'
      : 'featured'

  return <>
    <main
      ref={pageRef}
      className="work-detail"
      style={{
        '--category-accent': category.theme.accent,
        '--category-glow': category.theme.glow,
      }}
    >
      <header className="work-detail-nav">
        <a className="work-detail-brand" href={assetUrl('#home')} aria-label="返回网站首页"><span>LT</span><i /></a>
        <button type="button" onClick={onBack}><ArrowLeft size={16} /> 返回作品</button>
        <a href="mailto:806779987@qq.com">联系我 <ArrowUpRight size={15} /></a>
      </header>

      <section className="work-detail-hero work-detail-shell">
        <p className="work-detail-en" data-detail-eyebrow>{category.en}</p>
        <h1 data-detail-title>{category.title}</h1>
        <div className="work-detail-summary" data-detail-summary><p>{category.description}</p><span>SCROLL TO VIEW PROJECTS ↓</span></div>
      </section>

      <section className={`work-projects work-detail-shell layout-${projectLayout}`} aria-label={`${category.title}项目列表`}>
        {category.projects.map((project, index) => <button
          className="work-project-card"
          type="button"
          key={project.id}
          onClick={() => setSelectedProject({ ...project, number: formatProjectNumber(index) })}
          aria-label={`查看项目：${project.title}`}
          data-detail-card
        >
          <div className="work-project-meta"><span>{formatProjectNumber(index)}</span><span>{project.meta}</span></div>
          <div className={`work-project-art${project.cover ? ' has-cover' : ''}`} data-parallax aria-hidden="true">
            {project.cover
              ? <img src={project.cover} alt="" loading="eager" decoding="async" />
              : <><i /><i /><i /></>}
            <span>PROJECT PREVIEW</span>
          </div>
          <div className="work-project-footer"><h2>{project.title}</h2><span><ArrowUpRight /></span></div>
          <em>{formatProjectNumber(index)}</em>
        </button>)}
      </section>

      <footer className="work-detail-footer work-detail-shell"><span>LIAO TINGTING · VISUAL DESIGNER</span><button type="button" onClick={onBack}>BACK TO WORK ↑</button></footer>
    </main>
    <MediaViewer project={selectedProject} onClose={closeViewer} />
  </>
}
