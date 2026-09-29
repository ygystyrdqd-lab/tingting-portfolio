const baseUrl = process.argv[2]?.replace(/\/$/, '')
if (!baseUrl) throw new Error('Pass the OSS video base URL as the first argument')

const files = [
  '3d-cream.mp4',
  'serum-ad-01.mp4',
  'serum-ad-02.mp4',
  'projector-ad.mp4',
  'remeya-cream-ad.mp4',
  'immune-cell-film.mp4',
]

for (const file of files) {
  const response = await fetch(`${baseUrl}/${file}`, {
    headers: {
      Origin: 'https://ygystyrdqd-lab.github.io',
      Range: 'bytes=0-1023',
    },
  })

  if (response.status !== 206) {
    throw new Error(`${file}: expected 206, got ${response.status}`)
  }
  if (!response.headers.get('content-type')?.startsWith('video/mp4')) {
    throw new Error(`${file}: invalid Content-Type`)
  }
  if (!response.headers.get('content-range')?.startsWith('bytes 0-1023/')) {
    throw new Error(`${file}: invalid Content-Range`)
  }
  if (response.headers.get('access-control-allow-origin') !== 'https://ygystyrdqd-lab.github.io') {
    throw new Error(`${file}: invalid CORS origin`)
  }
}

console.log('OSS video verification passed')
