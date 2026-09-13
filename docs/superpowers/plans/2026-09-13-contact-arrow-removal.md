# 最后一屏箭头移除 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除最后一屏 `LET'S TALK` 大字右侧的斜箭头，同时保留邮件 CTA 与底部返回顶部链接。

**Architecture:** 从 `Contact` 的 JSX 删除箭头节点，并清理该节点独有的 CSS 与 GSAP 动画。用小型静态验证锁定这三个删除点及两个必须保留的链接；不改其他页面。

**Tech Stack:** React、CSS、GSAP、Node.js、Vite。
**Spec:** `docs/superpowers/specs/2026-09-13-contact-arrow-removal-design.md`

## Global Constraints

- 只移除 `LET'S TALK` 旁的斜箭头；`mailto:806779987@qq.com` 的大字链接保持可点击。
- 保留底部 `BACK TO TOP ↑` 链接，不更改文字、排版和其他图标。
- 本地验证和提交，不推送、不部署。

---

### Task 1: 移除箭头及失效代码

**Files:**
- Modify: `src/App.jsx` 中的 `Contact`
- Modify: `src/App.css` 中的 `.contact-center svg`、`.contact-center a:hover svg`、`.contact-arrow`、窄屏和减弱动画规则
- Modify: `src/hooks/usePortfolioAnimations.js` 中的联系区时间轴
- Create: `scripts/verify-contact-arrow-removal.mjs`

**Interfaces:**
- Consumes: 已存在的 `Contact`、`[data-contact-arrow]` GSAP 目标和 `BACK TO TOP ↑` 链接。
- Produces: 没有 CTA 斜箭头但保留两个链接的最后一屏。

- [ ] **Step 1: 写失败的验证脚本。** 用 `apply_patch` 创建 `scripts/verify-contact-arrow-removal.mjs`：

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const motion = readFileSync(new URL('../src/hooks/usePortfolioAnimations.js', import.meta.url), 'utf8')
const contact = app.split('function Contact()')[1]?.split('const readCategorySlug')[0] ?? ''

assert.ok(contact.includes('href="mailto:806779987@qq.com"'))
assert.ok(contact.includes('BACK TO TOP ↑'))
assert.ok(!contact.includes('contact-arrow'))
assert.ok(!css.includes('contact-arrow'))
assert.ok(!css.includes('.contact-center svg'))
assert.ok(!css.includes('.contact-center a:hover svg'))
assert.ok(!motion.includes('data-contact-arrow'))
console.log('联系屏 CTA 箭头移除验证通过')
```

- [ ] **Step 2: 运行红灯验证。** `node scripts/verify-contact-arrow-removal.mjs` 应因 `contact-arrow` 仍在 `Contact` 中而失败。

- [ ] **Step 3: 用 `apply_patch` 删除 JSX 箭头节点。** 在 `Contact` 中保留 `<a href="mailto:806779987@qq.com" data-section-title="contact">` 及两条 `.contact-line`，只删除 `<span className="contact-arrow" data-contact-arrow><ArrowUpRight /></span>`；`ArrowUpRight` 的导入仍用于其他区域，不能删除。

- [ ] **Step 4: 用 `apply_patch` 清理只服务箭头的样式和动画。** 从 `src/App.css` 删除 `.contact-center svg{...}`、`.contact-center a:hover svg{...}`、两条 `.contact-arrow{...}`、窄屏 `.contact-arrow{display:none}`，并从减弱动画选择器中删除 `,.motion-ready [data-contact-arrow]`。从 `src/hooks/usePortfolioAnimations.js` 删除整条 `.from('[data-contact-arrow]', { rotation: -35, scale: .8, autoAlpha: 0, duration: .85, ease: 'power3.out' }, .64)`。联系区其他时间轴段不变。

- [ ] **Step 5: 验证与桌面预览。** 运行：

```powershell
node scripts/verify-contact-arrow-removal.mjs
pnpm run verify:desktop-experience
pnpm run lint
pnpm run build
git diff --check
```

在本地桌面预览最后一屏：大字旁无箭头、文字 CTA 可点击且仍指向邮箱；底部 `BACK TO TOP ↑` 存在并返回首屏，字词进场无报错。使用一次集中截图检查，若有缺陷只做一次修复后复查。

- [ ] **Step 6: 仅本地提交。**

```powershell
git add -- src/App.jsx src/App.css src/hooks/usePortfolioAnimations.js scripts/verify-contact-arrow-removal.mjs
git diff --cached --check
git commit -m "refactor: remove contact CTA arrow"
git status --short
```
