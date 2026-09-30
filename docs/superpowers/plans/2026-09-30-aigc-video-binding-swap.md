# AIGC Video Binding Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the swapped videos for the AOC projector ad and Remeya serum ad 2 without changing their cards, covers, text, or order.

**Architecture:** Keep the existing centralized OSS asset configuration and project data model. Add exact regression assertions to the existing video-loading verifier, then change only the two `media[0].src` references in the AIGC video category.

**Tech Stack:** JavaScript ES modules, Node.js assertions, React data configuration, Vite
**Spec:** `docs/superpowers/specs/2026-09-30-aigc-video-binding-swap-design.md`

## Global Constraints

- “AOC激光投影广告” must use `videoAssets.projector`.
- “瑞美亚精华液广告2” must use `videoAssets.serum02`.
- Preserve project IDs, order, titles, covers, posters, metadata, OSS URLs, and all unrelated projects.
- Do not re-encode, rename, move, or upload video files.

---

### Task 1: Lock and correct the AIGC project-to-video mapping

**Files:**
- Modify: `scripts/verify-video-loading.mjs`
- Modify: `src/data/workCategories.js:168-189`

**Interfaces:**
- Consumes: `videoAssets.projector` and `videoAssets.serum02` from `src/config/videoAssets.js`.
- Produces: Correct `media[0].src` values for project IDs `aigc-video-02` and `aigc-video-03`.

- [ ] **Step 1: Write the failing regression assertions**

Add the following assertions after the existing centralized-asset assertions in `scripts/verify-video-loading.mjs`:

```js
const aocProject = data.match(/id: 'aigc-video-02'[\s\S]*?\n      },/)?.[0] ?? ''
const serumTwoProject = data.match(/id: 'aigc-video-03'[\s\S]*?\n      },/)?.[0] ?? ''
assert(aocProject.includes("title: 'AOC激光投影广告'"), 'AOC project title must stay on aigc-video-02')
assert(aocProject.includes('src: videoAssets.projector'), 'AOC project must use the projector video')
assert(serumTwoProject.includes("title: '瑞美亚精华液广告2'"), 'Serum ad 2 title must stay on aigc-video-03')
assert(serumTwoProject.includes('src: videoAssets.serum02'), 'Serum ad 2 must use the serum02 video')
```

- [ ] **Step 2: Run the verifier and confirm the current mapping fails**

Run: `npm run verify:video-loading`

Expected: FAIL with `AOC project must use the projector video`.

- [ ] **Step 3: Swap only the two source references**

In `src/data/workCategories.js`, make these exact replacements:

```js
// aigc-video-02
src: videoAssets.projector,

// aigc-video-03
src: videoAssets.serum02,
```

- [ ] **Step 4: Run focused and production verification**

Run:

```powershell
npm run verify:video-loading
npm run build
npm run lint
```

Expected: video verification and build pass; lint has no new errors.

- [ ] **Step 5: Review the diff for scope control**

Run: `git diff -- scripts/verify-video-loading.mjs src/data/workCategories.js`

Expected: only four new assertions plus the two exchanged `src` references; project order, titles, covers, and posters remain unchanged.

- [ ] **Step 6: Commit the implementation**

```powershell
git add scripts/verify-video-loading.mjs src/data/workCategories.js
git commit -m "fix: correct AIGC ad video bindings"
```

### Task 2: Publish and verify the live website

**Files:**
- Read: `scripts/publish_github_repository.ps1`
- Read: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: the committed production build on branch `deploy/2026-09-14`.
- Produces: updated GitHub Pages deployment at `https://ygystyrdqd-lab.github.io/tingting-portfolio/`.

- [ ] **Step 1: Publish the repository using the existing deployment script**

Run:

```powershell
pwsh -File scripts/publish_github_repository.ps1 -ProjectRoot "C:\Users\Mayn\Desktop\作品集\portfolio-site" -Owner "ygystyrdqd-lab" -Repository "tingting-portfolio"
```

Expected: the publish script pushes the new commit and reports the GitHub Pages workflow URL.

- [ ] **Step 2: Confirm the GitHub Pages workflow succeeds**

Inspect the latest `pages-build-deployment` or repository deployment workflow for the pushed commit.

Expected: workflow conclusion is `success` and the deployed commit matches the new remote HEAD.

- [ ] **Step 3: Verify both projects on the live AIGC video page**

Open `https://ygystyrdqd-lab.github.io/tingting-portfolio/?category=aigc-video` and check:

1. “AOC激光投影广告” opens the projector advertisement.
2. “瑞美亚精华液广告2” opens the second serum advertisement.
3. Titles, covers, card order, and navigation remain unchanged.

- [ ] **Step 4: Record the deployment result**

Run: `git status --short`

Expected: no uncommitted implementation changes remain.
