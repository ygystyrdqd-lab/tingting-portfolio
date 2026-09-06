import SectionHeading from './SectionHeading'
import { projects } from '../data/portfolio'

function SelectedWorks() {
  return <section className="section section--works" id="works"><div className="shell"><SectionHeading index="01 / 04" title="SELECTED WORKS" subtitle="精选项目 / CONTENT COMING SOON" /><div className="projects-grid">{projects.map((project) => <article className={`project-card ${project.size}`} key={project.number}><div className="project-card__visual" aria-hidden="true"><span className="project-card__cross" /><span className="project-card__code">PROJECT_{project.number}</span></div><span className="project-card__number">{project.number}</span><div className="project-card__meta"><h3>{project.title}</h3><p>{project.category}</p></div><span className="project-card__arrow" aria-hidden="true">↗</span></article>)}</div></div></section>
}

export default SelectedWorks
