import { useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { assetUrl } from '../../lib/assetUrl'

export default function DeferredVideo({ src, poster, title }) {
  const [requested, setRequested] = useState(false)
  const [status, setStatus] = useState('idle')

  const requestPlayback = () => {
    setRequested(true)
    setStatus('loading')
  }

  if (!requested || status === 'error') return <div className="deferred-video is-poster">
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
  </div>

  return <div className={`deferred-video is-${status}`}>
    <video
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
