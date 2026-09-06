import { navigation } from '../data/portfolio'

function Header({ activeSection, isScrolled }) {
  return (
    <header className={`site-header${isScrolled ? ' site-header--scrolled' : ''}`}>
      <a className="brand" href="#home" aria-label="返回首页"><span className="brand__mark">LT°</span><span className="brand__name">LIAO TINGTING</span></a>
      <nav className="site-nav" aria-label="主导航">
        {navigation.map((item) => <a key={item.section} className={activeSection === item.section ? 'is-active' : ''} href={item.href}>{item.label}</a>)}
      </nav>
      <a className="header-contact" href="#contact">联系我 <span aria-hidden="true">↗</span></a>
    </header>
  )
}

export default Header
