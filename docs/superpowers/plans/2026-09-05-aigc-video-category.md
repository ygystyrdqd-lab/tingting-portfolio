# AIGC Video Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页第 4 屏新增 `05 AIGC视频广告` 入口，并通过现有数据驱动架构生成包含两个项目卡片的统一二级页面。

**Architecture:** 向 `workCategories` 数组追加一个完整分类对象。首页能力列表、URL 查询参数解析、二级页面标题、双卡片布局和媒体空状态均由现有组件自动生成，不新增组件或样式分支。

**Tech Stack:** React、JavaScript、CSS、Vite
**Spec:** `docs/superpowers/specs/2026-09-05-aigc-video-category-design.md`

## Global Constraints

- 新分类序号必须为 `05`，slug 必须为 `aigc-video`。
- 二级页面必须包含两个项目：`AIGC视频项目 01` 与 `AIGC视频项目 02`。
- PC 使用现有双列布局，宽度小于 `760px` 时使用现有单列布局。
- 现有四个分类的数据与行为不变。
- 不新增图片、视频、组件或 CSS。
- 当前目录不是 Git 仓库，跳过提交步骤。

---

### Task 1: 新增 AIGC 视频广告分类并验证完整流程

**Files:**
- Modify: `src/data/workCategories.js:65`

**Interfaces:**
- Consumes: `workCategories` 被首页 `CapabilityLink` 列表和 `getWorkCategory(slug)` 共同读取。
- Produces: `slug: 'aigc-video'` 的分类对象，供 `?category=aigc-video` 渲染统一二级页面。

- [x] **Step 1: 记录变更前分类基线**

运行：

```powershell
rg -n "slug:" src/data/workCategories.js
```

预期：仅显示 `brand`、`ecommerce`、`packaging`、`3d` 四个 slug。

- [x] **Step 2: 追加分类数据对象**

在 `3d` 分类对象之后、数组结束之前加入：

```js
{
  number: '05',
  slug: 'aigc-video',
  title: 'AIGC视频广告',
  en: 'AIGC Video Advertising',
  description: '结合生成式影像、动态设计与广告叙事，探索更高效、更具想象力的视频表达。',
  theme: { accent: '#a98ca8', glow: 'rgba(126,82,126,.24)' },
  projects: [
    {
      id: 'aigc-video-01',
      title: 'AIGC视频项目 01',
      meta: 'AIGC · VIDEO ADVERTISING',
      media: [],
    },
    {
      id: 'aigc-video-02',
      title: 'AIGC视频项目 02',
      meta: 'AIGC · VIDEO ADVERTISING',
      media: [],
    },
  ],
},
```

- [x] **Step 3: 验证分类数据结构**

运行：

```powershell
rg -n "05|aigc-video|AIGC视频项目" src/data/workCategories.js
```

预期：显示新分类序号、slug 和两个项目，且 ID 唯一。

- [x] **Step 4: 运行 lint 与生产构建**

运行：

```powershell
pnpm run lint
pnpm run build
```

预期：构建成功，lint 不新增与本次变更相关的错误或警告。

- [x] **Step 5: 验证首页第 4 屏入口**

打开 `http://127.0.0.1:5173/#capabilities`。

预期：列表末尾显示 `05 AIGC视频广告 / AIGC Video Advertising`，悬停效果与前四项一致。

- [x] **Step 6: 验证二级页面和项目弹窗**

打开 `http://127.0.0.1:5173/?category=aigc-video`。

预期：页面从顶部开始，标题、说明和主题色正确；PC 显示两个并列项目卡片。分别点击两张卡片，均显示现有媒体空状态，关闭按钮正常。

- [x] **Step 7: 验证返回与响应式行为**

点击“返回作品”确认回到 `#capabilities`；在窄屏检查两张卡片变为单列且页面没有横向溢出。

- [x] **Step 8: 检查浏览器控制台**

预期：没有分类未找到、React 渲染或资源加载错误。
