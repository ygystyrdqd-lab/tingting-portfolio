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
assert(deferred.includes('useRef'), 'Deferred video must keep a stable native video element')
assert(deferred.includes('videoRef.current'), 'Playback must use the mounted video element')
assert(deferred.includes('.load()'), 'Click playback must explicitly start resource loading')
assert(deferred.includes('.play()'), 'Click playback must explicitly request playback')
assert(!deferred.includes('autoPlay'), 'Playback must not rely on remount-time autoplay')
assert(!deferred.includes("if (!requested || status === 'error') return"), 'Poster state must not replace the video element')
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

const mebibyte = 1024 * 1024
const maxBytesByVideo = new Map([
  ['public/work/3d-01/video.mp4', 8 * mebibyte],
  ['public/work/aigc-video-01/video.mp4', 8 * mebibyte],
  ['public/work/aigc-video-02/video.mp4', 8 * mebibyte],
  ['public/work/aigc-video-03/video.mp4', 8 * mebibyte],
  ['public/work/remeya-cream/ad.mp4', 8 * mebibyte],
  ['public/work/immune-cell-science/film.mp4', 18 * mebibyte],
])

let totalBytes = 0
for (const video of videos) {
  const { size } = await stat(resolve(root, video))
  const maxBytes = maxBytesByVideo.get(video)
  assert(size <= maxBytes, `${video} exceeds its ${maxBytes / mebibyte}MiB web-preview budget`)
  totalBytes += size
}
assert(totalBytes <= 50 * mebibyte, 'Published video previews exceed the 50MiB total budget')

console.log('Video loading verification passed')
