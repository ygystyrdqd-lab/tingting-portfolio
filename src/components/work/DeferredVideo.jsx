import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { assetUrl } from '../../lib/assetUrl'

export default function DeferredVideo({ src, poster, title }) {
  const videoRef = useRef(null)
  const [requested, setRequested] = useState(false)
  const [status, setStatus] = useState('idle')
  const resolvedSrc = assetUrl(src)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    // React StrictMode runs effect cleanup once during development. Restore the
    // source here as well so both the development and production lifecycles work.
    if (video.getAttribute('src') !== resolvedSrc) {
      video.setAttribute('src', resolvedSrc)
    }

    return () => {
      // Fully detach the previous request. Safari and mobile Chromium can keep a
      // half-open range request alive otherwise, which breaks the next opening.
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [resolvedSrc])

  const requestPlayback = async () => {
    const video = videoRef.current
    if (!video || status === 'loading') return

    setRequested(true)
    setStatus('loading')
    video.pause()
    if (video.readyState > 0) video.currentTime = 0
    video.preload = 'auto'
    video.load()

    try {
      await video.play()
    } catch (error) {
      setStatus(error.name === 'NotAllowedError' ? 'ready' : 'error')
    }
  }

  const resetPlayback = () => {
    const video = videoRef.current
    if (video) video.currentTime = 0
    setRequested(false)
    setStatus('idle')
  }

  const showPoster = !requested || status === 'error'

  return <div className={`deferred-video is-${showPoster ? 'poster' : status}`}>
    <video
      ref={videoRef}
      src={resolvedSrc}
      poster={poster || undefined}
      preload="none"
      controls={requested}
      playsInline
      onCanPlay={() => setStatus('ready')}
      onPlaying={() => setStatus('ready')}
      onWaiting={() => requested && setStatus('loading')}
      onError={() => setStatus('error')}
      onEnded={resetPlayback}
    />
    {showPoster && <>
      {poster && <img src={poster} alt="" decoding="async" />}
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
