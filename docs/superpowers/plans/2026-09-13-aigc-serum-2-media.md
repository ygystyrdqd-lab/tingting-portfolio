# 瑞美亚精华液广告2接入实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 AIGC 视频广告分类新增第三张“瑞美亚精华液广告2”卡片与可播放视频。

**Architecture:** 沿用 `workCategories.js` 的项目数组、`WorkCategoryPage.jsx` 的三项目布局和 `MediaViewer.jsx` 的视频弹窗，不新建 UI 组件。把用户原始素材转换为站点目录中的 WebP 封面与 H.264/AAC MP4；以独立验证脚本防止封面、视频或卡片映射遗漏。

**Tech Stack:** React、Vite、Node.js 验证脚本、FFmpeg。

**Spec:** `docs/superpowers/specs/2026-09-13-aigc-serum-2-media-design.md`

## Global Constraints

- 项目名称必须为 `瑞美亚精华液广告2`，元信息为 `AIGC · BEAUTY AD`，项目 ID 为 `aigc-video-03`。
- 第三张卡片排在现有两张卡片后；前两张卡片及其视频地址不改。
- 原始 `精华液视频广告2封面.png` 与 `精华液广告2.mp4` 不覆盖、不删除。
- 新站点素材仅放在 `public/work/aigc-video-03/`；视频使用 H.264/AAC MP4、`faststart`，压缩后低于源文件 23,664,271 字节。
- 只在本地接入与验证，本次不推送或部署。

---

### Task 1: 制作并核对站点媒体

**Files:**
- Create: `public/work/aigc-video-03/cover.webp`
- Create: `public/work/aigc-video-03/video.mp4`

**Interfaces:**
- Consumes: `作品/5AIGC视频广告/精华液视频广告2封面.png` 与 `作品/5AIGC视频广告/精华液广告2.mp4`
- Produces: `/work/aigc-video-03/cover.webp` 与 `/work/aigc-video-03/video.mp4`

- [ ] **Step 1: 核对源文件与 FFmpeg。** 在 `portfolio-site` 执行：

```powershell
Get-Item -LiteralPath '..\作品\5AIGC视频广告\精华液视频广告2封面.png','..\作品\5AIGC视频广告\精华液广告2.mp4' | Select-Object Name,Length
Get-Command ffmpeg -ErrorAction SilentlyContinue
```

若 PATH 中没有 FFmpeg，使用此前获批安装的 `C:\Users\Mayn\AppData\Local\Temp\codex-remeya-ffmpeg-20260912\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe`；若沙箱拒绝读取，用带说明的升级权限命令，不绕过审批。以 `& $ffmpegExe -hide_banner -i '..\作品\5AIGC视频广告\精华液广告2.mp4'` 读取分辨率、帧率、声音信息。

- [ ] **Step 2: 记录源文件 SHA-256。**

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath '..\作品\5AIGC视频广告\精华液视频广告2封面.png','..\作品\5AIGC视频广告\精华液广告2.mp4'
```

- [ ] **Step 3: 生成 WebP 与压缩 MP4。** `$ffmpegExe` 设为上一步实际找到的完整可执行路径；在 `portfolio-site` 执行：

```powershell
if (Test-Path -LiteralPath 'public\work\aigc-video-03\cover.webp') { throw 'Destination cover already exists' }
if (Test-Path -LiteralPath 'public\work\aigc-video-03\video.mp4') { throw 'Destination video already exists' }
New-Item -ItemType Directory -Path 'public\work\aigc-video-03' -Force | Out-Null
& $ffmpegExe -hide_banner -n -i '..\作品\5AIGC视频广告\精华液视频广告2封面.png' -vf 'scale=1600:-1:flags=lanczos' -frames:v 1 -c:v libwebp -q:v 90 'public\work\aigc-video-03\cover.webp'
& $ffmpegExe -hide_banner -n -i '..\作品\5AIGC视频广告\精华液广告2.mp4' -map 0:v:0 -map '0:a?' -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart 'public\work\aigc-video-03\video.mp4'
```

- [ ] **Step 4: 核对输出与源文件未变。**

```powershell
Get-Item -LiteralPath 'public\work\aigc-video-03\cover.webp','public\work\aigc-video-03\video.mp4' | Select-Object Name,Length
Get-FileHash -Algorithm SHA256 -LiteralPath '..\作品\5AIGC视频广告\精华液视频广告2封面.png','..\作品\5AIGC视频广告\精华液广告2.mp4'
& $ffmpegExe -hide_banner -i 'public\work\aigc-video-03\video.mp4'
```

期望：两个输出非空；视频小于 23,664,271 字节，时长、比例、帧率、声音与源文件相符。根据 Step 1 读取的实际时长，分别在约 10%、50%、90% 时间点从源与输出抽帧，目视对比文字、产品边缘和渐变。抽帧存放在 `portfolio-site/.verify-aigc-serum2/`；验证后先列出、核对路径及确切文件名，再删除单个截图与空目录，不递归删除。

- [ ] **Step 5: 提交媒体文件。**

```powershell
git add -- public/work/aigc-video-03/cover.webp public/work/aigc-video-03/video.mp4
git diff --cached --check
git commit -m "assets: add optimized AIGC serum ad 2 media"
```

### Task 2: 接入第三张卡片并验证页面

**Files:**
- Modify: `src/data/workCategories.js` 的 `slug: 'aigc-video'` 项目数组
- Create: `scripts/verify-aigc-serum2.mjs`

**Interfaces:**
- Consumes: Task 1 的 `/work/aigc-video-03/cover.webp` 与 `/work/aigc-video-03/video.mp4`
- Produces: 第三张卡片和同名视频查看器

- [ ] **Step 1: 先写失败的静态验证脚本。** 用 `apply_patch` 创建 `scripts/verify-aigc-serum2.mjs`：

```js
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

const data = readFileSync(new URL('../src/data/workCategories.js', import.meta.url), 'utf8')
const section = data.split("slug: 'aigc-video'")[1]?.split('const rawFeaturedWorkCategories')[0] ?? ''
assert.equal((section.match(/id: 'aigc-video-/g) ?? []).length, 3)
assert.match(section, /id: 'aigc-video-03'[\s\S]*?title: '瑞美亚精华液广告2'/)
assert.match(section, /cover: '\/work\/aigc-video-03\/cover.webp'/)
assert.match(section, /src: '\/work\/aigc-video-03\/video.mp4'/)
assert.match(section, /poster: '\/work\/aigc-video-03\/cover.webp'/)
assert.ok(statSync(new URL('../public/work/aigc-video-03/cover.webp', import.meta.url)).size > 0)
const videoSize = statSync(new URL('../public/work/aigc-video-03/video.mp4', import.meta.url)).size
assert.ok(videoSize > 0 && videoSize < 23_664_271)
console.log('AIGC 精华液广告2素材与映射验证通过')
```

- [ ] **Step 2: 运行红灯测试。** `node scripts/verify-aigc-serum2.mjs`，期望因项目数组仍只有两项而失败。

- [ ] **Step 3: 只追加第三个项目对象。** 在 `src/data/workCategories.js` 的第二个 `aigc-video-02` 对象之后，用 `apply_patch` 插入：

```js
{
  id: 'aigc-video-03',
  title: '瑞美亚精华液广告2',
  meta: 'AIGC · BEAUTY AD',
  cover: '/work/aigc-video-03/cover.webp',
  media: [{
    type: 'video',
    src: '/work/aigc-video-03/video.mp4',
    poster: '/work/aigc-video-03/cover.webp',
  }],
},
```

- [ ] **Step 4: 运行绿灯与项目检查。**

```powershell
node scripts/verify-aigc-serum2.mjs
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
git diff --check
```

- [ ] **Step 5: 浏览器验收。** 在本地 `http://localhost:5173/?category=aigc-video` 确认三张项目卡片；第三张封面显示、点击后视频元数据可读取并正常播放，关闭查看器后节点移除；刷新二级页面仍正确。只做一次桌面检查，有缺陷集中修复并复查一次。

- [ ] **Step 6: 提交页面与验证脚本。**

```powershell
git add -- src/data/workCategories.js scripts/verify-aigc-serum2.mjs
git diff --cached --check
git commit -m "feat: add third AIGC serum video project"
git status --short
```

验收完成后向用户提供本地预览地址与压缩前后大小；不推送、不部署。
