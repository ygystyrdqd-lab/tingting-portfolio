import SectionHeading from './SectionHeading'
import { skills } from '../data/portfolio'

function About() {
  return (
    <section className="section section--about" id="about"><div className="shell">
      <SectionHeading index="02 / 04" title="WORK EXPERIENCE" subtitle="个人经历 / ABOUT ME" />
      <div className="about-grid"><div className="portrait-placeholder" aria-label="人物图片占位区域"><span className="portrait-placeholder__label">PORTRAIT PLACEHOLDER</span><span className="portrait-placeholder__figure" aria-hidden="true" /><span className="experience-pill">10 YEARS</span></div><div className="about-copy"><span className="kicker">ABOUT ME</span><h3>Hi, I am Tingting.</h3><p className="about-copy__lead">平面设计专业本科，拥有 10 年一线商业设计经验。擅长把控品牌整体视觉，将 AIGC 与传统设计流程融合，在创意质量与产出效率之间取得平衡。</p><dl className="stats"><div><dt>10+</dt><dd>年商业设计经验</dd></div><div><dt>6+</dt><dd>核心专业方向</dd></div><div><dt>∞</dt><dd>持续探索能力</dd></div></dl><div className="skills" aria-label="专业能力标签">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></div>
      <div className="career-path"><div className="career-path__heading"><span>CAREER PATH</span><span>经历信息待补充</span></div><div className="career-path__line" aria-hidden="true"><i /><i /><i /></div><div className="career-path__items"><span>视觉设计实践</span><span>品牌与商业项目</span><span>AIGC 创意融合</span></div></div>
    </div></section>
  )
}

export default About
