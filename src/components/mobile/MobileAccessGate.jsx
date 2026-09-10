import './MobileAccessGate.css'

export default function MobileAccessGate() {
  return <main className="mobile-access-gate" role="status">
    <div className="mobile-access-gate__grid" aria-hidden="true" />
    <div className="mobile-access-gate__content">
      <div className="mobile-access-gate__brand"><span>LT</span><i /></div>
      <p className="mobile-access-gate__eyebrow"><i /> DESKTOP EXPERIENCE</p>
      <h1>请使用<br /><em>电脑端访问</em></h1>
      <p>为呈现完整的作品细节与动态体验，<br />请在电脑浏览器中打开本网站。</p>
      <small>PERSONAL PORTFOLIO · 2026</small>
    </div>
  </main>
}
