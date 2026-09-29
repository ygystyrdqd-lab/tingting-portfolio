import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFile(resolve(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const [viewer, deferred, data, config] = await Promise.all([
  read('src/components/work/MediaViewer.jsx'),
  read('src/components/work/DeferredVideo.jsx'),
  read('src/data/workCategories.js'),
  read('src/config/videoAssets.js'),
])

assert(viewer.includes('<DeferredVideo'), 'MediaViewer must delegate video rendering')
assert(!viewer.includes('<video'), 'MediaViewer must not eagerly mount video elements')
assert(deferred.includes('preload="none"'), 'Deferred video must disable preload')
assert(deferred.includes('useRef'), 'Deferred video must keep a stable native video element')
assert(deferred.includes('videoRef.current'), 'Playback must use the mounted video element')
assert(deferred.includes('.load()'), 'Click playback must explicitly start resource loading')
assert(deferred.includes('.play()'), 'Click playback must explicitly request playback')
assert(deferred.includes('useEffect'), 'Deferred video must release its media connection when closed')
assert(deferred.includes("removeAttribute('src')"), 'Closing the viewer must detach the previous video source')
assert(deferred.includes('video.pause()'), 'Closing or restarting must pause the previous playback')
assert(deferred.includes('video.currentTime = 0'), 'Repeated playback must restart from the beginning')
assert(deferred.includes('onEnded={resetPlayback}'), 'Completed video must return to a replayable poster state')
assert(!deferred.includes('autoPlay'), 'Playback must not rely on remount-time autoplay')
assert(!deferred.includes("if (!requested || status === 'error') return"), 'Poster state must not replace the video element')
assert(deferred.includes('加载视频'), 'Poster state must have an explicit play action')
assert(deferred.includes('重新加载'), 'Video failures must expose retry')
assert(deferred.includes('poster={poster || undefined}'), 'Video poster must use the already resolved project URL')
assert(deferred.includes('<img src={poster}'), 'Poster image must use the already resolved project URL')
assert(!deferred.includes('assetUrl(poster)'), 'DeferredVideo must not resolve poster URLs twice')
assert(data.includes("from '../config/videoAssets'"), 'Work data must import centralized OSS video assets')
assert((data.match(/videoAssets\./g) || []).length === 6, 'All six videos must use centralized OSS URLs')
assert(config.includes('VITE_OSS_VIDEO_BASE_URL'), 'OSS base URL must come from the production environment')
assert(!data.includes('.lite.mp4'), 'Published work data must not use GitHub Pages video paths')

const videos = [
  'public/work/3d-01/video.lite.mp4',
  'public/work/aigc-video-01/video.lite.mp4',
  'public/work/aigc-video-02/video.lite.mp4',
  'public/work/aigc-video-03/video.lite.mp4',
  'public/work/remeya-cream/ad.lite.mp4',
  'public/work/immune-cell-science/film.lite.mp4',
]

const mebibyte = 1024 * 1024
const maxBytesByVideo = new Map([
  ['public/work/3d-01/video.lite.mp4', 0.5 * mebibyte],
  ['public/work/aigc-video-01/video.lite.mp4', 0.5 * mebibyte],
  ['public/work/aigc-video-02/video.lite.mp4', 0.5 * mebibyte],
  ['public/work/aigc-video-03/video.lite.mp4', 0.5 * mebibyte],
  ['public/work/remeya-cream/ad.lite.mp4', 0.75 * mebibyte],
  ['public/work/immune-cell-science/film.lite.mp4', 1.5 * mebibyte],
])

let totalBytes = 0
for (const video of videos) {
  const { size } = await stat(resolve(root, video))
  const maxBytes = maxBytesByVideo.get(video)
  assert(size <= maxBytes, `${video} exceeds its ${maxBytes / mebibyte}MiB web-preview budget`)
  totalBytes += size
}
assert(totalBytes <= 4 * mebibyte, 'Published streaming previews exceed the 4MiB total budget')

console.log('Video loading verification passed')
