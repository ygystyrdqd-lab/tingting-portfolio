param(
  [Parameter(Mandatory = $true)]
  [string] $SourceRoot
)

$ErrorActionPreference = 'Stop'

$sourceRootPath = [IO.Path]::GetFullPath($SourceRoot)
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$jobs = @(
  @{ Source = '作品/4三维视觉/面霜视频终.mp4'; Destination = 'public/work/3d-01/video.mp4'; Streaming = 'public/work/3d-01/video.web.mp4' },
  @{ Source = '作品/5AIGC视频广告/精华液广告.mp4'; Destination = 'public/work/aigc-video-01/video.mp4'; Streaming = 'public/work/aigc-video-01/video.web.mp4' },
  @{ Source = '作品/5AIGC视频广告/精华液广告2.mp4'; Destination = 'public/work/aigc-video-02/video.mp4'; Streaming = 'public/work/aigc-video-02/video.web.mp4' },
  @{ Source = '作品/5AIGC视频广告/投影仪广告.mp4'; Destination = 'public/work/aigc-video-03/video.mp4'; Streaming = 'public/work/aigc-video-03/video.web.mp4' },
  @{ Source = '项目/瑞美亚面霜广告.mp4'; Destination = 'public/work/remeya-cream/ad.mp4'; Streaming = 'public/work/remeya-cream/ad.web.mp4' },
  @{ Source = '免疫细胞科普（身体里的接力赛）/免疫细胞科普短片 (1).mp4'; Destination = 'public/work/immune-cell-science/film.mp4'; Streaming = 'public/work/immune-cell-science/film.web.mp4' }
)
$scale = "scale='if(gte(iw,ih),min(iw,1920),-2)':'if(gte(iw,ih),-2,min(ih,1920))'"
$streamingScale = "scale='if(gte(iw,ih),min(iw,960),-2)':'if(gte(iw,ih),-2,min(ih,960))'"

function Assert-WithinRoot {
  param(
    [Parameter(Mandatory = $true)] [string] $Path,
    [Parameter(Mandatory = $true)] [string] $Root,
    [Parameter(Mandatory = $true)] [string] $Label
  )

  $resolvedPath = [IO.Path]::GetFullPath($Path)
  $resolvedRoot = [IO.Path]::GetFullPath($Root).TrimEnd([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)
  $rootPrefix = $resolvedRoot + [IO.Path]::DirectorySeparatorChar
  if ($resolvedPath -ne $resolvedRoot -and -not $resolvedPath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "$Label leaves its allowed root: $resolvedPath"
  }
  return $resolvedPath
}

function Test-FastStart {
  param([Parameter(Mandatory = $true)] [string] $Path)

  $stream = [IO.File]::OpenRead($Path)
  try {
    $buffer = New-Object byte[] ([Math]::Min(4MB, $stream.Length))
    $read = $stream.Read($buffer, 0, $buffer.Length)
    $header = [Text.Encoding]::ASCII.GetString($buffer, 0, $read)
    return $header.Contains('moov')
  } finally {
    $stream.Dispose()
  }
}

foreach ($job in $jobs) {
  $source = Assert-WithinRoot -Path (Join-Path $sourceRootPath $job.Source) -Root $sourceRootPath -Label 'Source'
  $destination = Assert-WithinRoot -Path (Join-Path $projectRoot $job.Destination) -Root $projectRoot -Label 'Destination'
  if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
    throw "Source video not found: $($job.Source)"
  }

  $destinationDirectory = [IO.Path]::GetDirectoryName($destination)
  if (-not (Test-Path -LiteralPath $destinationDirectory -PathType Container)) {
    throw "Destination directory not found: $destinationDirectory"
  }
  $output = "$destination.preview.mp4"

  Write-Output "ENCODING $($job.Source) -> $($job.Destination)"
  $ffmpegArgs = @(
    '-hide_banner', '-y', '-i', $source,
    '-map', '0:v:0', '-map', '0:a?',
    '-vf', $scale, '-fpsmax', '30',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-maxrate', '2M', '-bufsize', '4M',
    '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '96k',
    $output
  )
  & ffmpeg @ffmpegArgs
  if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg failed for $($job.Source)"
  }

  $probeJson = & ffprobe -v error -select_streams v:0 `
    -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate `
    -show_entries format=duration -of json $output
  if ($LASTEXITCODE -ne 0) {
    throw "ffprobe failed for $($job.Source)"
  }
  $probe = $probeJson | ConvertFrom-Json
  $video = $probe.streams[0]
  $rateParts = $video.r_frame_rate -split '/'
  $fps = [double]$rateParts[0] / [double]$rateParts[1]

  if ($video.codec_name -ne 'h264') { throw "Unexpected codec for $($job.Source): $($video.codec_name)" }
  if ($video.pix_fmt -ne 'yuv420p') { throw "Unexpected pixel format for $($job.Source): $($video.pix_fmt)" }
  if ([Math]::Max([int]$video.width, [int]$video.height) -gt 1920) { throw "Output exceeds 1080p limit: $($job.Source)" }
  if ($fps -gt 30.01) { throw "Output exceeds 30fps: $($job.Source)" }
  if ([double]$probe.format.duration -le 0) { throw "Output has invalid duration: $($job.Source)" }
  if (-not (Test-FastStart -Path $output)) { throw "Output is missing a leading moov atom: $($job.Source)" }

  Move-Item -LiteralPath $output -Destination $destination -Force
  $sizeMb = [Math]::Round((Get-Item -LiteralPath $destination).Length / 1MB, 2)
  Write-Output "READY $($job.Destination) $($video.width)x$($video.height) $([Math]::Round($fps, 2))fps ${sizeMb}MiB"

  $streaming = Assert-WithinRoot -Path (Join-Path $projectRoot $job.Streaming) -Root $projectRoot -Label 'Streaming destination'
  $streamingOutput = "$streaming.preview.mp4"
  $streamingArgs = @(
    '-hide_banner', '-y', '-i', $destination,
    '-map', '0:v:0', '-map', '0:a?',
    '-vf', $streamingScale, '-fpsmax', '24',
    '-c:v', 'libx264', '-preset', 'slow', '-b:v', '360k', '-maxrate', '420k', '-bufsize', '840k',
    '-profile:v', 'main', '-level', '3.1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '64k',
    $streamingOutput
  )
  & ffmpeg @streamingArgs
  if ($LASTEXITCODE -ne 0) {
    throw "streaming ffmpeg failed for $($job.Source)"
  }

  $streamProbeJson = & ffprobe -v error -select_streams v:0 `
    -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate `
    -show_entries format=duration,bit_rate -of json $streamingOutput
  if ($LASTEXITCODE -ne 0) {
    throw "streaming ffprobe failed for $($job.Source)"
  }
  $streamProbe = $streamProbeJson | ConvertFrom-Json
  $streamVideo = $streamProbe.streams[0]
  $streamRateParts = $streamVideo.r_frame_rate -split '/'
  $streamFps = [double]$streamRateParts[0] / [double]$streamRateParts[1]

  if ($streamVideo.codec_name -ne 'h264') { throw "Unexpected streaming codec for $($job.Source): $($streamVideo.codec_name)" }
  if ($streamVideo.pix_fmt -ne 'yuv420p') { throw "Unexpected streaming pixel format for $($job.Source): $($streamVideo.pix_fmt)" }
  if ([Math]::Max([int]$streamVideo.width, [int]$streamVideo.height) -gt 960) { throw "Streaming output exceeds 540p limit: $($job.Source)" }
  if ($streamFps -gt 24.01) { throw "Streaming output exceeds 24fps: $($job.Source)" }
  if ([double]$streamProbe.format.duration -le 0) { throw "Streaming output has invalid duration: $($job.Source)" }
  if ([double]$streamProbe.format.bit_rate -gt 520000) { throw "Streaming output exceeds 520kbps: $($job.Source)" }
  if (-not (Test-FastStart -Path $streamingOutput)) { throw "Streaming output is missing a leading moov atom: $($job.Source)" }

  Move-Item -LiteralPath $streamingOutput -Destination $streaming -Force
  $streamingSizeMb = [Math]::Round((Get-Item -LiteralPath $streaming).Length / 1MB, 2)
  Write-Output "READY $($job.Streaming) $($streamVideo.width)x$($streamVideo.height) $([Math]::Round($streamFps, 2))fps ${streamingSizeMb}MiB"
}

Write-Output 'All 1080p masters and low-bandwidth website video previews are ready.'
