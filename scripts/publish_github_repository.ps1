param(
  [Parameter(Mandatory = $true)] [string] $ProjectRoot,
  [Parameter(Mandatory = $true)] [string] $Owner,
  [Parameter(Mandatory = $true)] [string] $Repository
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
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

function Invoke-GitHubJson {
  param([string] $Method, [string] $Uri, [object] $Body)
  $json = $Body | ConvertTo-Json -Depth 20 -Compress
  Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -ContentType 'application/json' -Body $json
}

try {
  $branchRef = Invoke-RestMethod -Uri "$apiRoot/git/ref/heads/main" -Headers $headers
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  if ($statusCode -notin @(404, 409)) { throw }
  $initialContent = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("# $Repository`n"))
  Invoke-GitHubJson -Method Put -Uri "$apiRoot/contents/README.md" -Body @{
    message = 'chore: initialize repository'
    content = $initialContent
    branch = 'main'
  } | Out-Null
  $branchRef = Invoke-RestMethod -Uri "$apiRoot/git/ref/heads/main" -Headers $headers
}
$parentCommit = $branchRef.object.sha

$rootFiles = @(
  '.gitignore', '.oxlintrc.json', 'README.md', 'components.json', 'index.html',
  'package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'vite.config.js'
)
$rootDirectories = @('.github', 'docs', 'public', 'scripts', 'src')
$externalMediaPaths = @(
  'public/work/aigc-video-01/video.mp4',
  'public/work/aigc-video-02/video.mp4'
)
$files = @()
foreach ($relativePath in $rootFiles) {
  $absolutePath = Join-Path $resolvedRoot $relativePath
  if (Test-Path -LiteralPath $absolutePath) { $files += Get-Item -LiteralPath $absolutePath }
}
foreach ($relativeDirectory in $rootDirectories) {
  $absoluteDirectory = Join-Path $resolvedRoot $relativeDirectory
  if (Test-Path -LiteralPath $absoluteDirectory) {
    $files += Get-ChildItem -LiteralPath $absoluteDirectory -Recurse -File
  }
}

$files = $files | Sort-Object FullName -Unique
if ($files.Count -lt 1) { throw 'No files selected for publication' }

$tree = [System.Collections.Generic.List[object]]::new()
$index = 0
foreach ($file in $files) {
  $index += 1
  $relativePath = [System.IO.Path]::GetRelativePath($resolvedRoot, $file.FullName).Replace('\', '/')
  if ($relativePath -in $externalMediaPaths) { continue }
  if ($relativePath -match '(^|/)(\.env|node_modules|dist|\.git|\.superpowers)(/|$|\.)') {
    throw "Blocked path selected: $relativePath"
  }
  $content = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file.FullName))
  $blob = Invoke-GitHubJson -Method Post -Uri "$apiRoot/git/blobs" -Body @{ content = $content; encoding = 'base64' }
  $tree.Add(@{ path = $relativePath; mode = '100644'; type = 'blob'; sha = $blob.sha })
  Write-Output "UPLOADED $index/$($files.Count): $relativePath"
}

$createdTree = Invoke-GitHubJson -Method Post -Uri "$apiRoot/git/trees" -Body @{ tree = $tree }
$profile = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $headers
$authorName = if ($profile.name) { $profile.name } else { $profile.login }
$authorEmail = "$($profile.id)+$($profile.login)@users.noreply.github.com"
$date = [DateTime]::UtcNow.ToString('o')
$identity = @{ name = $authorName; email = $authorEmail; date = $date }
$commit = Invoke-GitHubJson -Method Post -Uri "$apiRoot/git/commits" -Body @{
  message = 'feat: publish portfolio website'
  tree = $createdTree.sha
  parents = @($parentCommit)
  author = $identity
  committer = $identity
}
Invoke-GitHubJson -Method Patch -Uri "$apiRoot/git/refs/heads/main" -Body @{ sha = $commit.sha; force = $false } | Out-Null

Write-Output "PUBLISHED_FILES=$($files.Count)"
Write-Output "TREE=$($createdTree.sha)"
Write-Output "COMMIT=$($commit.sha)"
