import SectionHeading from './SectionHeading'
import { strengths } from '../data/portfolio'

function Strengths() {
  return <section className="section section--strengths" id="strengths"><div className="shell"><SectionHeading index="03 / 04" title="WHY ME" subtitle="个人优势 / CORE STRENGTHS" /><div className="strengths-grid">{strengths.map((strength) => <article className="strength-card" key={strength.number}><span className="strength-card__number">{strength.number}</span><div><h3>{strength.title}</h3><p>{strength.text}</p></div><span className="strength-card__line" aria-hidden="true" /></article>)}</div></div></section>
}

export default Strengths
