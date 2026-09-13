# 最后一屏 CTA 箭头移除

## 目标与范围

最后一屏「LET'S TALK」文字右侧的斜向箭头不再显示。保留整块文字的 `mailto:` 点击区域、现有字体与进场动画，以及底部 `BACK TO TOP ↑` 链接。其他页面、图标和导航不变；本次只在本地修改，不部署。

## 实现设计

在 `src/App.jsx` 的 `Contact` 组件中移除 `.contact-arrow` 节点，不以 CSS 隐藏代替。同步删除 `src/App.css` 中仅服务该节点的定位、SVG、悬停和窄屏规则，以及 `src/hooks/usePortfolioAnimations.js` 中针对 `[data-contact-arrow]` 的独立动画。文字 CTA 的语义和邮箱地址不变。

## 验收

- 最后一屏大字旁不出现斜向箭头；大字仍可点击打开邮件客户端。
- 底部 `BACK TO TOP ↑` 保留并可返回顶部。
- 桌面预览无多余留白或布局溢出，原有文字进场正常。
- 静态检查与生产构建通过；不推送、不上线。
