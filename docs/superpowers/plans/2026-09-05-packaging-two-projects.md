# Packaging Two Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将包装与物料延展二级页面缩减为两个项目卡片，仅保留包装项目 01 和 02。

**Architecture:** 只修改 `workCategories` 中 `packaging.projects` 数据数组，删除 `packaging-03`。`WorkCategoryPage` 会根据长度为 2 自动使用现有 `layout-pair`，无需修改 React 组件或 CSS。

**Tech Stack:** React、JavaScript、Vite、CSS
**Spec:** `docs/superpowers/specs/2026-09-05-packaging-two-projects-design.md`

## Global Constraints

- 保留 `packaging-01` 与 `packaging-02`。
- 删除 `packaging-03`。
- 不修改组件、CSS、图片资源或其他四个分类。
- 当前目录不是 Git 仓库，跳过提交步骤。

---

### Task 1: 删除第三个包装项目并验证双卡片布局

**Files:**
- Modify: `src/data/workCategories.js:81-85`

**Interfaces:**
- Consumes: `WorkCategoryPage` 读取的 `category.projects` 数组。
- Produces: 仅包含 `packaging-01` 和 `packaging-02` 的包装项目数组。

- [x] **Step 1: 记录变更前基线**

```powershell
rg -n "packaging-0[123]" src/data/workCategories.js
```

预期：输出 `packaging-01`、`packaging-02`、`packaging-03`。

- [x] **Step 2: 删除 `packaging-03` 数据项**

修改后的数组为：

```js
projects: [
  { id: 'packaging-01', title: '包装项目 01', meta: 'PACKAGING · MATERIAL', media: [] },
  { id: 'packaging-02', title: '包装项目 02', meta: 'PACKAGING · MATERIAL', media: [] },
],
```

- [x] **Step 3: 验证数据结果**

```powershell
rg -n "packaging-0[123]" src/data/workCategories.js
```

预期：只输出 `packaging-01` 和 `packaging-02`。

- [x] **Step 4: 运行 lint 与生产构建**

```powershell
pnpm run lint
pnpm run build
```

预期：构建成功，lint 不新增与本次变更相关的错误或警告。

- [x] **Step 5: 验证 PC 二级页面**

打开 `http://127.0.0.1:5173/?category=packaging`。

预期：仅显示两个项目，容器类名包含 `layout-pair`，两张卡片并列且均可打开媒体空状态。

- [x] **Step 6: 验证手机端和控制台**

将视口设置为 `390 × 844`。

预期：两张卡片单列显示，没有横向溢出；浏览器控制台无新增错误。
