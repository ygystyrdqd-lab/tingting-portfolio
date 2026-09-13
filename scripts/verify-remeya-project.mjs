import { readFileSync, statSync } from 'node:fs'

const data = readFileSync(new URL('../src/data/workCategories.js', import.meta.url), 'utf8')
const featured = data.split('const rawFeaturedWorkCategories = [')[1]?.split('const resolveCategoryAssets')[0] ?? ''
const cream = featured.split("slug: 'aigc-workflow'")[1] ?? ''
const assert = (value, message) => { if (!value) throw new Error(message) }

assert(cream.includes("title: '瑞美亚面霜广告'"), 'Cream title missing')
assert(cream.includes("cover: '/work/remeya-cream/cover.jpg'"), 'Cream cover missing')
assert(cream.includes("type: 'video'") && cream.includes("src: '/work/remeya-cream/ad.mp4'") && cream.includes("poster: '/work/remeya-cream/cover.jpg'"), 'Cream video missing')

for (const name of ['cover.jpg', 'ad.mp4']) {
  assert(statSync(new URL(`../public/work/remeya-cream/${name}`, import.meta.url)).size > 0, `${name} is empty`)
}

const coverSize = statSync(new URL('../public/work/remeya-cream/cover.jpg', import.meta.url)).size
const videoSize = statSync(new URL('../public/work/remeya-cream/ad.mp4', import.meta.url)).size
assert(coverSize > 500_000, `Cream cover looks stale: ${coverSize} bytes`)
assert(videoSize > 0 && videoSize < 66_011_132, `Cream video was not compressed: ${videoSize} bytes`)

console.log('瑞美亚面霜广告项目素材与数据验证通过')
