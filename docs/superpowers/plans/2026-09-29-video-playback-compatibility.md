# Video Playback Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every portfolio video reliably start from the existing user click while preserving zero video downloads before that click.

**Architecture:** Keep a native `<video>` element mounted from the poster state with `preload="none"`. The overlay button calls `load()` and `play()` directly on a `useRef` in the same click handler, while component state controls the poster, loading message, native controls, ready state, and retry state.

**Tech Stack:** React 19, native HTML video API, Vite 8, Node verification scripts, GitHub Pages
**Spec:** `docs/superpowers/specs/2026-09-29-video-playback-compatibility-design.md`

## Global Constraints

- Do not download video content before the visitor clicks “加载视频”.
- Preserve all current video sources, poster images, media-viewer layout, colors, and typography.
- Do not add third-party players, streaming protocols, CDNs, or runtime dependencies.
- If scripted playback is blocked, expose native controls instead of leaving the viewer in a loading-only state.
- Keep retry available for network or decoding errors.

---

## File Structure

- `src/components/work/DeferredVideo.jsx`: owns the mounted native player, click-to-load behavior, playback state, error state, and retry behavior.
- `scripts/verify-video-loading.mjs`: statically enforces the compatibility contract and guards against returning to conditional video mounting or attribute-only autoplay.
- `docs/superpowers/specs/2026-09-29-video-playback-compatibility-design.md`: approved design source; no implementation edits.

### Task 1: Add a failing playback compatibility contract

**Files:**
- Modify: `scripts/verify-video-loading.mjs`
- Test: `scripts/verify-video-loading.mjs`

**Interfaces:**
- Consumes: source text from `src/components/work/DeferredVideo.jsx`.
- Produces: verification assertions requiring `useRef`, direct `load()` and `play()` calls, a permanently rendered `<video>`, and no `autoPlay` attribute.

- [ ] **Step 1: Extend the source contract with compatibility assertions**

Add these assertions after the existing `preload="none"` assertion:

```js
assert(deferred.includes('useRef'), 'Deferred video must keep a stable native video element')
assert(deferred.includes('videoRef.current'), 'Playback must use the mounted video element')
assert(deferred.includes('.load()'), 'Click playback must explicitly start resource loading')
assert(deferred.includes('.play()'), 'Click playback must explicitly request playback')
assert(!deferred.includes('autoPlay'), 'Playback must not rely on remount-time autoplay')
assert(!deferred.includes("if (!requested || status === 'error') return"), 'Poster state must not replace the video element')
```

- [ ] **Step 2: Run the contract and verify it fails against the current component**

Run: `pnpm run verify:video-loading`

Expected: FAIL with `Deferred video must keep a stable native video element`.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- scripts/verify-video-loading.mjs
git commit -m "test: require click-bound video playback"
```

### Task 2: Keep the native player mounted and start it from the click

**Files:**
- Modify: `src/components/work/DeferredVideo.jsx:1-40`
- Test: `scripts/verify-video-loading.mjs`

**Interfaces:**
- Consumes: `src`, `poster`, and `title` string props plus `assetUrl(path)`.
- Produces: the same `DeferredVideo({ src, poster, title })` React component API; no caller changes.

- [ ] **Step 1: Replace conditional mounting with a stable player reference**

Replace `DeferredVideo.jsx` with this implementation:

```jsx
import { useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { assetUrl } from '../../lib/assetUrl'

export default function DeferredVideo({ src, poster, title }) {
  const videoRef = useRef(null)
  const [requested, setRequested] = useState(false)
  const [status, setStatus] = useState('idle')

  const requestPlayback = () => {
    const video = videoRef.current
    if (!video) return

    setRequested(true)
    setStatus('loading')
    video.preload = 'auto'
    video.load()

    const playback = video.play()
    if (playback) {
      playback.catch((error) => {
        if (error.name === 'NotAllowedError') setStatus('ready')
      })
    }
  }

  const showPoster = !requested || status === 'error'

  return <div className={`deferred-video is-${showPoster ? 'poster' : status}`}>
    <video
      ref={videoRef}
      src={assetUrl(src)}
      poster={poster ? assetUrl(poster) : undefined}
      preload="none"
      controls={requested}
      playsInline
      onCanPlay={() => setStatus('ready')}
      onPlaying={() => setStatus('ready')}
      onWaiting={() => requested && setStatus('loading')}
      onError={() => setStatus('error')}
    />
    {showPoster && <>
      {poster && <img src={assetUrl(poster)} alt="" decoding="async" />}
      <div className="deferred-video-shade" aria-hidden="true" />
      <button
        type="button"
        onClick={requestPlayback}
        aria-label={`${status === 'error' ? '重新加载' : '加载视频'}：${title}`}
      >
        {status === 'error' ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" fill="currentColor" />}
        <span>{status === 'error' ? '重新加载' : '加载视频'}</span>
      </button>
    </>}
    {requested && status === 'loading' && <span className="deferred-video-status" role="status">视频加载中…</span>}
  </div>
}
```

- [ ] **Step 2: Run the focused contract**

Run: `pnpm run verify:video-loading`

Expected: `Video loading verification passed`.

- [ ] **Step 3: Run lint and production build**

Run: `pnpm run lint`

Expected: exit code 0; the existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.

Run: `pnpm run build`

Expected: Vite completes the production build with no errors.

- [ ] **Step 4: Commit the compatibility fix**

```powershell
git add -- src/components/work/DeferredVideo.jsx
git commit -m "fix: start portfolio videos from user click"
```

### Task 3: Verify the complete site and publish the fix

**Files:**
- Verify: `src/components/work/DeferredVideo.jsx`
- Verify: `public/work/**/*.mp4`
- Publish with: `scripts/publish_github_repository.ps1`

**Interfaces:**
- Consumes: the production-ready repository tree and existing Windows GitHub credential.
- Produces: an updated `main` branch in `ygystyrdqd-lab/tingting-portfolio` and a successful GitHub Pages deployment.

- [ ] **Step 1: Run all relevant local verification**

```powershell
pnpm run verify:video-loading
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
```

Expected: both verification scripts pass, lint exits 0, and the production build completes.

- [ ] **Step 2: Check repository state before publication**

Run: `git status --short`

Expected: no uncommitted output.

- [ ] **Step 3: Publish the current tree through the existing GitHub API publisher**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/publish_github_repository.ps1 -ProjectRoot (Get-Location).Path -Owner ygystyrdqd-lab -Repository tingting-portfolio
```

Expected: output ends with `PUBLISHED_FILES=...`, `TREE=...`, and `COMMIT=...`.

- [ ] **Step 4: Verify GitHub Pages and representative video range requests**

```powershell
curl.exe -L --max-time 30 -sS -o NUL -w "HOME %{http_code}`n" "https://ygystyrdqd-lab.github.io/tingting-portfolio/?playback-fix=1"
curl.exe -L --max-time 30 -sS --range 0-31 -o NUL -w "VIDEO %{http_code} %{content_type}`n" "https://ygystyrdqd-lab.github.io/tingting-portfolio/work/aigc-video-01/video.mp4?playback-fix=1"
```

Expected: `HOME 200` and `VIDEO 206 video/mp4`.

- [ ] **Step 5: Perform the browser acceptance check**

Open `https://ygystyrdqd-lab.github.io/tingting-portfolio/?category=aigc-video&playback-fix=1`, open one project, and verify:

1. Before clicking “加载视频”, only the poster is visible and no video download starts.
2. Clicking “加载视频” reveals native controls and starts loading.
3. The video begins playback; if autoplay is blocked, clicking the native play control starts it.
4. Closing and reopening the viewer restores the poster state.

- [ ] **Step 6: Record the published commit and deployment result in the handoff**

Report the live URL, GitHub commit SHA, GitHub Pages workflow conclusion, local test results, and any browser-specific limitation observed.
