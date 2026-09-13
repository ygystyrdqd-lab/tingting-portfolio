import { readFileSync, statSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const app = read('src/App.jsx')
const css = read('src/App.css')
const portrait = new URL('../public/about-portrait-user.png', import.meta.url)
const portraitBuffer = readFileSync(portrait)
const portraitHeight = portraitBuffer.readUInt32BE(20)
const portraitColorType = portraitBuffer[25]

assert(app.includes('InteractiveAboutPortrait'), 'Interactive portrait component is missing')
assert(app.includes("assetUrl('about-portrait-user.png')"), 'User-supplied portrait asset is not connected')
assert(app.includes('onPointerMove'), 'Pointer tracking is missing')
assert(app.includes('is-fingertip-contact'), 'Fingertip contact state is missing')
assert(css.includes('.about-fingertip-ripple'), 'Ripple styling is missing')
assert(css.includes('@media (hover:hover) and (pointer:fine)'), 'Fine pointer guard is missing')
assert(css.includes('@media(prefers-reduced-motion:reduce)'), 'Reduced-motion path is missing')
assert(statSync(portrait).size > 250_000, 'Refined portrait asset is unexpectedly small')
assert(portraitHeight >= 1_400, 'User-supplied portrait must be at least 1400px tall')
assert([4, 6].includes(portraitColorType), 'Refined portrait must retain a PNG alpha channel')

console.log('About portrait fingertip interaction verified')
