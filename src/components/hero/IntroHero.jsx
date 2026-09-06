import { ArrowDown } from 'lucide-react'
import './IntroHero.css'

const introCards = [
  { number: '01', title: 'Brand System', label: '品牌视觉', tone: 'brand', image: '/intro-cards/intro-card-01.webp', alt: 'AOC K1S Ultra 投影仪视觉作品' },
  { number: '02', title: 'Campaign', label: '活动视觉', tone: 'campaign', image: '/intro-cards/intro-card-02.webp', alt: '无线耳机产品视觉作品' },
  { number: '03', title: 'Visual Direction', label: '视觉创意', tone: 'visual', image: '/intro-cards/intro-card-03.webp', alt: 'Medical Cold Paste 面膜包装视觉作品' },
  { number: '04', title: '3D & AIGC', label: '三维实验', tone: 'aigc', image: '/intro-cards/intro-card-04.webp', alt: 'Eternal Cell 精华液视觉作品' },
  { number: '05', title: 'Packaging', label: '包装延展', tone: 'packaging', image: '/intro-cards/intro-card-05.webp', alt: 'Rhea 修复霜产品视觉作品' },
]

export default function IntroHero() {
  return <section className="intro-hero" id="home" data-intro-hero>
    <div className="intro-hero__aurora" aria-hidden="true"><i /><i /><i /></div>
    <div className="intro-hero__grain" aria-hidden="true" />
    <div className="intro-hero__content">
      <p className="intro-hero__pill" data-intro-pill><i /> VISUAL DESIGNER · CREATIVE MAKER</p>
      <h1 className="intro-hero__title" aria-label="Designing Visual Experiences">
        <span className="intro-hero__title-line"><span data-intro-title>Designing</span></span>
        <span className="intro-hero__title-line"><span data-intro-title>Visual <em>Experiences</em></span></span>
      </h1>
      <p className="intro-hero__copy" data-intro-copy>用策略、审美与新技术，创造清晰而有记忆点的视觉体验。</p>
      <div className="intro-fan" data-intro-fan>
        {introCards.map((card, index) => <div className={`intro-fan__slot intro-fan__slot--${index + 1}`} key={card.number}>
          <article className={`intro-card intro-card--${card.tone}`} data-intro-card>
            <span className="intro-card__number">{card.number}</span>
            <div className="intro-card__art">
              <img
                src={card.image}
                alt={card.alt}
                loading="eager"
                decoding="async"
                fetchPriority={index === 2 ? 'high' : 'auto'}
              />
            </div>
            <div className="intro-card__label"><small>{card.label}</small><strong>{card.title}</strong></div>
          </article>
        </div>)}
      </div>
    </div>
    <a className="intro-hero__scroll" href="#profile" data-intro-scroll>SCROLL TO PROFILE <ArrowDown size={16} /></a>
  </section>
}
