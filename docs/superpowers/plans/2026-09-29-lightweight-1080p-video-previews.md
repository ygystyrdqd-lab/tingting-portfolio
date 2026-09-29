# Lightweight 1080p Video Previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all six published portfolio videos with lightweight 1080p web previews generated from the original source files so they begin playing much sooner on GitHub Pages.

**Architecture:** A PowerShell/FFmpeg publishing script maps each untouched source master to its website destination, encodes H.264/AAC with a 1920px long-edge ceiling, 30fps ceiling, 2Mbps rate ceiling, and `faststart`, then atomically replaces only the website copy. A Node verification script enforces per-file and total-size budgets before the site can be published.

**Tech Stack:** PowerShell 7, FFmpeg/ffprobe, Node.js, React/Vite, GitHub Pages
**Spec:** `docs/superpowers/specs/2026-09-29-lightweight-web-video-previews-design.md`

## Global Constraints

- Always encode from the six original source videos under `C:\Users\Mayn\Desktop\作品集`; never use the current website copies as input.
- Never modify, move, or overwrite an original source video.
- Output MP4 with H.264 video, AAC audio, `yuv420p`, `faststart`, a 1920px maximum long edge, and a 30fps maximum frame rate.
- Keep each 15–29 second preview at or below 8MiB and the 61 second preview at or below 18MiB.
- Keep all six published previews at or below 50MiB total; the design target remains approximately 45MB.
- Preserve current project data, poster images, player behavior, cards, modal layout, and styling.

---

## File Structure

- `scripts/verify-video-loading.mjs`: enforces individual and aggregate published-video size budgets in addition to the existing player compatibility checks.
- `scripts/optimize-videos.ps1`: becomes a reproducible source-master-to-web-preview encoder with explicit source/destination mapping and output validation.
- `public/work/**/video.mp4`, `public/work/remeya-cream/ad.mp4`, `public/work/immune-cell-science/film.mp4`: generated website copies only.

### Task 1: Add failing size-budget verification

**Files:**
- Modify: `scripts/verify-video-loading.mjs`
- Test: `scripts/verify-video-loading.mjs`

**Interfaces:**
- Consumes: the six paths already listed in the `videos` array.
- Produces: `maxBytesByVideo: Map<string, number>` and a 50MiB aggregate limit used by the verification loop.

- [ ] **Step 1: Define exact per-file and aggregate budgets**

Add this map immediately after the `videos` array:

```js
const mebibyte = 1024 * 1024
const maxBytesByVideo = new Map([
  ['public/work/3d-01/video.mp4', 8 * mebibyte],
  ['public/work/aigc-video-01/video.mp4', 8 * mebibyte],
  ['public/work/aigc-video-02/video.mp4', 8 * mebibyte],
  ['public/work/aigc-video-03/video.mp4', 8 * mebibyte],
  ['public/work/remeya-cream/ad.mp4', 8 * mebibyte],
  ['public/work/immune-cell-science/film.mp4', 18 * mebibyte],
])
```

Replace the existing generic 100MiB assertion inside the loop and the aggregate assertion after the loop with:

```js
  const maxBytes = maxBytesByVideo.get(video)
  assert(size <= maxBytes, `${video} exceeds its ${maxBytes / mebibyte}MiB web-preview budget`)
  totalBytes += size
}
assert(totalBytes <= 50 * mebibyte, 'Published video previews exceed the 50MiB total budget')
```

- [ ] **Step 2: Run verification and confirm the current videos fail**

Run: `pnpm run verify:video-loading`

Expected: FAIL on at least `public/work/aigc-video-01/video.mp4` because the current copy is about 17.5MiB.

- [ ] **Step 3: Commit the failing budget contract**

```powershell
git add -- scripts/verify-video-loading.mjs
git commit -m "test: enforce lightweight video preview budgets"
```

### Task 2: Make the encoder reproducible from source masters

**Files:**
- Modify: `scripts/optimize-videos.ps1`
- Test: `scripts/optimize-videos.ps1`

**Interfaces:**
- Consumes: mandatory `-SourceRoot` pointing to `C:\Users\Mayn\Desktop\作品集` and the repository root derived from `$PSScriptRoot`.
- Produces: the same six website destination files, each validated by ffprobe before atomic replacement.

- [ ] **Step 1: Replace the destination-only list with explicit source mappings**

Add a mandatory parameter and job table:

```powershell
param(
  [Parameter(Mandatory = $true)]
  [string] $SourceRoot
)

$sourceRootPath = [IO.Path]::GetFullPath($SourceRoot)
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$jobs = @(
  @{ Source = '作品/4三维视觉/面霜视频终.mp4'; Destination = 'public/work/3d-01/video.mp4' },
  @{ Source = '作品/5AIGC视频广告/精华液广告.mp4'; Destination = 'public/work/aigc-video-01/video.mp4' },
  @{ Source = '作品/5AIGC视频广告/精华液广告2.mp4'; Destination = 'public/work/aigc-video-02/video.mp4' },
  @{ Source = '作品/5AIGC视频广告/投影仪广告.mp4'; Destination = 'public/work/aigc-video-03/video.mp4' },
  @{ Source = '项目/瑞美亚面霜广告.mp4'; Destination = 'public/work/remeya-cream/ad.mp4' },
  @{ Source = '免疫细胞科普（身体里的接力赛）/免疫细胞科普短片 (1).mp4'; Destination = 'public/work/immune-cell-science/film.mp4' }
)
```

- [ ] **Step 2: Encode each job from the source master with the approved 1080p settings**

For every mapping, resolve and validate both paths, create a sibling `.preview.mp4`, and run:

```powershell
& ffmpeg -hide_banner -y -i $source `
  -map 0:v:0 -map '0:a?' `
  -vf "scale='if(gte(iw,ih),min(iw,1920),-2)':'if(gte(iw,ih),-2,min(ih,1920))'" `
  -fpsmax 30 `
  -c:v libx264 -preset slow -crf 25 -maxrate 2M -bufsize 4M `
  -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart `
  -c:a aac -b:a 96k `
  $output
```

The source path must start with `$sourceRootPath`; the destination path must start with `$projectRoot`. Abort if either check fails or a source is missing.

- [ ] **Step 3: Validate each output before replacement**

Use ffprobe to read `codec_name`, `pix_fmt`, `width`, `height`, `r_frame_rate`, and `duration`. Require:

```powershell
$video.codec_name -eq 'h264'
$video.pix_fmt -eq 'yuv420p'
[Math]::Max([int]$video.width, [int]$video.height) -le 1920
$fps -le 30.01
[double]$probe.format.duration -gt 0
```

Only after these checks pass, use `Move-Item -LiteralPath $output -Destination $destination -Force`.

- [ ] **Step 4: Run the encoder from the repository**

Run in PowerShell 7 with FFmpeg available:

```powershell
& .\scripts\optimize-videos.ps1 -SourceRoot 'C:\Users\Mayn\Desktop\作品集'
```

Expected: all six jobs report successful encoding and validation; no original source timestamp or size changes.

- [ ] **Step 5: Run the size-budget contract**

Run: `pnpm run verify:video-loading`

Expected: `Video loading verification passed`.

- [ ] **Step 6: Commit the encoder and generated website previews**

```powershell
git add -- scripts/optimize-videos.ps1 scripts/verify-video-loading.mjs public/work/3d-01/video.mp4 public/work/aigc-video-01/video.mp4 public/work/aigc-video-02/video.mp4 public/work/aigc-video-03/video.mp4 public/work/remeya-cream/ad.mp4 public/work/immune-cell-science/film.mp4
git commit -m "perf: publish lightweight 1080p video previews"
```

### Task 3: Quality-check, build, and publish

**Files:**
- Verify: all six generated website video copies.
- Publish with: `scripts/publish_github_repository.ps1`.

**Interfaces:**
- Consumes: committed, validated preview files and the existing GitHub credential.
- Produces: an updated GitHub `main` branch and successful GitHub Pages deployment.

- [ ] **Step 1: Record final file sizes and codec metadata**

Run ffprobe for all six files and report filename, size in MiB, duration, codec, dimensions, pixel format, and frame rate. Confirm every per-file and total budget passes.

- [ ] **Step 2: Perform one visual quality pass**

Capture frames near the beginning, middle, and end of each source master and corresponding preview. Inspect all comparisons together for facial detail, product typography, edges, highlights, color banding, black frames, and aspect-ratio errors. If one preview has a material defect, re-encode only that file from its source master with `-crf 24` while retaining the 2Mbps maximum.

- [ ] **Step 3: Run the complete project verification**

```powershell
pnpm run verify:video-loading
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
git status --short
```

Expected: both verification scripts pass, lint exits 0 with only the pre-existing Fast Refresh warning allowed, build succeeds, and the working tree is clean after committing any quality adjustment.

- [ ] **Step 4: Verify playback locally in a browser**

Open the AIGC, 3D, featured-project, and immune-cell viewers. Confirm every video shows its poster before click, begins loading after click, reaches a nonzero `currentTime`, has no media error, and restores the poster after the viewer is reopened.

- [ ] **Step 5: Publish through the existing GitHub API publisher**

Run in PowerShell 7:

```powershell
& .\scripts\publish_github_repository.ps1 -ProjectRoot (Get-Location).Path -Owner ygystyrdqd-lab -Repository tingting-portfolio
```

Expected: output ends with `PUBLISHED_FILES=...`, `TREE=...`, and `COMMIT=...`.

- [ ] **Step 6: Verify the Pages deployment and all online video assets**

Confirm the workflow for the reported commit ends with `conclusion: success`. For each of the six public video URLs, request bytes `0-31` and require `206 Partial Content`, `video/mp4`, and a total size matching the new local preview.

- [ ] **Step 7: Perform the online acceptance check**

Open one short video and the 61-second video on the public site. Confirm the poster appears immediately, native controls appear after clicking, `currentTime` becomes greater than zero, and no media error is reported. Report the live URL, published commit SHA, workflow URL, final total video size, and test results.
