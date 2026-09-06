function Hero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero__ambient" aria-hidden="true"><span className="hero__orb hero__orb--one" /><span className="hero__orb hero__orb--two" /><span className="hero__grid" /></div>
      <div className="hero__content shell">
        <div className="hero__eyebrow"><span>VISUAL DESIGNER</span><span>SHENZHEN · CHINA</span></div>
        <div className="hero__title-wrap"><h1 id="hero-title">VISUALS<br />WITH <em>IMPACT.</em></h1><p>用体系化设计与 AIGC，让商业创意更准确、更高效。</p></div>
        <div className="hero__bottom">
          <div className="hero__index" aria-label="作品类别预览">{['BRAND', 'E-COMMERCE', 'PACKAGING', 'AIGC'].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div>
          <a href="#works" className="scroll-cue">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  )
}

export default Hero
