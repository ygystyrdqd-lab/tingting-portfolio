param(
  [Parameter(Mandatory = $true)] [string] $ProjectRoot,
  [Parameter(Mandatory = $true)] [string] $Owner,
  [Parameter(Mandatory = $true)] [string] $Repository
)

$ErrorActionPreference = 'Stop'
$request = "protocol=https`nhost=github.com`n`n"
$credential = $request | git credential fill
$passwordLine = $credential | Where-Object { $_ -like 'password=*' } | Select-Object -First 1
if (-not $passwordLine) { throw 'GitHub credential unavailable' }
$token = $passwordLine.Substring(9)
$headers = @{
  Authorization = "Bearer $token"
  Accept = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2026-03-10'
}
$apiRoot = "https://api.github.com/repos/$Owner/$Repository"
try {
  $release = Invoke-RestMethod -Uri "$apiRoot/releases/tags/media-v1" -Headers $headers
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
  $releaseBody = @{
    tag_name = 'media-v1'
    target_commitish = 'main'
    name = 'Portfolio media'
    body = 'Full-quality video assets used by the portfolio website.'
    draft = $false
    prerelease = $false
  } | ConvertTo-Json
  $release = Invoke-RestMethod -Method Post -Uri "$apiRoot/releases" -Headers $headers -ContentType 'application/json' -Body $releaseBody
}
$uploadRoot = $release.upload_url -replace '\{\?name,label\}$', ''
$assets = @(
  @{ Path = 'public/work/aigc-video-01/video.mp4'; Name = 'aigc-video-01.mp4' },
  @{ Path = 'public/work/aigc-video-02/video.mp4'; Name = 'aigc-video-02.mp4' }
)
foreach ($asset in $assets) {
  if ($release.assets.name -contains $asset.Name) {
    Write-Output "MEDIA_EXISTS=$($asset.Name)"
    continue
  }
  $absolutePath = Join-Path $ProjectRoot $asset.Path
  if (-not (Test-Path -LiteralPath $absolutePath)) { throw "Missing media: $($asset.Path)" }
  $assetName = [Uri]::EscapeDataString($asset.Name)
  Invoke-RestMethod -Method Post -Uri "${uploadRoot}?name=$assetName" -Headers $headers -ContentType 'video/mp4' -InFile $absolutePath | Out-Null
  Write-Output "MEDIA_UPLOADED=$($asset.Name)"
}
Write-Output "RELEASE=$($release.html_url)"
