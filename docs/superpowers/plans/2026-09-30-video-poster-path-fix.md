# Video Poster Path Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore visible video poster images on GitHub Pages without changing video sources, layout, or playback behavior.

**Architecture:** The work-category data layer already resolves project media paths through `assetUrl()`. `DeferredVideo` will treat its `poster` prop as an already resolved URL and pass it directly to both the native `<video>` poster attribute and the visible poster image.

**Tech Stack:** React 19, Vite 8, Node.js verification scripts, GitHub Pages
**Spec:** `docs/superpowers/specs/2026-09-30-video-poster-path-fix-design.md`

## Global Constraints

- Keep the existing OSS video URLs unchanged.
- Keep current project covers, player controls, layout, and interaction unchanged.
- Support local development and the `/tingting-portfolio/` GitHub Pages base path.
- Do not add dependencies.

---

### Task 1: Prevent video poster base-path duplication

**Files:**
- Modify: `scripts/verify-video-loading.mjs`
- Modify: `src/components/work/DeferredVideo.jsx:61-72`

**Interfaces:**
- Consumes: `poster: string | undefined`, already resolved by `src/data/workCategories.js`.
- Produces: native video `poster` and fallback `<img src>` values that exactly equal the supplied `poster` string.

- [ ] **Step 1: Add the failing verification**

Add these assertions after the existing DeferredVideo assertions in `scripts/verify-video-loading.mjs`:

```js
assert(deferred.includes('poster={poster || undefined}'), 'Video poster must use the already resolved project URL')
assert(deferred.includes('<img src={poster}'), 'Poster image must use the already resolved project URL')
assert(!deferred.includes('assetUrl(poster)'), 'DeferredVideo must not resolve poster URLs twice')
```

- [ ] **Step 2: Run verification and confirm failure**

Run: `pnpm run verify:video-loading`

Expected: FAIL with `Video poster must use the already resolved project URL`.

- [ ] **Step 3: Implement the minimal path fix**

In `src/components/work/DeferredVideo.jsx`, replace the two poster expressions:

```jsx
poster={poster || undefined}
```

and:

```jsx
{poster && <img src={poster} alt="" decoding="async" />}
```

Keep `assetUrl(src)` for the video source because callers may still pass either local or absolute video URLs.

- [ ] **Step 4: Run focused and production checks**

Run: `pnpm run verify:video-loading`

Expected: PASS with `Video loading verification passed`.

Run: `pnpm run lint`

Expected: exit code 0; the pre-existing Fast Refresh warning in `src/components/ui/button.tsx` may remain.

Run: `pnpm run build`

Expected: PASS and production files written to `dist/`.

- [ ] **Step 5: Verify the GitHub Pages base-path preview**

Run: `pnpm run preview -- --host 127.0.0.1 --port 4173`

Open `http://127.0.0.1:4173/tingting-portfolio/?category=aigc-video`, open a video project, and verify:

```text
Poster request path contains exactly one /tingting-portfolio/ segment.
Poster is visible before playback.
Clicking the play control still switches to the video.
```

- [ ] **Step 6: Commit the fix**

```bash
git add scripts/verify-video-loading.mjs src/components/work/DeferredVideo.jsx
git commit -m "fix: show video posters on GitHub Pages"
```

### Task 2: Publish and verify the live site

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: committed source tree and `scripts/publish_github_repository.ps1`.
- Produces: updated `main` branch in `ygystyrdqd-lab/tingting-portfolio` and a successful GitHub Pages deployment.

- [ ] **Step 1: Publish the repository**

Run:

```powershell
pwsh -File scripts/publish_github_repository.ps1 `
  -ProjectRoot "C:\Users\Mayn\Desktop\作品集\portfolio-site" `
  -Owner "ygystyrdqd-lab" `
  -Repository "tingting-portfolio"
```

Expected: `PUBLISHED_FILES`, `TREE`, and `COMMIT` values are printed.

- [ ] **Step 2: Confirm deployment success**

Read the newest public GitHub Actions run for commit `main`.

Expected: workflow `Deploy GitHub Pages` has `status: completed` and `conclusion: success`.

- [ ] **Step 3: Verify the live poster and playback**

Open `https://ygystyrdqd-lab.github.io/tingting-portfolio/?category=aigc-video` with a cache-busting query string. Open one project and confirm:

```text
The poster image is visible before playback.
Its URL contains /tingting-portfolio/ only once.
The video source still points to the Aliyun OSS domain.
```

