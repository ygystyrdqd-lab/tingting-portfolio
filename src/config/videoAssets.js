const defaultOssVideoBaseUrl =
  'https://tingting-portfolio-media-20260930-01.oss-cn-shenzhen.aliyuncs.com/portfolio/videos'

const ossVideoBaseUrl = (import.meta.env.VITE_OSS_VIDEO_BASE_URL || defaultOssVideoBaseUrl).replace(/\/$/, '')

export const videoAssets = Object.freeze({
  cream3d: `${ossVideoBaseUrl}/3d-cream.mp4`,
  serum01: `${ossVideoBaseUrl}/serum-ad-01.mp4`,
  serum02: `${ossVideoBaseUrl}/serum-ad-02.mp4`,
  projector: `${ossVideoBaseUrl}/projector-ad.mp4`,
  remeyaCream: `${ossVideoBaseUrl}/remeya-cream-ad.mp4`,
  immuneCell: `${ossVideoBaseUrl}/immune-cell-film.mp4`,
})
