function SectionHeading({ index, title, subtitle }) {
  return <div className="section-heading"><div><span className="section-heading__index">{index}</span><h2>{title} <span aria-hidden="true">↘</span></h2></div><p>{subtitle}</p></div>
}

export default SectionHeading
