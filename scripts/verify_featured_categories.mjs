import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { featuredWorkCategories, getWorkCategory, workCategories } from '../src/data/workCategories.js'

const ecommerce = workCategories.find(({ slug }) => slug === 'ecommerce')
assert.equal(ecommerce.title, '产品视觉设计')
assert.equal(ecommerce.projects.length, 3)

assert.deepEqual(
  featuredWorkCategories.map(({ slug, title }) => [slug, title]),
  [
    ['ip-visual', 'IP视觉设计'],
    ['campaign-visual', '电商与活动视觉'],
    ['aigc-workflow', 'AIGC工作流'],
  ],
)

for (const category of featuredWorkCategories) {
  assert.equal(category.projects.length, 1)
  assert.equal(getWorkCategory(category.slug), category)
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const expectedProjects = [
  {
    slug: 'ip-visual',
    title: '花小灵IP形象设计',
    cover: '/work/ip-visual-01/cover.webp',
    media: ['/work/ip-visual-01/detail-01.webp'],
  },
  {
    slug: 'campaign-visual',
    title: 'AOC投影仪电商视觉',
    cover: '/work/campaign-visual-01/cover.webp',
    media: [
      '/work/campaign-visual-01/detail-01.webp',
      '/work/campaign-visual-01/detail-02.webp',
      '/work/campaign-visual-01/detail-03.webp',
    ],
  },
  {
    slug: 'aigc-workflow',
    title: 'AI空间场景生成工作流',
    cover: '/work/aigc-workflow-01/cover.webp',
    media: ['/work/aigc-workflow-01/detail-01.webp'],
  },
]

for (const expected of expectedProjects) {
  const category = getWorkCategory(expected.slug)
  const project = category.projects[0]
  assert.equal(project.title, expected.title)
  assert.equal(project.cover, expected.cover)
  assert.deepEqual(project.media.map(({ src }) => src), expected.media)
  assert.ok(project.media.every(({ type }) => type === 'image'))
  for (const publicPath of [expected.cover, ...expected.media]) {
    await access(path.join(projectRoot, 'public', publicPath.replace(/^\//, '')))
  }
}

console.log('featured category data verified')
