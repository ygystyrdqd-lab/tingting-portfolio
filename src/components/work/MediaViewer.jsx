import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function MediaViewer({ project, onClose }) {
  useEffect(() => {
    if (!project) return undefined
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [project, onClose])

  if (!project) return null

  return <div
    className="media-viewer"
    role="dialog"
    aria-modal="true"
    aria-labelledby="media-viewer-title"
    onMouseDown={(event) => event.target === event.currentTarget && onClose()}
  >
    <div className="media-viewer-panel">
      <div className="media-viewer-header">
        <div><span>{project.number}</span><h2 id="media-viewer-title">{project.title}</h2></div>
        <button type="button" onClick={onClose} aria-label="关闭作品预览"><X /></button>
      </div>
      <div className="media-viewer-content">
        {project.media.length === 0 && <div className="media-empty"><i /><p>作品媒体将在后续上传</p><span>IMAGE / VIDEO READY</span></div>}
        {project.media.map((media, index) => {
          if (media.type === 'image') return <img key={`${media.src}-${index}`} src={media.src} alt={media.alt || project.title} />
          if (media.type === 'video') return <video
            key={`${media.src}-${index}`}
            src={media.src}
            poster={media.poster}
            preload="metadata"
            controls
            playsInline
          />
          return null
        })}
      </div>
    </div>
  </div>
}
