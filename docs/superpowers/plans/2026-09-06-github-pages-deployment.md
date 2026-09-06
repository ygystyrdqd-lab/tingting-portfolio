# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing portfolio to a new public GitHub repository named `tingting-portfolio` with automatic GitHub Pages deployments.

**Architecture:** Keep Vite as the static build system and add an environment-aware Pages base path. A GitHub Actions workflow builds `main` with pnpm and deploys `dist`; query-string category pages remain client-rendered and need no route fallback.

**Tech Stack:** React 19, Vite 8, pnpm, Git, GitHub Actions, GitHub Pages
**Spec:** `docs/superpowers/specs/2026-09-06-github-pages-deployment-design.md`

## Global Constraints

- Create a new public repository named exactly `tingting-portfolio`.
- Never commit `.env.local`, license keys, `node_modules`, or `dist`.
- Production assets must resolve below `/tingting-portfolio/`; local development must continue to resolve from `/`.
- Preserve the current UI, animation behavior, category query parameters, images, and videos.
- Publish from GitHub Actions whenever `main` is updated.

---

### Task 1: Make Static Assets Pages-Aware

**Files:**
- Create: `src/lib/assetUrl.js`
- Modify: `src/data/workCategories.js`
- Modify: `src/App.jsx`
- Modify: `src/components/work/WorkCategoryPage.jsx`
- Modify: `vite.config.js`
- Create: `scripts/verify-pages-paths.mjs`

**Interfaces:**
- Produces: `assetUrl(path: string): string`, returning a URL prefixed by `import.meta.env.BASE_URL`.
- Consumes: all public asset paths currently beginning with `/`.

- [ ] **Step 1: Write the failing path verification**

Create `scripts/verify-pages-paths.mjs` to assert that `vite.config.js` configures the Pages base, `src/lib/assetUrl.js` uses `import.meta.env.BASE_URL`, application files contain no literal public media paths beginning with `/work/`, `/hero-`, or `/about-`, and primary navigation contains no root-only `/#...` links.

- [ ] **Step 2: Run the verification and confirm failure**

Run: `node scripts/verify-pages-paths.mjs`

Expected: failure because the helper and Pages base do not exist yet.

- [ ] **Step 3: Implement the asset helper and base configuration**

Create:

```js
export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
```

Set `base: process.env.GITHUB_ACTIONS ? '/tingting-portfolio/' : '/'` in `vite.config.js`. Wrap every public media `cover`, `src`, and `poster` in `workCategories.js` with `assetUrl(...)`. Use the same helper for the hero and about portraits, main navigation, and category-page return links so GitHub Pages never navigates outside the repository subpath.

- [ ] **Step 4: Verify both local and Pages builds**

Run: `node scripts/verify-pages-paths.mjs`, `pnpm run lint`, and `pnpm run build`.

Expected: verification and builds pass; the existing `react(only-export-components)` warning may remain.

Run: `$env:GITHUB_ACTIONS='true'; pnpm run build; Remove-Item Env:GITHUB_ACTIONS`.

Expected: `dist/index.html` references `/tingting-portfolio/assets/...` and runtime media URLs use the same base.

- [ ] **Step 5: Hold changes for the initial repository commit**

Do not commit yet. Task 3 creates the initial commit containing the validated site and deployment configuration.

---

### Task 2: Add the Automatic Pages Workflow

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `.gitignore`
- Create: `scripts/verify-pages-workflow.mjs`

**Interfaces:**
- Consumes: `pnpm-lock.yaml`, `pnpm run build`, and Vite's Pages base path.
- Produces: a Pages artifact from `dist` and a GitHub Pages deployment.

- [ ] **Step 1: Write the failing workflow verification**

Create `scripts/verify-pages-workflow.mjs` to assert that the workflow triggers on `main`, grants `pages: write` and `id-token: write`, installs pnpm and Node, runs `pnpm install --frozen-lockfile`, builds, uploads `dist`, and deploys Pages. Also assert `.gitignore` excludes `.env.local` through `*.local`.

- [ ] **Step 2: Run the verification and confirm failure**

Run: `node scripts/verify-pages-workflow.mjs`

Expected: failure because the workflow is absent.

- [ ] **Step 3: Create the workflow**

Add `.github/workflows/deploy-pages.yml` with push and manual triggers, `contents: read`, `pages: write`, `id-token: write`, a non-overlapping Pages concurrency group, a build job using the pnpm lockfile, and a deploy job using the `github-pages` environment.

- [ ] **Step 4: Verify the workflow**

Run: `node scripts/verify-pages-workflow.mjs`

Expected: `GitHub Pages workflow verified`.

- [ ] **Step 5: Confirm secrets remain excluded**

After Git initialization, run: `git check-ignore -v .env.local node_modules dist`.

Expected: all three paths are ignored.

---

### Task 3: Create and Publish the GitHub Repository

**Files:**
- Create: `.git/` through `git init`
- Include: all validated project files except ignored content

**Interfaces:**
- Consumes: validated source and workflow from Tasks 1–2.
- Produces: public repository `tingting-portfolio`, default branch `main`, and `origin` remote.

- [ ] **Step 1: Initialize source control safely**

Run: `git init -b main`, then confirm `.env.local`, `node_modules`, and `dist` are ignored.

- [ ] **Step 2: Inspect the exact upload set**

Stage with `git add .`, then run `git status --short` and `git diff --cached --stat`.

Expected: source, public media, docs, scripts, and workflow are included; ignored content is absent.

- [ ] **Step 3: Create the initial commit**

Run: `git commit -m "feat: publish portfolio website"`.

Expected: one initial commit on `main` containing the validated site.

- [ ] **Step 4: Create the public repository**

In the signed-in GitHub web interface, create `tingting-portfolio` as Public without adding a README, license, or `.gitignore`. If the name already exists, stop without overwriting and ask the user whether to use it.

- [ ] **Step 5: Add the remote and push**

Use the exact HTTPS repository URL shown by GitHub, add it as `origin`, and run `git push -u origin main`. If authentication is requested, use Git Credential Manager's browser authorization. Never put credentials in the remote URL or project files.

Expected: `main` appears in the public repository and tracks `origin/main`.

---

### Task 4: Enable Pages and Validate Production

**Files:**
- No local file changes expected.

**Interfaces:**
- Consumes: pushed `main` branch and `deploy-pages.yml`.
- Produces: public Pages URL reported by the successful deployment.

- [ ] **Step 1: Confirm the workflow starts**

Open repository Actions and verify `Deploy GitHub Pages` runs. If GitHub requires Pages source selection, choose `GitHub Actions` in Settings → Pages.

- [ ] **Step 2: Wait for successful deployment**

Verify build and deploy jobs complete. If a job fails, inspect its first failing step, make only the required correction, rerun local checks, commit, and push the fix.

- [ ] **Step 3: Validate the public site**

Open the Pages URL and confirm the opening completes, navigation works, fifth-screen cards open matching `?category=` pages, images load, each MP4 can start, and direct category URLs begin at the top.

- [ ] **Step 4: Verify safety and working state**

Confirm the public repository does not contain `.env.local`. Run `git status --short --branch` locally.

Expected: `main` tracks `origin/main` and the working tree is clean.

- [ ] **Step 5: Hand off the links**

Return the public repository URL and GitHub Pages URL, noting that future pushes to `main` publish automatically.
