# 阿里云 OSS 视频部署

- Bucket: `tingting-portfolio-media-20260930-01`
- Region: `oss-cn-shenzhen`
- Public endpoint: `oss-cn-shenzhen.aliyuncs.com`
- Object prefix: `portfolio/videos/`
- Production origin: `https://ygystyrdqd-lab.github.io`

视频对象采用 `video/mp4`，并通过仅允许正式站点 `GET`、`HEAD` 请求的 CORS 规则提供给 GitHub Pages。
