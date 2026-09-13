# 瑞美亚面霜广告项目卡片 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the third featured card in the Projects screen with the 瑞美亚面霜广告 cover and full-screen video.

**Architecture:** Keep the existing `featuredWorkCategories` → `Projects` → `MediaViewer` data flow. Copy the supplied JPEG and MP4 into one public asset directory, then point only the third featured project at them. The video element is mounted only when its card opens, and the cover becomes its poster.

**Tech Stack:** React 19, Vite 8, Node.js verification script, static JPEG/MP4 assets.
**Spec:** `docs/superpowers/specs/2026-09-12-remeya-cream-project-card-design.md`

## Global Constraints

- Change only the third featured project; preserve order, card count, layout, Spotlight interaction, and viewer close behavior.
- Local version only; do not deploy or push.
- Source files: `C:/Users/Mayn/Desktop/作品集/项目/瑞美亚面霜广告封面.jpg` and `C:/Users/Mayn/Desktop/作品集/项目/瑞美亚面霜广告.mp4`.
- Preserve the original video quality for this local iteration; review hosting/compression before publication.

---

### Task 1: Replace the featured project media and copy

**Files:**
- Create: `scripts/verify-remeya-project.mjs`
- Create binary assets: `public/work/remeya-cream/cover.jpg`, `public/work/remeya-cream/ad.mp4`
- Modify: `src/data/workCategories.js` at the `rawFeaturedWorkCategories` third entry
- Modify: `package.json` to expose `verify:remeya-project`

**Interfaces:**
- Consumes: `resolveCategoryAssets` and `assetUrl(path)` already used by all featured projects; `MediaViewer` consumes `{ title, cover, media: [{ type, src, poster }] }`.
- Produces: third `featuredWorkCategories` entry whose first project opens an MP4 in the existing `MediaViewer`.

- [ ] **Step 1: Write the failing static verification script.** Check the third featured entry contains `title: '瑞美亚面霜广告'`, `cover: '/work/remeya-cream/cover.jpg'`, a `type: 'video'` item with `src: '/work/remeya-cream/ad.mp4'` and matching `poster`, and both asset paths exist. Read source around `const rawFeaturedWorkCategories = [` rather than counting similarly named work categories. Assert `statSync(video).size > 0` and the cover size > 0.

```js
import { readFileSync, statSync } from 'node:fs'
const data = readFileSync(new URL('../src/data/workCategories.js', import.meta.url), 'utf8')
const featured = data.split('const rawFeaturedWorkCategories = [')[1]?.split('const resolveCategoryAssets')[0] ?? ''
const cream = featured.split("slug: 'aigc-workflow'")[1] ?? ''
const assert = (value, message) => { if (!value) throw new Error(message) }
assert(cream.includes("title: '瑞美亚面霜广告'"), 'Cream title missing')
assert(cream.includes("cover: '/work/remeya-cream/cover.jpg'"), 'Cream cover missing')
assert(cream.includes("type: 'video'") && cream.includes("src: '/work/remeya-cream/ad.mp4'") && cream.includes("poster: '/work/remeya-cream/cover.jpg'"), 'Cream video missing')
for (const name of ['cover.jpg', 'ad.mp4']) {
  assert(statSync(new URL(`../public/work/remeya-cream/${name}`, import.meta.url)).size > 0, `${name} is empty`)
}
console.log('瑞美亚面霜广告项目素材与数据验证通过')
```

- [ ] **Step 2: Run `node scripts/verify-remeya-project.mjs`; expect failure for missing cream title/assets.**
- [ ] **Step 3: Copy assets and update the featured project.** Use PowerShell `New-Item -ItemType Directory -Force -Path 'public/work/remeya-cream'` and `Copy-Item -LiteralPath <exact source> -Destination <exact target>` for the binary files. In `src/data/workCategories.js`, preserve the third featured category's slug and number but set its display title/en/description to the advertisement, and set its only project to:

```js
{
  id: 'remeya-cream-ad',
  title: '瑞美亚面霜广告',
  meta: 'AIGC · BEAUTY AD',
  cover: '/work/remeya-cream/cover.jpg',
  media: [{ type: 'video', src: '/work/remeya-cream/ad.mp4', poster: '/work/remeya-cream/cover.jpg' }],
}
```

In `package.json`, add `"verify:remeya-project": "node scripts/verify-remeya-project.mjs"` to `scripts`.
- [ ] **Step 4: Run `pnpm run verify:remeya-project`, `pnpm run verify:desktop-experience`, `pnpm run lint`, `pnpm run build`, and `git diff --check`; expect passes (the existing unrelated button.tsx lint warning may remain).**
- [ ] **Step 5: Browser-check the Projects card cover, label, click-to-play, poster, video controls, and close button at `http://localhost:5173/#projects`. Confirm other two cards remain intact.**
- [ ] **Step 6: Commit only these source/test/assets changes, without pushing or deploying.**

## Self-review

- Spec coverage: cover, title, video poster/playback, unchanged card system, local-only scope, and build/browser verification are all in Task 1.
- No new component or route is necessary. The 66 MB video is intentionally local and needs hosting review before the next deployment.
