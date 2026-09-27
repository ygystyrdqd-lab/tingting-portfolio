import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFile(resolve(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const [viewer, deferred, data] = await Promise.all([
  read('src/components/work/MediaViewer.jsx'),
  read('src/components/work/DeferredVideo.jsx'),
  read('src/data/workCategories.js'),
])

assert(viewer.includes('<DeferredVideo'), 'MediaViewer must delegate video rendering')
assert(!viewer.includes('<video'), 'MediaViewer must not eagerly mount video elements')
assert(deferred.includes('preload="none"'), 'Deferred video must disable preload')
assert(deferred.includes('加载视频'), 'Poster state must have an explicit play action')
assert(deferred.includes('重新加载'), 'Video failures must expose retry')
assert(!data.includes('github.com/ygystyrdqd-lab/tingting-portfolio/releases'), 'Videos must use same-origin paths')

const videos = [
  'public/work/3d-01/video.mp4',
  'public/work/aigc-video-01/video.mp4',
  'public/work/aigc-video-02/video.mp4',
  'public/work/aigc-video-03/video.mp4',
  'public/work/remeya-cream/ad.mp4',
  'public/work/immune-cell-science/film.mp4',
]

let totalBytes = 0
for (const video of videos) {
  const { size } = await stat(resolve(root, video))
  assert(size < 100 * 1024 * 1024, `${video} exceeds GitHub's 100MiB limit`)
  totalBytes += size
}
assert(totalBytes <= 156_514_557, 'Published videos did not meet the 35% reduction target')

console.log('Video loading verification passed')
