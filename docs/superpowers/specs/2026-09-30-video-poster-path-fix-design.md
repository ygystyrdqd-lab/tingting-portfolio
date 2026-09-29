# 线上视频封面路径修复设计

## 背景

GitHub Pages 以 `/tingting-portfolio/` 作为站点基础路径。作品数据在导出时已经通过 `assetUrl()` 将视频封面转换为带基础路径的线上地址，但 `DeferredVideo` 组件接收该地址后再次调用 `assetUrl()`，导致路径被重复拼接为 `/tingting-portfolio/tingting-portfolio/...`。因此视频可以播放，但播放前的封面图无法显示。

## 目标

- 视频加载前显示现有高清项目封面。
- 不改动视频文件、OSS 地址、卡片样式或播放交互。
- 本地开发和 GitHub Pages 子路径部署均保持正常。

## 方案

保持作品数据层统一负责资源地址解析，`DeferredVideo` 组件直接使用传入的 `poster` 地址，不再二次调用 `assetUrl()`。视频 `src` 仍保留当前绝对 OSS 地址处理逻辑。

同时增加自动验证，检查播放器不会再次对已解析的封面路径添加站点基础路径。

## 影响范围

- `src/components/work/DeferredVideo.jsx`
- `scripts/verify-video-loading.mjs`

不涉及 OSS 对象、视频编码、项目数据内容和页面布局。

## 验证

1. 运行视频加载验证脚本。
2. 运行 lint 和生产构建。
3. 使用 GitHub Pages 基础路径预览，确认封面请求地址只包含一次 `/tingting-portfolio/`。
4. 打开视频项目，确认封面可见且点击后视频仍能播放。

