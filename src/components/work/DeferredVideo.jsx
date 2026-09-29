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
