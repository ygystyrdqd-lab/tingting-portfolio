import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

const data = readFileSync(new URL('../src/data/workCategories.js', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const featured = data.split('const rawFeaturedWorkCategories = [')[1]?.split('const resolveCategoryAssets')[0] ?? ''

assert.equal((featured.match(/slug: '/g) ?? []).length, 4)
const immune = featured.split("slug: 'immune-cell-science'")[1] ?? ''
assert.match(immune, /title: '免疫细胞科普（身体里的接力赛）'/)
assert.match(immune, /meta: 'SCIENCE · SHORT FILM'/)
assert.match(immune, /cover: '\/work\/immune-cell-science\/cover.webp'/)
assert.match(immune, /src: '\/work\/immune-cell-science\/film.mp4'/)
assert.match(app, /'project-four'/)
assert.match(css, /\.project-four\s*\{/)
assert.ok(statSync(new URL('../public/work/immune-cell-science/cover.webp', import.meta.url)).size > 0)
const videoSize = statSync(new URL('../public/work/immune-cell-science/film.mp4', import.meta.url)).size
assert.ok(videoSize > 0 && videoSize < 100 * 1024 * 1024)

console.log('免疫细胞科普项目卡片与素材验证通过')
