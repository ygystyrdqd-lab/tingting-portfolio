$ErrorActionPreference = 'Stop'

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
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
  $source = [IO.Path]::GetFullPath((Join-Path $projectRoot $relativePath))
  if (-not $source.StartsWith($projectRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Target leaves project root: $relativePath"
  }
  if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
    throw "Video not found: $relativePath"
  }

  $probe = (& ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -show_entries format=bit_rate -of json $source) | ConvertFrom-Json
  $rateParts = $probe.streams[0].r_frame_rate -split '/'
  $fps = [double]$rateParts[0] / [double]$rateParts[1]
  $longEdge = [Math]::Max([int]$probe.streams[0].width, [int]$probe.streams[0].height)
  $bitRate = [double]$probe.format.bit_rate
  $isLongForm = $relativePath -eq 'public/work/immune-cell-science/film.mp4'
  $bitRateCeiling = if ($isLongForm) { 4500000 } else { 8500000 }
  $maxRate = if ($isLongForm) { '4M' } else { '8M' }
  $bufferSize = if ($isLongForm) { '8M' } else { '16M' }
  if ($longEdge -le 1920 -and $fps -le 30.01 -and $bitRate -le $bitRateCeiling) {
    Write-Host "Already optimized: $relativePath"
    continue
  }

  $directory = [IO.Path]::GetDirectoryName($source)
  $stem = [IO.Path]::GetFileNameWithoutExtension($source)
  $output = [IO.Path]::Combine($directory, "$stem.optimized.mp4")

  Write-Host "Optimizing $relativePath"
  & ffmpeg -hide_banner -y -i $source -map 0:v:0 -map '0:a?' -vf $scale -fpsmax 30 -c:v libx264 -preset slow -crf 21 -maxrate $maxRate -bufsize $bufferSize -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k $output
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $relativePath" }

  $duration = & ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $output
  if ($LASTEXITCODE -ne 0 -or [double]$duration -le 0) {
    throw "ffprobe validation failed for $relativePath"
  }

  Move-Item -LiteralPath $output -Destination $source -Force
}

Write-Host 'All website video copies optimized.'
