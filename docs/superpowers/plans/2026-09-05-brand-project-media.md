# Brand Project Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将深圳市细胞治疗技术协会项目封面和详情长图压缩为 WebP，并接入品牌视觉二级页面的唯一项目。

**Architecture:** 使用一个可重复执行的 Pillow 脚本从工作区素材目录生成站点静态资源。项目数据通过新增的 `cover` 和现有 `media` 字段把资源传给 `WorkCategoryPage` 与 `MediaViewer`；组件只在存在真实封面时渲染图片，并保留其他分类的抽象占位视觉。

**Tech Stack:** React、JavaScript、CSS、Vite、Python Pillow、WebP
**Spec:** `docs/superpowers/specs/2026-09-05-brand-project-media-design.md`

## Global Constraints

- 项目标题必须为“深圳市细胞治疗技术协会VIS”。
- 封面输出尺寸保持 `1600 × 1000`，详情输出尺寸保持 `1088 × 9425`。
- 原始 JPG 文件不可修改。
- 另外三个作品分类及其占位卡片不变。
- 当前目录不是 Git 仓库，跳过提交步骤。

---

### Task 1: 生成品牌项目 WebP 资源

**Files:**
- Create: `scripts/optimize_brand_project.py`
- Create: `public/work/brand-01/cover.webp`
- Create: `public/work/brand-01/detail-01.webp`

**Interfaces:**
- Consumes: `../品牌视觉设计/项目卡片封面1.jpg` 与 `../品牌视觉设计/作品详情图1.jpg`。
- Produces: `/work/brand-01/cover.webp` 与 `/work/brand-01/detail-01.webp`。

- [x] **Step 1: 创建可重复执行的优化脚本**

```python
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "品牌视觉设计"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work" / "brand-01"

ASSETS = (
    ("项目卡片封面1.jpg", "cover.webp", (1600, 1000)),
    ("作品详情图1.jpg", "detail-01.webp", (1088, 9425)),
)

OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

for source_name, output_name, expected_size in ASSETS:
    source_path = SOURCE_ROOT / source_name
    output_path = OUTPUT_ROOT / output_name
    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(f"{source_name}: expected {expected_size}, got {image.size}")
        image.save(output_path, "WEBP", quality=88, method=6)
```

- [x] **Step 2: 运行图片优化脚本**

运行：

```powershell
python scripts/optimize_brand_project.py
```

预期：生成两个 WebP 文件，命令退出码为 0。

- [x] **Step 3: 验证资源尺寸和体积**

运行 PowerShell 读取两个输出文件的尺寸与字节数。

预期：`cover.webp` 为 `1600 × 1000`，`detail-01.webp` 为 `1088 × 9425`，两个文件均可被 Pillow 识别为 WebP，且原始 JPG 仍存在。

---

### Task 2: 将封面与详情图接入品牌项目

**Files:**
- Modify: `src/data/workCategories.js:10`
- Modify: `src/components/work/WorkCategoryPage.jsx:58-71`
- Modify: `src/components/work/work-detail.css:8-10`

**Interfaces:**
- Consumes: Task 1 生成的 `/work/brand-01/cover.webp` 和 `/work/brand-01/detail-01.webp`。
- Produces: `project.cover: string` 以及 `project.media: Array<{type: 'image', src: string, alt: string}>`，供卡片和查看器渲染。

- [x] **Step 1: 更新品牌项目数据**

将 `brand-01` 更新为：

```js
{
  id: 'brand-01',
  title: '深圳市细胞治疗技术协会VIS',
  meta: 'IDENTITY · VISUAL SYSTEM',
  cover: '/work/brand-01/cover.webp',
  media: [
    {
      type: 'image',
      src: '/work/brand-01/detail-01.webp',
      alt: '深圳市细胞治疗技术协会视觉识别系统作品详情',
    },
  ],
},
```

- [x] **Step 2: 为项目卡片添加条件封面渲染**

将 `.work-project-art` 内容改为：

```jsx
<div className={`work-project-art${project.cover ? ' has-cover' : ''}`} data-parallax aria-hidden="true">
  {project.cover
    ? <img src={project.cover} alt="" loading="eager" decoding="async" />
    : <><i /><i /><i /></>}
  <span>PROJECT PREVIEW</span>
</div>
```

- [x] **Step 3: 添加封面图片与长图阅读样式**

在 `work-detail.css` 中添加：

```css
.work-project-art>img{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
  transition:transform .8s cubic-bezier(.2,.8,.2,1);
}
.work-project-card:hover .work-project-art>img{transform:scale(1.025)}
.work-project-art.has-cover>span{
  z-index:2;
  padding:8px 10px;
  border-radius:999px;
  color:rgba(240,236,229,.72);
  background:rgba(8,7,6,.48);
  backdrop-filter:blur(8px);
}
.media-viewer-content img{max-height:none;height:auto}
```

预期：封面填满卡片且不变形；详情长图以查看器内容宽度显示并在面板内纵向滚动。

---

### Task 3: 静态检查、构建与浏览器验收

**Files:**
- Verify: `src/data/workCategories.js`
- Verify: `src/components/work/WorkCategoryPage.jsx`
- Verify: `src/components/work/work-detail.css`
- Verify: `public/work/brand-01/cover.webp`
- Verify: `public/work/brand-01/detail-01.webp`

**Interfaces:**
- Consumes: Tasks 1–2 的完整实现。
- Produces: 可运行、可构建且经桌面与手机布局检查的品牌项目页面。

- [x] **Step 1: 运行 lint**

```powershell
pnpm run lint
```

预期：无新增错误或与本次修改有关的警告。

- [x] **Step 2: 运行生产构建**

```powershell
pnpm run build
```

预期：Vite 构建成功，两个 WebP 均出现在 `dist/work/brand-01/`。

- [x] **Step 3: 验证 PC 页面**

打开 `http://127.0.0.1:5173/?category=brand`，确认唯一通栏卡片显示真实封面和新标题。点击卡片后确认详情长图为全宽纵向内容，可滚动到底部。

- [x] **Step 4: 验证手机页面**

将浏览器视口设置为 `390 × 844`，确认卡片封面无变形、标题可读，详情长图按屏幕宽度缩放且没有横向溢出。

- [x] **Step 5: 检查浏览器错误**

预期：控制台没有图片 404、解码错误或 React 渲染错误。
