import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../src/App.css', import.meta.url), 'utf8')
const requiredFragments = [
  '.project-art.has-cover img',
  'transform:scale(1.07)',
  'filter:brightness(.58) saturate(.48) contrast(1.08)',
  '.project-card:is(:hover,:focus-visible) .project-art.has-cover img',
  'transform:scale(1.02)',
  'filter:brightness(.92) saturate(.94) contrast(1.02)',
  'transition:transform .9s cubic-bezier(.2,.8,.2,1),filter .9s cubic-bezier(.2,.8,.2,1)',
  '@media(pointer:coarse),(max-width:620px)',
  'filter:brightness(.82) saturate(.82) contrast(1.03)',
  '@media(prefers-reduced-motion:reduce)',
  'filter:none!important',
  'transition:none!important',
]

for (const fragment of requiredFragments) assert.ok(css.includes(fragment), `Missing CSS fragment: ${fragment}`)
console.log('featured cover teaser CSS verified')
