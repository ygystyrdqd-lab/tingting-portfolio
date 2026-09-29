# 阿里云 OSS 视频迁移设计

## 目标

将作品集网站的 6 个轻量 MP4 视频从 GitHub Pages 静态资源迁移到阿里云 OSS，提升中国大陆访问稳定性，并保证视频首次播放、关闭后再次播放、拖动进度条均可用。

## 方案

采用华南 1（深圳）的独立 OSS Bucket。Bucket 仅承载作品集公开视频，使用公共读模式；网站代码与图片继续由 GitHub Pages 托管。暂不接入 CDN，避免引入备案域名、额外费用和缓存刷新复杂度。

## 存储结构

视频统一上传到以下前缀：

`portfolio/videos/`

对象名称保留稳定、可读的英文名：

- `3d-cream.mp4`
- `serum-ad-01.mp4`
- `serum-ad-02.mp4`
- `projector-ad.mp4`
- `remeya-cream-ad.mp4`
- `immune-cell-film.mp4`

## Bucket 与对象配置

- 地域：华南 1（深圳）
- 读写权限：公共读、私有写
- 阻止公共访问：按控制台创建公共读 Bucket 所需设置处理
- 对象 `Content-Type`：`video/mp4`
- 对象 `Cache-Control`：`public, max-age=31536000, immutable`
- 不设置 `Content-Disposition: attachment`，避免浏览器强制下载
- 保持 OSS 对 HTTP Range 请求的支持，以便拖动进度和分段加载

## CORS

创建一条最小权限跨域规则：

- 来源：`https://ygystyrdqd-lab.github.io`
- 方法：`GET`、`HEAD`
- 允许 Headers：`*`
- 暴露 Headers：`ETag`、`Content-Length`、`Content-Range`、`Accept-Ranges`
- 缓存时间：`86400` 秒
- 返回 `Vary: Origin`

本地开发通常可直接播放跨域媒体；若浏览器实际请求被拦截，再增加 `http://localhost:5173` 与 `http://localhost:5174` 的独立规则，不用通配符放宽正式规则。

## 网站改动

- 在媒体数据层集中定义 OSS 视频基础地址，避免 6 处散落硬编码。
- 仅替换视频 `src`，封面图片仍保留在网站仓库。
- 保留延迟加载、点击播放、关闭时释放媒体连接、播放结束重置等现有播放器行为。
- 本地资源保留到线上验证完成，避免迁移失败时无法回退。

## 验证

1. 对每个 OSS URL 发起普通请求和 Range 请求，确认返回 `200/206`、`video/mp4` 与正确的 CORS 响应头。
2. 运行视频专项检查、代码检查和生产构建。
3. 在正式网站连续两次打开同一视频，确认均可播放。
4. 验证拖动进度条、关闭弹窗、切换到其他视频。
5. 部署 GitHub Pages 后复测；验证通过后再考虑删除仓库中的轻量视频副本。

## 错误处理与回退

- OSS 上传或配置未完成时，不修改网站视频地址。
- 任一视频验收失败时，保持或恢复原 GitHub Pages 路径。
- 不把 AccessKey 写入仓库、脚本输出或前端代码；上传凭据仅用于本机临时会话。
- Bucket 名称全局唯一，创建前先验证候选名称可用。

## 不在本次范围

- 阿里云 CDN、自定义视频域名和 HTTPS 证书
- 私有 Bucket 与动态签名 URL
- 视频转码或自适应码率 HLS
- 删除本地原始视频或 1080p 备份
