# 瑞美亚面霜新版封面与视频压缩 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the Projects-screen 瑞美亚面霜广告 cover and replace its 66 MB local video with a visually sound 1080p web MP4.

**Architecture:** Retain the current `featuredWorkCategories` paths and `MediaViewer` contract, replacing only the bytes of `public/work/remeya-cream/cover.jpg` and `public/work/remeya-cream/ad.mp4`. Encode to a separate temporary file, validate it, then replace the website MP4. Extend the existing asset verification script to catch regressions in cover freshness and video size.

**Tech Stack:** Vite static assets, Node.js verification, FFmpeg from the `imageio-ffmpeg` Windows wheel, PowerShell.
**Spec:** `docs/superpowers/specs/2026-09-12-remeya-cream-project-card-design.md`

## Global Constraints

- Keep the source files in `C:/Users/Mayn/Desktop/作品集/项目` untouched.
- Keep the project's third featured card name, order, Spotlight behavior, and full-screen viewer unchanged.
- Preserve the source's 1922×1080 picture, approximately 29.9-second duration, and audio when present; output H.264 MP4 with AAC audio when present.
- Aim for about 15–25 MB, but reject visibly damaged product text, cream jar, or gold lighting even if the file meets the size goal.
- Do not deploy or push. Old 66 MB bytes remain in existing Git history; address that at the separate publication step, not by rewriting history here.

---

### Task 1: Replace and verify both media assets

**Files:**
- Modify binary: `public/work/remeya-cream/cover.jpg`, `public/work/remeya-cream/ad.mp4`
- Modify: `scripts/verify-remeya-project.mjs`
- No changes needed to `src/data/workCategories.js`, which already points to these two asset paths.

**Interfaces:**
- Consumes: `featuredWorkCategories[2].projects[0]` already supplies `cover: '/work/remeya-cream/cover.jpg'` and video `src: '/work/remeya-cream/ad.mp4'` with matching poster.
- Produces: the same asset URLs with refreshed, smaller bytes; no React API change.

- [ ] **Step 1: Strengthen the verification script before replacing assets.** In `scripts/verify-remeya-project.mjs`, keep the current data/path assertions and add:

```js
const coverSize = statSync(new URL('../public/work/remeya-cream/cover.jpg', import.meta.url)).size
const videoSize = statSync(new URL('../public/work/remeya-cream/ad.mp4', import.meta.url)).size
assert(coverSize > 500_000, `Cream cover looks stale: ${coverSize} bytes`)
assert(videoSize > 0 && videoSize < 66_011_132, `Cream video was not compressed: ${videoSize} bytes`)
```

- [ ] **Step 2: Run `pnpm run verify:remeya-project`; expect failure because the current cover is 106,849 bytes and video is 66,011,132 bytes.**
- [ ] **Step 3: Obtain FFmpeg without adding a project dependency.** Check whether a usable FFmpeg binary is already available. If not, request the required network/installation approval and use the bundled Python executable to install the official `imageio-ffmpeg` 0.6.0 wheel into a task-specific temporary directory with `pip --no-cache-dir --target`. Its [official repository](https://github.com/imageio/imageio-ffmpeg) documents that the Windows wheel includes an FFmpeg executable and exposes `get_ffmpeg_exe()`. Do not silently install system-wide software. Resolve the executable using `imageio_ffmpeg.get_ffmpeg_exe()` after adding that temporary directory to `sys.path`.
- [ ] **Step 4: Encode from the original MP4 to a separate temporary MP4.** Use FFmpeg with optional audio mapping and fast-start layout; do not scale or crop:

```powershell
& $ffmpegExe -hide_banner -y -i 'C:\Users\Mayn\Desktop\作品集\项目\瑞美亚面霜广告.mp4' -map 0:v:0 -map '0:a?' -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart $encodedVideoPath
```

- [ ] **Step 5: Validate the candidate before replacement.** Inspect FFmpeg metadata for duration, 1922×1080 resolution, H.264 codec and optional AAC audio. Extract diagnostic stills from source and candidate at 3, 15, and 27 seconds; visually compare product jar, brand lettering, and gold light. If the file is larger than 25 MB and detail is intact, retry once at CRF 23; if it looks worse, keep the CRF 22 candidate and report the size trade-off. If FFmpeg or the browser cannot decode the candidate, do not replace the website file.
- [ ] **Step 6: Replace the website assets only after validation.** Copy `C:/Users/Mayn/Desktop/作品集/项目/瑞美亚面霜广告封面.jpg` to `public/work/remeya-cream/cover.jpg`, and copy the accepted candidate to `public/work/remeya-cream/ad.mp4`. Leave both originals untouched.
- [ ] **Step 7: Run `pnpm run verify:remeya-project`, `pnpm run verify:desktop-experience`, `pnpm run lint`, `pnpm run build`, and `git diff --check`; expect passes apart from any pre-existing unrelated lint warning.**
- [ ] **Step 8: In the local browser, inspect the third Projects card's new cover and open the full-screen viewer. Confirm the new poster, 1080p video loading/playback, native controls, and close button; check the other two cards remain unchanged.**
- [ ] **Step 9: Commit only the two asset replacements and verification-script change. Do not push or deploy.**

## Self-review

- The spec's refreshed cover, H.264/AAC 1080p video, source preservation, quality review, browser check, local-only status, and future Git-history caveat are covered above.
- The existing public URLs are stable, so no component, route, or data-file edit is necessary.
