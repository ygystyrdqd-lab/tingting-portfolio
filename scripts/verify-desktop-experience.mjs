import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const app = read('src/App.jsx')
const appCss = read('src/App.css')
const hero = read('src/components/hero/IntroHero.jsx')
const heroCss = read('src/components/hero/IntroHero.css')
const gateCss = read('src/components/mobile/MobileAccessGate.css')
const mediaViewer = read('src/components/work/MediaViewer.jsx')

assert(hero.includes('aria-label="Personal Portfolio"'), 'Hero accessible title is missing')
assert(hero.includes('PERSONAL <em>PORTFOLIO</em>'), 'Hero must render the one-line title')
assert(heroCss.includes('@media(min-width:901px)'), 'Wide-screen hero rules are missing')
assert(heroCss.includes('width:213px'), 'Wide-screen fan cards are not enlarged')
assert(app.includes("'(min-width: 768px)'"), 'Desktop breakpoint is missing')
assert(app.includes('return <MobileAccessGate />'), 'Mobile gate branch is missing')
assert(gateCss.includes('@media(min-width:768px)'), 'Gate visibility breakpoint is missing')
assert(app.includes("import MediaViewer from './components/work/MediaViewer'"), 'Projects must reuse MediaViewer')
assert(app.includes('<SpotlightCard as="button"'), 'Featured project cards must be semantic buttons')
assert(app.includes('<MediaViewer project={selectedProject}'), 'Projects must render the selected project in MediaViewer')
assert(!app.includes('href={`?category=${project.slug}`}'), 'Featured project cards must not navigate to category pages')
assert(mediaViewer.includes("import { createPortal } from 'react-dom'"), 'MediaViewer must import createPortal')
assert(mediaViewer.includes('</div>, document.body)'), 'MediaViewer must render through a document.body portal')
assert(app.includes('className="editorial-title editorial-title-about"'), 'About editorial title is missing')
assert(app.includes('className="editorial-title editorial-title-works"'), 'Works editorial title is missing')
assert(app.includes('className="editorial-title editorial-title-projects"'), 'Projects editorial title is missing')
assert(!app.includes('editorial-title-ghost'), 'Projects ghost title must be removed')
assert((app.match(/className="editorial-title-period"/g) ?? []).length === 3, 'Each title needs one champagne period')
assert(appCss.includes('clamp(82px,10.2vw,132px)'), 'Section titles must share one display scale')
assert(appCss.includes('.editorial-title{'), 'Shared editorial title styles are missing')
assert(appCss.includes('.editorial-title-about'), 'About title composition styles are missing')
assert(appCss.includes('.editorial-title-works'), 'Works title composition styles are missing')
assert(appCss.includes('.editorial-title-projects'), 'Projects title composition styles are missing')

console.log('Desktop hero and mobile access gate verified')
