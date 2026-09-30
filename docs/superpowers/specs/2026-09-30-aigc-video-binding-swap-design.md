# AIGC 广告视频绑定修正设计

## 目标

修正 AIGC 视频广告分类中两张项目卡片的视频绑定错误：

- “AOC激光投影广告”绑定投影仪广告视频 `videoAssets.projector`。
- “瑞美亚精华液广告2”绑定精华液广告2视频 `videoAssets.serum02`。

## 修改范围

只修改 `src/data/workCategories.js` 中上述两个项目的 `media[0].src`。保留卡片顺序、标题、封面、项目 ID、元数据、海报路径、OSS 视频地址和其他分类内容不变。

## 数据流

项目详情查看器继续从 `workCategories.js` 读取当前卡片的 `media` 数组，并通过 `videoAssets.js` 中现有的 OSS 地址播放视频。本次不新增文件、不改播放器逻辑，也不移动 OSS 对象。

## 验证

1. 用自动检查确认 AOC 项目引用 `videoAssets.projector`。
2. 用自动检查确认瑞美亚精华液广告2引用 `videoAssets.serum02`。
3. 运行生产构建，确认数据修改未造成打包错误。
4. 发布后检查线上 AIGC 视频广告页面，两张卡片分别播放与标题相符的视频。

## 非目标

- 不交换整张项目卡片。
- 不调整项目排序、文案、封面或视觉样式。
- 不重新编码或重新上传视频。
