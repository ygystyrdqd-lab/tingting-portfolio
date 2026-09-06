# GitHub Pages 上线设计

## 目标

将当前 React + Vite 作品集发布到新的公开 GitHub 仓库 `tingting-portfolio`，并生成可公开访问的 GitHub Pages 网站。以后提交到 `main` 分支时自动重新构建和发布。

## 发布架构

- 源代码保存在公开仓库 `tingting-portfolio` 的 `main` 分支。
- GitHub Actions 在每次推送后安装依赖、执行构建并发布 `dist`。
- Vite 的生产资源基础路径设为 `/tingting-portfolio/`；本地开发继续使用 `/`，不影响当前预览。
- 网站继续使用现有查询参数二级页面，例如 `?category=brand`，无需服务器端路由回退。

## 安全与仓库内容

- `.env.local`、React Bits 授权密钥、依赖目录和本地生成文件不上传。
- 公开仓库只包含运行网站所需的源代码、配置和媒体素材。
- 当前单个最大视频约 53 MB，低于 GitHub 的 100 MB 单文件限制；现有素材可以直接纳入此次发布。

## 自动发布流程

新增 GitHub Pages 工作流，使用 pnpm 锁定依赖版本，执行正式构建并部署静态产物。Pages 来源使用 GitHub Actions，避免手动维护发布分支。

## 验收

- 本地 lint 与生产构建通过。
- GitHub 仓库为公开状态且不含 `.env.local`。
- GitHub Pages 部署成功。
- 线上首页、第五屏项目入口、各二级页面、图片和视频资源可以访问。
- 刷新带查询参数的二级页面仍能正常显示。

## 失败处理

- 如果电脑尚未登录 GitHub，通过浏览器完成一次 GitHub 登录或授权后继续。
- 如果仓库名已被占用，优先保留名称并确认是否使用现有仓库；不会擅自覆盖。
- 如果 Pages 构建失败，保留本地代码和仓库提交，修复工作流后重新发布。
