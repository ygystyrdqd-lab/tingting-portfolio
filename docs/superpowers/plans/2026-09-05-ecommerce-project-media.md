# Ecommerce Project Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将三组电商项目封面与详情长图压缩为 WebP，并接入“电商与活动视觉”二级页面的三个项目卡片。

**Architecture:** 使用独立 Pillow 脚本按明确映射批量生成 `public/work/ecommerce-01` 至 `ecommerce-03` 的静态资源。更新 `workCategories` 中三个现有项目的标题、`cover` 与 `media` 字段，复用 `WorkCategoryPage` 和 `MediaViewer` 已有的真实图片渲染逻辑。

**Tech Stack:** React、JavaScript、CSS、Vite、Python Pillow、WebP
**Spec:** `docs/superpowers/specs/2026-09-05-ecommerce-project-media-design.md`

## Global Constraints

- 三组封面与详情图必须按文件编号和项目内容正确对应。
- 六张输出图片保持原始像素尺寸与比例。
- WebP 参数固定为质量 `90`、方法 `6`。
- 原始 JPG 和 PNG 文件不可修改。
- 其他四个作品分类与现有页面组件不变。
- 当前目录不是 Git 仓库，跳过提交步骤。

---

### Task 1: 批量生成六张电商项目 WebP

**Files:**
- Create: `scripts/optimize_ecommerce_projects.py`
- Create: `public/work/ecommerce-01/cover.webp`
- Create: `public/work/ecommerce-01/detail-01.webp`
- Create: `public/work/ecommerce-02/cover.webp`
- Create: `public/work/ecommerce-02/detail-01.webp`
- Create: `public/work/ecommerce-03/cover.webp`
- Create: `public/work/ecommerce-03/detail-01.webp`

**Interfaces:**
- Consumes: `../电商与活动视觉/` 中三张封面和三张详情图。
- Produces: 三个项目目录中的 `cover.webp` 与 `detail-01.webp`。

- [x] **Step 1: 创建图片优化脚本**

```python
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "电商与活动视觉"
OUTPUT_ROOT = PROJECT_ROOT / "public" / "work"

ASSETS = (
    ("ecommerce-01", "项目卡片封面1.jpg", "cover.webp", (1600, 1000)),
    ("ecommerce-01", "二级详情页.jpg", "detail-01.webp", (850, 8037)),
    ("ecommerce-02", "项目卡片封面2.jpg", "cover.webp", (1600, 1000)),
    ("ecommerce-02", "精华液详情页.png", "detail-01.webp", (750, 10878)),
    ("ecommerce-03", "项目卡片封面3.jpg", "cover.webp", (1586, 992)),
    ("ecommerce-03", "投影仪详情页.png", "detail-01.webp", (750, 10728)),
)

for project_id, source_name, output_name, expected_size in ASSETS:
    source_path = SOURCE_ROOT / source_name
    output_dir = OUTPUT_ROOT / project_id
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / output_name

    with Image.open(source_path) as image:
        image = image.convert("RGB")
        if image.size != expected_size:
            raise ValueError(
                f"{source_name}: expected {expected_size}, got {image.size}"
            )
        image.save(output_path, "WEBP", quality=90, method=6)
```

- [x] **Step 2: 运行优化脚本**

```powershell
& "C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" scripts\optimize_ecommerce_projects.py
```

预期：命令退出码为 0，生成六张 WebP。

- [x] **Step 3: 验证图片尺寸、格式和体积**

使用 Pillow 逐个读取输出文件并打印格式、尺寸与字节数。

预期：所有文件格式为 WebP，尺寸分别与 `ASSETS` 中的 `expected_size` 一致；三个原始 JPG 和三个原始详情文件仍存在。

---

### Task 2: 接入三个电商项目的封面与详情媒体

**Files:**
- Modify: `src/data/workCategories.js:32-36`

**Interfaces:**
- Consumes: Task 1 生成的六张静态资源。
- Produces: 三个带 `cover: string` 与 `media: Array<{type: 'image', src: string, alt: string}>` 的电商项目对象。

- [x] **Step 1: 更新 `ecommerce-01` 数据**

```js
{
  id: 'ecommerce-01',
  title: 'RÖT KRÖN 陶瓷音腔耳机',
  meta: 'CAMPAIGN · E-COMMERCE',
  cover: '/work/ecommerce-01/cover.webp',
  media: [
    {
      type: 'image',
      src: '/work/ecommerce-01/detail-01.webp',
      alt: 'RÖT KRÖN 陶瓷音腔耳机电商视觉详情',
    },
  ],
},
```

- [x] **Step 2: 更新 `ecommerce-02` 数据**

```js
{
  id: 'ecommerce-02',
  title: 'Eternal Cell 焕亮精华液',
  meta: 'CAMPAIGN · E-COMMERCE',
  cover: '/work/ecommerce-02/cover.webp',
  media: [
    {
      type: 'image',
      src: '/work/ecommerce-02/detail-01.webp',
      alt: 'Eternal Cell 焕亮精华液电商视觉详情',
    },
  ],
},
```

- [x] **Step 3: 更新 `ecommerce-03` 数据**

```js
{
  id: 'ecommerce-03',
  title: 'AOC K1S Ultra 投影仪',
  meta: 'CAMPAIGN · E-COMMERCE',
  cover: '/work/ecommerce-03/cover.webp',
  media: [
    {
      type: 'image',
      src: '/work/ecommerce-03/detail-01.webp',
      alt: 'AOC K1S Ultra 投影仪电商视觉详情',
    },
  ],
},
```

- [x] **Step 4: 检查资源引用**

```powershell
rg -n "ecommerce-0[123]|RÖT KRÖN|Eternal Cell|AOC K1S" src/data/workCategories.js
```

预期：三个项目各自只引用同编号目录中的封面与详情图。

---

### Task 3: 构建与浏览器验收

**Files:**
- Verify: `src/data/workCategories.js`
- Verify: `public/work/ecommerce-01/`
- Verify: `public/work/ecommerce-02/`
- Verify: `public/work/ecommerce-03/`

**Interfaces:**
- Consumes: Tasks 1–2 的完整实现。
- Produces: 经桌面与手机端验证的电商与活动视觉二级页面。

- [x] **Step 1: 运行 lint**

```powershell
pnpm run lint
```

预期：无新增错误或与本次修改有关的警告。

- [x] **Step 2: 运行生产构建**

```powershell
pnpm run build
```

预期：构建成功，六张 WebP 出现在 `dist/work/ecommerce-01` 至 `ecommerce-03`。

- [x] **Step 3: 验证 PC 卡片布局**

打开 `http://127.0.0.1:5173/?category=ecommerce`。

预期：第一张卡片通栏，第二与第三张并列；三张卡片显示正确封面与标题，图片无拉伸。

- [x] **Step 4: 验证三个详情页面**

依次点击三张卡片。

预期：每张卡片打开正确的详情长图，图片按查看器宽度完整显示并可纵向滚动，关闭按钮正常。

- [x] **Step 5: 验证手机端**

将视口设置为 `390 × 844`。

预期：三张卡片单列显示，封面无变形；三个详情图均无横向溢出。

- [x] **Step 6: 检查浏览器控制台**

预期：没有图片 404、解码错误或 React 渲染错误。
