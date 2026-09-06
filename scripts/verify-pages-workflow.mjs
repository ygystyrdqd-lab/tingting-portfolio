import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const workflow = read('.github/workflows/deploy-pages.yml')
const gitignore = read('.gitignore')

for (const expected of [
  'branches: [main]',
  'pages: write',
  'id-token: write',
  'pnpm/action-setup@v4',
  'actions/setup-node@v6',
  'pnpm install --frozen-lockfile',
  'pnpm run build',
  'actions/configure-pages@v5',
  'actions/upload-pages-artifact@v4',
  'path: ./dist',
  'actions/deploy-pages@v4',
]) {
  assert(workflow.includes(expected), `Workflow is missing: ${expected}`)
}

assert(/^\*\.local$/m.test(gitignore), '.gitignore must exclude .env.local through *.local')

console.log('GitHub Pages workflow verified')
