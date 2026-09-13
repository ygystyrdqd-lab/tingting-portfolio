# “身体里的接力赛”项目卡片实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页“项目”屏新增第 4 张“免疫细胞科普（身体里的接力赛）”卡片，点击后直接播放压缩版短片。

**Architecture:** 沿用 `featuredWorkCategories` 的单项目数据结构、`Projects` 的堆叠卡片和 `MediaViewer` 的全屏视频弹窗。只增加一个素材目录、一条数据、第四卡片的主题/长标题样式和一个静态验证脚本，不创建二级页面。

**Tech Stack:** React、Vite、CSS、Node.js 验证脚本、FFmpeg。

**Spec:** `docs/superpowers/specs/2026-09-13-immune-cell-project-design.md`

## Global Constraints

- 卡片与弹窗标题必须为 `免疫细胞科普（身体里的接力赛）`，编号为 `04`，元信息为 `SCIENCE · SHORT FILM`。
- 新卡片位于前三张之后；前三张卡片、媒体、导航和其他页面不变。
- 源 PNG 与 MP4 不覆盖、不删除；站点封面与视频分别为 `public/work/immune-cell-science/cover.webp`、`public/work/immune-cell-science/film.mp4`。
- 视频保留 2508 × 1440、60 fps、画面比例及立体声音轨，编码为支持浏览器播放的 H.264/AAC MP4，文件小于 222,516,269 字节；优先保画质。
- 本次只做本地提交、构建及浏览器验收，不推送、不部署。

---

### Task 1: 制作和验证网页媒体

**Files:**
- Create: `public/work/immune-cell-science/cover.webp`
- Create: `public/work/immune-cell-science/film.mp4`

**Interfaces:**
- Consumes: `../免疫细胞科普（身体里的接力赛）/细胞科普封面.png` 和 `../免疫细胞科普（身体里的接力赛）/免疫细胞科普短片 (1).mp4`
- Produces: `/work/immune-cell-science/cover.webp` 和 `/work/immune-cell-science/film.mp4`

- [ ] **Step 1: 核对源文件和编码器。** 在 `portfolio-site` 执行：

```powershell
Get-Item -LiteralPath '..\免疫细胞科普（身体里的接力赛）\细胞科普封面.png','..\免疫细胞科普（身体里的接力赛）\免疫细胞科普短片 (1).mp4' | Select-Object Name,Length
Get-FileHash -Algorithm SHA256 -LiteralPath '..\免疫细胞科普（身体里的接力赛）\细胞科普封面.png','..\免疫细胞科普（身体里的接力赛）\免疫细胞科普短片 (1).mp4'
Get-Command ffmpeg -ErrorAction SilentlyContinue
```

PATH 中没有 FFmpeg 时使用已获批安装的 `C:\Users\Mayn\AppData\Local\Temp\codex-remeya-ffmpeg-20260912\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe`。如沙箱拒绝访问，提交带用途说明的升级权限请求。`& $ffmpegExe -hide_banner -i '..\免疫细胞科普（身体里的接力赛）\免疫细胞科普短片 (1).mp4'` 应报告约 61.81 秒、2508 × 1440、60 fps、H.264/AAC 立体声。

- [ ] **Step 2: 生成站点素材。** `$ffmpegExe` 取 Step 1 实际找到的完整路径；先确认两个目标均不存在，再执行：

```powershell
if (Test-Path -LiteralPath 'public\work\immune-cell-science\cover.webp') { throw 'Cover destination exists' }
if (Test-Path -LiteralPath 'public\work\immune-cell-science\film.mp4') { throw 'Video destination exists' }
New-Item -ItemType Directory -Path 'public\work\immune-cell-science' | Out-Null
& $ffmpegExe -hide_banner -n -i '..\免疫细胞科普（身体里的接力赛）\细胞科普封面.png' -vf 'scale=1600:-1:flags=lanczos' -frames:v 1 -c:v libwebp -q:v 90 'public\work\immune-cell-science\cover.webp'
& $ffmpegExe -hide_banner -n -i '..\免疫细胞科普（身体里的接力赛）\免疫细胞科普短片 (1).mp4' -map 0:v:0 -map '0:a?' -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart 'public\work\immune-cell-science\film.mp4'
```

- [ ] **Step 3: 验证尺寸、媒体属性和画质。**

```powershell
Get-Item -LiteralPath 'public\work\immune-cell-science\cover.webp','public\work\immune-cell-science\film.mp4' | Select-Object Name,Length
Get-FileHash -Algorithm SHA256 -LiteralPath '..\免疫细胞科普（身体里的接力赛）\细胞科普封面.png','..\免疫细胞科普（身体里的接力赛）\免疫细胞科普短片 (1).mp4'
& $ffmpegExe -hide_banner -i 'public\work\immune-cell-science\film.mp4'
```

源文件 SHA-256 应与 Step 1 一致；输出视频小于 222,516,269 字节，时长、分辨率、帧率和声音与源一致。抽取 6、31、56 秒画面进行目视对比：

```powershell
New-Item -ItemType Directory -Path '.verify-immune-cell' | Out-Null
$sourceVideo = '..\免疫细胞科普（身体里的接力赛）\免疫细胞科普短片 (1).mp4'
$siteVideo = 'public\work\immune-cell-science\film.mp4'
foreach ($second in @(6,31,56)) {
  & $ffmpegExe -hide_banner -loglevel error -n -ss $second -i $sourceVideo -frames:v 1 -vf 'scale=1280:-1:flags=lanczos' ".verify-immune-cell\source-$second.png"
  & $ffmpegExe -hide_banner -loglevel error -n -ss $second -i $siteVideo -frames:v 1 -vf 'scale=1280:-1:flags=lanczos' ".verify-immune-cell\site-$second.png"
}
```

比较文字、细胞轮廓及渐变。若 CRF 21 出现明显损伤，用相同参数和 `-crf 20` 在 `.verify-immune-cell/film-crf20.mp4` 重编，对比通过且小于源文件后，再用确切路径替换自己刚生成的 `film.mp4`。清理临时帧前核对目录与精确文件名，不递归删除。

- [ ] **Step 4: 提交优化媒体。**

```powershell
git add -- public/work/immune-cell-science/cover.webp public/work/immune-cell-science/film.mp4
git diff --cached --check
git commit -m "assets: add optimized immune cell science film"
```

### Task 2: 新增卡片、长标题样式与回归验证

**Files:**
- Modify: `src/data/workCategories.js` 的 `rawFeaturedWorkCategories`
- Modify: `src/App.jsx` 的 `projectClasses`
- Modify: `src/App.css` 的项目卡片主题规则
- Create: `scripts/verify-immune-cell-project.mjs`

**Interfaces:**
- Consumes: Task 1 的 `cover.webp` 与 `film.mp4`
- Produces: `#projects` 的第四张卡片及点击后的同名视频查看器

- [ ] **Step 1: 先写失败的静态验证。** 用 `apply_patch` 创建 `scripts/verify-immune-cell-project.mjs`：

```js
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

const data = readFileSync(new URL('../src/data/workCategories.js', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const featured = data.split('const rawFeaturedWorkCategories = [')[1]?.split('const resolveCategoryAssets')[0] ?? ''
assert.equal((featured.match(/slug: '/g) ?? []).length, 4)
const immune = featured.split("slug: 'immune-cell-science'")[1] ?? ''
assert.match(immune, /title: '免疫细胞科普（身体里的接力赛）'/)
assert.match(immune, /meta: 'SCIENCE · SHORT FILM'/)
assert.match(immune, /cover: '\/work\/immune-cell-science\/cover.webp'/)
assert.match(immune, /src: '\/work\/immune-cell-science\/film.mp4'/)
assert.match(app, /'project-four'/)
assert.match(css, /\.project-four\s*\{/)
assert.ok(statSync(new URL('../public/work/immune-cell-science/cover.webp', import.meta.url)).size > 0)
const videoSize = statSync(new URL('../public/work/immune-cell-science/film.mp4', import.meta.url)).size
assert.ok(videoSize > 0 && videoSize < 222_516_269)
console.log('免疫细胞科普项目卡片与素材验证通过')
```

- [ ] **Step 2: 运行红灯测试。** `node scripts/verify-immune-cell-project.mjs` 应因精选项目只有三项而失败。

- [ ] **Step 3: 在数据数组末尾追加项目。** 用 `apply_patch` 在 `rawFeaturedWorkCategories` 的第三个对象后追加：

```js
{
  number: '04',
  slug: 'immune-cell-science',
  title: '免疫细胞科普（身体里的接力赛）',
  en: 'Immune Cell Science Film',
  description: '免疫细胞科普短片的影像展示。',
  theme: { accent: '#c7a071', glow: 'rgba(199,160,113,.22)' },
  projects: [{
    id: 'immune-cell-science-01',
    title: '免疫细胞科普（身体里的接力赛）',
    meta: 'SCIENCE · SHORT FILM',
    cover: '/work/immune-cell-science/cover.webp',
    media: [{ type: 'video', src: '/work/immune-cell-science/film.mp4', poster: '/work/immune-cell-science/cover.webp' }],
  }],
},
```

- [ ] **Step 4: 赋予第四卡片已有系统内的主题和排版。** 用 `apply_patch` 将 `src/App.jsx` 的 `projectClasses` 末尾加入 `'project-four'`；在 `src/App.css` 的现有 `.project-three` 后追加：

```css
.project-four{background:#332b24;--teaser-tint:rgba(177,137,89,.2)}
.project-four .project-footer h3{max-width:calc(100% - 78px);font-size:clamp(26px,3.4vw,46px);line-height:1.16;letter-spacing:-.035em;text-wrap:balance}
```

- [ ] **Step 5: 跑验证与构建。**

```powershell
node scripts/verify-immune-cell-project.mjs
pnpm run verify:remeya-project
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
git diff --check
```

- [ ] **Step 6: 浏览器验收。** 本地打开 `http://localhost:5173/#projects`；确认四张卡片、第四张封面和完整标题，点击后检查没有网站导航、视频元数据与播放，关闭后确认节点卸载；刷新仍显示第四张。只做一次桌面截图检查，集中修复后最多复查一次。

- [ ] **Step 7: 提交代码并核对工作区。**

```powershell
git add -- src/data/workCategories.js src/App.jsx src/App.css scripts/verify-immune-cell-project.mjs
git diff --cached --check
git commit -m "feat: add immune cell science project card"
git status --short
```

向用户报告本地预览地址、媒体压缩前后体积与验证结果；不推送、不部署。
