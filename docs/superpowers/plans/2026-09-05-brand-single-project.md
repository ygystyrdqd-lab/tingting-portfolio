# Brand Single Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将品牌视觉二级页面缩减为一个项目卡片，仅保留“品牌项目 01”。

**Architecture:** 继续使用 `workCategories` 作为四个二级页面的唯一数据源，只修改 `brand.projects` 数组。`WorkCategoryPage` 已根据项目数量自动选择 `layout-single`，因此无需调整组件或 CSS。

**Tech Stack:** React、JavaScript、Vite、CSS
**Spec:** `docs/superpowers/specs/2026-09-05-brand-single-project-design.md`

## Global Constraints

- 仅保留 `brand-01` 项目。
- 不修改其他三个分类的数据、二级页面交互或视觉样式。
- 复用现有 `layout-single` 通栏布局。
- 当前目录不是 Git 仓库，跳过提交步骤。

---

### Task 1: 缩减品牌项目并验证单卡片布局

**Files:**
- Modify: `src/data/workCategories.js:8-12`

**Interfaces:**
- Consumes: `WorkCategoryPage` 读取的 `category.projects` 数组。
- Produces: 仅包含 `{ id: 'brand-01', title: '品牌项目 01', meta: 'IDENTITY · VISUAL SYSTEM', media: [] }` 的品牌项目数组。

- [x] **Step 1: 记录变更前基线**

运行：

```powershell
rg -n "brand-0[123]" src/data/workCategories.js
```

预期：输出 `brand-01`、`brand-02` 和 `brand-03` 三条记录。

- [x] **Step 2: 删除两个品牌项目数据项**

将品牌分类的项目数组修改为：

```js
projects: [
  { id: 'brand-01', title: '品牌项目 01', meta: 'IDENTITY · VISUAL SYSTEM', media: [] },
],
```

- [x] **Step 3: 检查项目数据**

运行：

```powershell
rg -n "brand-0[123]" src/data/workCategories.js
```

预期：只输出 `brand-01`，不再出现 `brand-02` 或 `brand-03`。

- [x] **Step 4: 运行静态检查与生产构建**

运行：

```powershell
pnpm run lint
pnpm run build
```

预期：生产构建成功；lint 不新增与本次变更相关的错误或警告。

- [x] **Step 5: 在浏览器中验证**

打开：

```text
http://127.0.0.1:5173/?category=brand
```

预期：页面只显示“品牌项目 01”，卡片为通栏单卡片布局，点击后媒体查看器正常打开；其他分类页面仍保留原有项目。
