import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const app = read('src/App.jsx')
const hero = read('src/components/hero/IntroHero.jsx')
const heroCss = read('src/components/hero/IntroHero.css')
const gateCss = read('src/components/mobile/MobileAccessGate.css')

assert(hero.includes('aria-label="Personal Portfolio"'), 'Hero accessible title is missing')
assert(hero.includes('PERSONAL <em>PORTFOLIO</em>'), 'Hero must render the one-line title')
assert(heroCss.includes('@media(min-width:901px)'), 'Wide-screen hero rules are missing')
assert(heroCss.includes('width:213px'), 'Wide-screen fan cards are not enlarged')
assert(app.includes("'(min-width: 768px)'"), 'Desktop breakpoint is missing')
assert(app.includes('return <MobileAccessGate />'), 'Mobile gate branch is missing')
assert(gateCss.includes('@media(min-width:768px)'), 'Gate visibility breakpoint is missing')

console.log('Desktop hero and mobile access gate verified')
