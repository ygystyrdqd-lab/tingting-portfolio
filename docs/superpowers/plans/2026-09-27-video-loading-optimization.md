# Video Loading Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce portfolio video startup time while preserving high visual quality and the existing gallery experience.

**Architecture:** Add a focused `DeferredVideo` component that renders only a poster until the visitor requests playback, then mounts the native video element with loading and retry states. Re-encode every published video as H.264/AAC MP4 with `faststart`, 1920px maximum long edge, and 30fps maximum, and serve all videos from the same GitHub Pages origin.

**Tech Stack:** React 19, Vite 8, CSS, Node verification scripts, FFmpeg/FFprobe
**Spec:** `docs/superpowers/specs/2026-09-27-video-loading-optimization-design.md`

## Global Constraints

- Preserve current desktop layout, titles, posters, animations, native controls, and click-to-open behavior.
- Do not autoplay or download video files when the viewer opens; playback may begin only after the visitor explicitly clicks the load action.
- Preserve source assets outside `portfolio-site`; only replace website publishing copies in `public/work`.
- Encode H.264 MP4 with `faststart`, AAC 128kbps, maximum long edge 1920px, and maximum 30fps.
- Reduce total published video bytes by at least 35%; keep every file below 100MiB.
- Keep local Vite and GitHub Pages subdirectory paths working through `assetUrl()`.

---

### Task 1: Add the deferred video contract and verification

**Files:**
- Create: `scripts/verify-video-loading.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `src/components/work/MediaViewer.jsx`, `src/data/workCategories.js`, and published files under `public/work`.
- Produces: `pnpm run verify:video-loading`, a static verification command that fails if videos mount eagerly, remote release URLs remain, required state copy is missing, or a video exceeds 100MiB.

- [ ] **Step 1: Write the failing verification script**

```js
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
assert(deferred.includes("preload=\"none\""), 'Deferred video must disable preload')
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

for (const video of videos) {
  const { size } = await stat(resolve(root, video))
  assert(size < 100 * 1024 * 1024, `${video} exceeds GitHub's 100MiB limit`)
}

console.log('Video loading verification passed')
```

- [ ] **Step 2: Register and run the verification to confirm it fails**

Add to `package.json`:

```json
"verify:video-loading": "node scripts/verify-video-loading.mjs"
```

Run: `pnpm run verify:video-loading`

Expected: FAIL because `DeferredVideo.jsx` does not exist.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add package.json scripts/verify-video-loading.mjs
git commit -m "test: define deferred video loading contract"
```

### Task 2: Implement click-to-load video playback

**Files:**
- Create: `src/components/work/DeferredVideo.jsx`
- Modify: `src/components/work/MediaViewer.jsx`
- Modify: `src/components/work/work-detail.css`

**Interfaces:**
- Consumes: `{ src: string, poster?: string, title: string }`; paths can be absolute HTTPS URLs or site-relative paths.
- Produces: `DeferredVideo({ src, poster, title })`, which mounts no `<video>` until activation, then uses `assetUrl()` for local video and poster paths.

- [ ] **Step 1: Create the minimal deferred player**

```jsx
import { useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { assetUrl } from '../../lib/assetUrl'

export default function DeferredVideo({ src, poster, title }) {
  const videoRef = useRef(null)
  const [requested, setRequested] = useState(false)
  const [status, setStatus] = useState('idle')

  const requestPlayback = () => {
    setRequested(true)
    setStatus('loading')
  }

  if (!requested || status === 'error') return <div className="deferred-video">
    {poster && <img src={assetUrl(poster)} alt="" />}
    <div className="deferred-video-shade" />
    <button type="button" onClick={requestPlayback} aria-label={`${status === 'error' ? '重新加载' : '加载视频'}：${title}`}>
      {status === 'error' ? <RotateCcw /> : <Play fill="currentColor" />}
      <span>{status === 'error' ? '重新加载' : '加载视频'}</span>
    </button>
  </div>

  return <div className={`deferred-video is-${status}`}>
    <video
      ref={videoRef}
      src={assetUrl(src)}
      poster={poster ? assetUrl(poster) : undefined}
      preload="none"
      controls
      playsInline
      autoPlay
      onCanPlay={() => setStatus('ready')}
      onError={() => setStatus('error')}
    />
    {status === 'loading' && <span className="deferred-video-status" role="status">视频加载中…</span>}
  </div>
}
```

- [ ] **Step 2: Delegate video rendering from MediaViewer**

Import `DeferredVideo`, then replace the native video branch with:

```jsx
if (media.type === 'video') return <DeferredVideo
  key={`${media.src}-${index}`}
  src={media.src}
  poster={media.poster}
  title={project.title}
/>
```

- [ ] **Step 3: Style poster, play action, loading state, and focus state**

Add focused rules to `work-detail.css`:

```css
.deferred-video{position:relative;display:grid;place-items:center;width:100%;min-height:min(620px,72svh);overflow:hidden;border-radius:16px;background:#070605}
.deferred-video>img,.deferred-video>video{grid-area:1/1;width:100%;height:100%;max-height:78svh;object-fit:contain;background:#070605}
.deferred-video-shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,4,3,.48),transparent 55%)}
.deferred-video>button{position:absolute;display:grid;place-items:center;gap:10px;min-width:112px;padding:16px 20px;color:var(--ivory);background:rgba(16,13,11,.72);border:1px solid rgba(208,173,125,.56);border-radius:999px;backdrop-filter:blur(12px);cursor:pointer}
.deferred-video>button:focus-visible{outline:2px solid var(--champagne);outline-offset:4px}
.deferred-video>button span{font-size:10px;letter-spacing:.12em}
.deferred-video-status{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);padding:8px 12px;color:rgba(240,236,229,.78);background:rgba(8,7,6,.65);border-radius:999px;font-size:10px;letter-spacing:.08em}
```

- [ ] **Step 4: Run the static contract**

Run: `pnpm run verify:video-loading`

Expected: FAIL only on remaining remote URLs, before Task 3.

- [ ] **Step 5: Commit the component**

```powershell
git add src/components/work/DeferredVideo.jsx src/components/work/MediaViewer.jsx src/components/work/work-detail.css
git commit -m "perf: defer portfolio video loading"
```

### Task 3: Re-encode and localize published videos

**Files:**
- Create: `scripts/optimize-videos.ps1`
- Modify: `public/work/3d-01/video.mp4`
- Modify: `public/work/aigc-video-01/video.mp4`
- Modify: `public/work/aigc-video-02/video.mp4`
- Modify: `public/work/aigc-video-03/video.mp4`
- Modify: `public/work/remeya-cream/ad.mp4`
- Modify: `public/work/immune-cell-science/film.mp4`
- Modify: `src/data/workCategories.js`

**Interfaces:**
- Consumes: an `ffmpeg` and `ffprobe` executable on `PATH`, plus the six website publishing copies listed above.
- Produces: optimized files at the same paths and same-origin URLs `/work/aigc-video-01/video.mp4` and `/work/aigc-video-02/video.mp4` in `workCategories.js`.

- [ ] **Step 1: Add a repeatable transcoding script**

Create `scripts/optimize-videos.ps1` with an explicit allowlist. For each file, write to `video.optimized.mp4`, validate it with `ffprobe`, then replace only the website copy:

```powershell
$ErrorActionPreference = 'Stop'
$targets = @(
  'public/work/3d-01/video.mp4',
  'public/work/aigc-video-01/video.mp4',
  'public/work/aigc-video-02/video.mp4',
  'public/work/aigc-video-03/video.mp4',
  'public/work/remeya-cream/ad.mp4',
  'public/work/immune-cell-science/film.mp4'
)
$scale = "scale='if(gte(iw,ih),min(iw,1920),-2)':'if(gte(iw,ih),-2,min(ih,1920))'"

foreach ($relativePath in $targets) {
  $source = Join-Path $PSScriptRoot '..' $relativePath
  $output = [IO.Path]::Combine([IO.Path]::GetDirectoryName($source), "$([IO.Path]::GetFileNameWithoutExtension($source)).optimized.mp4")
  & ffmpeg -y -i $source -map 0:v:0 -map '0:a?' -vf $scale -fpsmax 30 -c:v libx264 -preset slow -crf 21 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k $output
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $relativePath" }
  & ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $output | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "ffprobe failed for $relativePath" }
  Move-Item -LiteralPath $output -Destination $source -Force
}
```

- [ ] **Step 2: Install or locate FFmpeg and run the optimizer**

Run: `winget install --id Gyan.FFmpeg --exact --accept-package-agreements --accept-source-agreements`

Run: `powershell -ExecutionPolicy Bypass -File scripts/optimize-videos.ps1`

Expected: all six files are replaced only after their optimized outputs pass `ffprobe`.

- [ ] **Step 3: Replace cross-origin URLs**

In `src/data/workCategories.js`, replace:

```js
src: 'https://github.com/ygystyrdqd-lab/tingting-portfolio/releases/download/media-v1/aigc-video-01.mp4'
```

with:

```js
src: '/work/aigc-video-01/video.mp4'
```

and do the equivalent for `aigc-video-02`.

- [ ] **Step 4: Verify size, codec, frame rate, dimensions, and faststart**

Run `ffprobe` for every target and confirm codec `h264`, maximum long edge `1920`, and frame rate no greater than `30`. Run:

```powershell
Get-ChildItem public/work -Recurse -File -Filter *.mp4 | Measure-Object Length -Sum
pnpm run verify:video-loading
```

Expected: total bytes are at least 35% lower than the 230MB baseline; all checks pass.

- [ ] **Step 5: Commit optimized media and paths**

```powershell
git add scripts/optimize-videos.ps1 src/data/workCategories.js public/work
git commit -m "perf: optimize portfolio video delivery"
```

### Task 4: Full verification and visual quality check

**Files:**
- Modify only if a bounded verification pass finds a defect in Task 2 or Task 3 files.

**Interfaces:**
- Consumes: completed deferred player and optimized video files.
- Produces: a clean production build and evidence that poster-first loading, playback, retry, and media quality work.

- [ ] **Step 1: Run all automated checks**

```powershell
pnpm run verify:video-loading
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
```

Expected: all commands exit 0; existing non-blocking lint warnings may remain documented.

- [ ] **Step 2: Inspect representative frames**

Extract frames at 10%, 50%, and 90% of each optimized video using FFmpeg and compare against the pre-optimization source or previously approved visual reference. Confirm no obvious macroblocking, color banding, black frames, aspect-ratio changes, or text-legibility loss.

- [ ] **Step 3: Verify browser network behavior**

Open one project containing video and confirm:

1. Opening the viewer requests the poster but not the MP4.
2. Clicking “加载视频” requests only that MP4.
3. Playback begins and native controls remain available.
4. A deliberately invalid URL shows “重新加载”.

- [ ] **Step 4: Confirm working tree and final commit**

```powershell
git diff --check
git status --short
```

If bounded verification required a fix, commit it:

```powershell
git add src/components/work scripts package.json src/data/workCategories.js public/work
git commit -m "fix: finalize video loading optimization"
```
