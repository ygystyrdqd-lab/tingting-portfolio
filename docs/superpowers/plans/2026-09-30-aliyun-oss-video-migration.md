# 阿里云 OSS 视频迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将作品集的 6 个公开视频迁移到阿里云 OSS，并保证线上首次播放、关闭后再次播放和拖动进度条均正常。

**Architecture:** GitHub Pages 继续托管 React 网站和封面图片，华南 1（深圳）的独立公共读 OSS Bucket 仅托管视频。网站通过一个集中式媒体配置模块生成 OSS URL；播放器继续延迟加载，并在关闭时释放媒体请求。

**Tech Stack:** React 19、Vite 8、阿里云 OSS、GitHub Pages、PowerShell、Node.js 验证脚本
**Spec:** `docs/superpowers/specs/2026-09-30-aliyun-oss-video-migration-design.md`

## Global Constraints

- OSS 地域固定为华南 1（深圳）。
- Bucket 仅公共读、私有写；不得把 AccessKey 写入仓库、前端代码或命令输出。
- 视频对象统一放入 `portfolio/videos/`。
- 每个对象必须使用 `Content-Type: video/mp4` 与 `Cache-Control: public, max-age=31536000, immutable`。
- 正式 CORS 仅允许 `https://ygystyrdqd-lab.github.io` 的 `GET`、`HEAD` 请求。
- 线上验收前保留仓库中的本地视频副本，确保可立即回退。
- 本次不接入 CDN、私有签名 URL、HLS 或自定义域名。

---

### Task 1: 创建并配置 OSS Bucket

**Files:**
- Create: `docs/deployment/aliyun-oss-media.md`

**Interfaces:**
- Consumes: 用户已登录的阿里云控制台会话。
- Produces: `bucketName`、`publicEndpoint` 和完成配置的公共读 Bucket；后续任务用 `https://${bucketName}.${publicEndpoint}` 组成基础 URL。

- [ ] **Step 1: 在阿里云 OSS 控制台创建 Bucket**

创建参数：

```text
候选名称：tingting-portfolio-media-20260930
名称冲突时：依次追加 -01、-02，使用第一个可用名称
地域：华南 1（深圳）
存储类型：标准存储
同城冗余：关闭
版本控制：关闭
读写权限：公共读
服务端加密：无
实时日志查询：关闭
```

- [ ] **Step 2: 配置正式站点 CORS**

```text
来源：https://ygystyrdqd-lab.github.io
允许方法：GET, HEAD
允许 Headers：*
暴露 Headers：ETag, Content-Length, Content-Range, Accept-Ranges
缓存时间：86400
返回 Vary: Origin：开启
```

- [ ] **Step 3: 记录部署信息**

在 `docs/deployment/aliyun-oss-media.md` 写入控制台显示的实际创建结果，字段固定为 `Bucket`、`Region`、`Public endpoint`、`Object prefix` 和 `Production origin`。`Region` 写 `oss-cn-shenzhen`，`Public endpoint` 写 `oss-cn-shenzhen.aliyuncs.com`，`Object prefix` 写 `portfolio/videos/`，`Production origin` 写 `https://ygystyrdqd-lab.github.io`；`Bucket` 必须写控制台刚刚创建成功的完整名称。

- [ ] **Step 4: 检查文档不包含密钥**

Run:

```powershell
rg -n "AccessKey|Secret|SecurityToken|Bearer" docs/deployment/aliyun-oss-media.md
```

Expected: 仅出现说明性文字或无输出，不出现任何凭据值。

- [ ] **Step 5: Commit**

```powershell
git add docs/deployment/aliyun-oss-media.md
git commit -m "docs: record OSS media deployment"
```

### Task 2: 上传 6 个视频并验证对象响应

**Files:**
- Create: `scripts/verify-oss-videos.mjs`
- Read: `public/work/3d-01/video.lite.mp4`
- Read: `public/work/aigc-video-01/video.lite.mp4`
- Read: `public/work/aigc-video-02/video.lite.mp4`
- Read: `public/work/aigc-video-03/video.lite.mp4`
- Read: `public/work/remeya-cream/ad.lite.mp4`
- Read: `public/work/immune-cell-science/film.lite.mp4`

**Interfaces:**
- Consumes: Task 1 的 `bucketName` 与 `publicEndpoint`。
- Produces: 6 个可公开读取的稳定 OSS URL，以及接受一个基础 URL 参数的 `scripts/verify-oss-videos.mjs` 验证命令。

- [ ] **Step 1: 在 Bucket 中创建 `portfolio/videos/` 并上传文件**

使用以下一一对应关系：

```text
public/work/3d-01/video.lite.mp4                 -> portfolio/videos/3d-cream.mp4
public/work/aigc-video-01/video.lite.mp4         -> portfolio/videos/serum-ad-01.mp4
public/work/aigc-video-02/video.lite.mp4         -> portfolio/videos/serum-ad-02.mp4
public/work/aigc-video-03/video.lite.mp4         -> portfolio/videos/projector-ad.mp4
public/work/remeya-cream/ad.lite.mp4             -> portfolio/videos/remeya-cream-ad.mp4
public/work/immune-cell-science/film.lite.mp4    -> portfolio/videos/immune-cell-film.mp4
```

- [ ] **Step 2: 批量设置对象元数据**

每个对象设置：

```text
Content-Type: video/mp4
Cache-Control: public, max-age=31536000, immutable
Content-Disposition: 不设置
ACL: 继承 Bucket
```

- [ ] **Step 3: 写失败的 OSS 响应验证脚本**

`scripts/verify-oss-videos.mjs`：

```js
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
  if (response.status !== 206) throw new Error(`${file}: expected 206, got ${response.status}`)
  if (!response.headers.get('content-type')?.startsWith('video/mp4')) throw new Error(`${file}: invalid Content-Type`)
  if (!response.headers.get('content-range')?.startsWith('bytes 0-1023/')) throw new Error(`${file}: invalid Content-Range`)
  if (response.headers.get('access-control-allow-origin') !== 'https://ygystyrdqd-lab.github.io') throw new Error(`${file}: invalid CORS origin`)
}

console.log('OSS video verification passed')
```

- [ ] **Step 4: 在上传前或使用错误地址运行，确认检查失败**

Run:

```powershell
$bucketLine = Select-String -Path docs/deployment/aliyun-oss-media.md -Pattern '^- Bucket:' | Select-Object -First 1
$bucketName = ($bucketLine.Line -split ':', 2)[1].Trim().Trim('`')
$ossVideoBaseUrl = "https://$bucketName.oss-cn-shenzhen.aliyuncs.com/portfolio/videos"
node scripts/verify-oss-videos.mjs $ossVideoBaseUrl
```

Expected: 上传或元数据未完成时 FAIL，并明确指出缺失对象或错误响应头。运行前必须把命令中的尖括号替换为 Task 1 的真实 Bucket 名称。

- [ ] **Step 5: 完成上传和元数据设置后重新运行**

Run: 与 Step 4 相同的实际 URL 命令。

Expected: `OSS video verification passed`

- [ ] **Step 6: Commit**

```powershell
git add scripts/verify-oss-videos.mjs
git commit -m "test: verify OSS video delivery"
```

### Task 3: 将网站视频源切换到 OSS

**Files:**
- Create: `.env.production`
- Create: `src/config/videoAssets.js`
- Modify: `src/data/workCategories.js`
- Modify: `scripts/verify-video-loading.mjs`
- Test: `scripts/verify-video-loading.mjs`

**Interfaces:**
- Consumes: Task 1 的实际 OSS 基础 URL和 Task 2 的 6 个对象名称。
- Produces: `videoAssets` 只读对象，键为 `cream3d`、`serum01`、`serum02`、`projector`、`remeyaCream`、`immuneCell`，值为完整 HTTPS URL。

- [ ] **Step 1: 先修改专项检查使其要求集中式 OSS 配置**

在 `scripts/verify-video-loading.mjs` 加入：

```js
const config = await read('src/config/videoAssets.js')
assert(data.includes("from '../config/videoAssets'"), 'Work data must import centralized OSS video assets')
assert((data.match(/videoAssets\./g) || []).length === 6, 'All six videos must use centralized OSS URLs')
assert(config.includes('VITE_OSS_VIDEO_BASE_URL'), 'OSS base URL must come from the production environment')
assert(!data.includes('.lite.mp4'), 'Published work data must not use GitHub Pages video paths')
```

并把 `config` 加到现有 `Promise.all` 读取列表。

- [ ] **Step 2: 运行专项检查确认失败**

Run:

```powershell
pnpm run verify:video-loading
```

Expected: FAIL，提示缺少 `src/config/videoAssets.js` 或集中式视频配置。

- [ ] **Step 3: 创建集中式视频配置**

先从 Task 1 的部署文档读出实际 Bucket 名称，并创建生产环境文件：

```powershell
$bucketLine = Select-String -Path docs/deployment/aliyun-oss-media.md -Pattern '^- Bucket:' | Select-Object -First 1
$bucketName = ($bucketLine.Line -split ':', 2)[1].Trim().Trim('`')
$envLine = "VITE_OSS_VIDEO_BASE_URL=https://$bucketName.oss-cn-shenzhen.aliyuncs.com/portfolio/videos"
```

使用 `apply_patch` 创建 `.env.production`，文件内容必须是 `$envLine` 的实际输出。随后创建 `src/config/videoAssets.js`：

```js
const ossVideoBaseUrl = import.meta.env.VITE_OSS_VIDEO_BASE_URL.replace(/\/$/, '')

export const videoAssets = Object.freeze({
  cream3d: `${ossVideoBaseUrl}/3d-cream.mp4`,
  serum01: `${ossVideoBaseUrl}/serum-ad-01.mp4`,
  serum02: `${ossVideoBaseUrl}/serum-ad-02.mp4`,
  projector: `${ossVideoBaseUrl}/projector-ad.mp4`,
  remeyaCream: `${ossVideoBaseUrl}/remeya-cream-ad.mp4`,
  immuneCell: `${ossVideoBaseUrl}/immune-cell-film.mp4`,
})
```

构建前确认 `.env.production` 中的 URL 与 Task 1 部署文档记录的 Bucket 完全一致。

- [ ] **Step 4: 替换作品数据中的 6 个视频地址**

在 `src/data/workCategories.js` 顶部加入：

```js
import { videoAssets } from '../config/videoAssets'
```

按对象含义将 6 个 `src` 分别替换为对应的 `videoAssets` 属性，封面路径保持不变。

- [ ] **Step 5: 运行专项检查与生产构建**

Run:

```powershell
pnpm run verify:video-loading
pnpm run lint
pnpm run build
```

Expected: 视频检查与构建通过；lint 只允许现有 `src/components/ui/button.tsx:58` Fast Refresh 警告。

- [ ] **Step 6: Commit**

```powershell
git add .env.production src/config/videoAssets.js src/data/workCategories.js scripts/verify-video-loading.mjs
git commit -m "feat: serve portfolio videos from Aliyun OSS"
```

### Task 4: 连续播放验收并上线

**Files:**
- Modify only if a defect is found: `src/components/work/DeferredVideo.jsx`
- Read: `scripts/publish_github_repository.ps1`

**Interfaces:**
- Consumes: Task 3 的 production build 和 Task 2 已验证的 OSS URLs。
- Produces: 通过重复播放验收的 GitHub Pages 网站。

- [ ] **Step 1: 启动本地生产预览**

Run:

```powershell
pnpm run build
pnpm exec vite preview --host 127.0.0.1 --port 4173
```

Expected: `http://127.0.0.1:4173/tingting-portfolio/` 可访问。

- [ ] **Step 2: 在浏览器进行重复播放验收**

对同一个项目执行：

```text
打开作品图片查看器 -> 点击加载视频 -> 确认开始播放
关闭查看器 -> 再次打开同一项目 -> 再次点击加载视频 -> 确认开始播放
拖动到视频中段 -> 确认继续播放
关闭后打开另一个视频 -> 确认正常播放
```

Expected: 两次打开都能播放；Network 面板视频请求来自 OSS，Range 请求返回 `206`。

- [ ] **Step 3: 运行完整回归检查**

Run:

```powershell
pnpm run verify:video-loading
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
```

Expected: 两个 verify 与 build 通过；lint 仅保留已知 Fast Refresh 警告。

- [ ] **Step 4: 发布 GitHub Pages**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/publish_github_repository.ps1
```

Expected: 创建新的 GitHub commit，Pages workflow 成功完成。

- [ ] **Step 5: 正式站点复测**

打开：

```text
https://ygystyrdqd-lab.github.io/tingting-portfolio/?oss-video-check=20260930
```

重复 Task 4 Step 2，并确认页面源代码引用实际 OSS Bucket 域名。

- [ ] **Step 6: 保留回退资源并记录结果**

线上验收成功后保留 `public/work/**/**.lite.mp4`，本次不删除。若 OSS 异常，将 `workCategories.js` 恢复为这 6 个本地路径并重新发布。

- [ ] **Step 7: Commit any verification-only documentation changes**

若验收过程中补充了部署说明：

```powershell
git add docs/deployment/aliyun-oss-media.md
git commit -m "docs: record OSS video verification"
```
