import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

const data = readFileSync(new URL('../src/data/workCategories.js', import.meta.url), 'utf8')
const section = data.split("slug: 'aigc-video'")[1]?.split('const rawFeaturedWorkCategories')[0] ?? ''
assert.equal((section.match(/id: 'aigc-video-/g) ?? []).length, 3)
assert.match(section, /id: 'aigc-video-03'[\s\S]*?title: '瑞美亚精华液广告2'/)
assert.match(section, /cover: '\/work\/aigc-video-03\/cover.webp'/)
assert.match(section, /src: '\/work\/aigc-video-03\/video.mp4'/)
assert.match(section, /poster: '\/work\/aigc-video-03\/cover.webp'/)
assert.ok(statSync(new URL('../public/work/aigc-video-03/cover.webp', import.meta.url)).size > 0)
const videoSize = statSync(new URL('../public/work/aigc-video-03/video.mp4', import.meta.url)).size
assert.ok(videoSize > 0 && videoSize < 23_664_271)
console.log('AIGC 精华液广告2素材与映射验证通过')
