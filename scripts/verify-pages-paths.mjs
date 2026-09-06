import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const vite = read('vite.config.js')
const helper = read('src/lib/assetUrl.js')
const app = read('src/App.jsx')
const workPage = read('src/components/work/WorkCategoryPage.jsx')
const data = read('src/data/workCategories.js')

assert(vite.includes("base: process.env.GITHUB_ACTIONS ? '/tingting-portfolio/' : '/'"), 'Vite Pages base is missing')
assert(helper.includes('import.meta.env.BASE_URL'), 'assetUrl must use Vite BASE_URL')
assert(helper.includes("/^https?:\\/\\//.test(path)"), 'assetUrl must preserve hosted media URLs')
assert(helper.includes("path.replace(/^\\/+/, '')"), 'assetUrl must normalize leading slashes')

for (const [name, source] of [['App.jsx', app], ['WorkCategoryPage.jsx', workPage]]) {
  assert(!/["']\/(?:work\/|hero-|about-)/.test(source), `${name} still contains a root media URL`)
  assert(!/["']\/#/.test(source), `${name} still contains a root fragment URL`)
}

assert(data.includes('resolveCategoryAssets'), 'work category media is not normalized through assetUrl')
assert(data.includes('src: assetUrl(item.src)'), 'work category media src is not Pages-aware')
assert(data.includes('poster: assetUrl(item.poster)'), 'work category video posters are not Pages-aware')
assert(data.includes('releases/download/media-v1/aigc-video-01.mp4'), 'First large video must use hosted media')
assert(data.includes('releases/download/media-v1/aigc-video-02.mp4'), 'Second large video must use hosted media')

console.log('GitHub Pages asset paths verified')
