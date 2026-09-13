import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const app = await readFile(resolve(root, 'src/App.jsx'), 'utf8')
const css = await readFile(resolve(root, 'src/App.css'), 'utf8')
const asset = await stat(resolve(root, 'public/hero-avatar-framing.png'))

const checks = [
  ['portrait reference', app.includes("assetUrl('hero-avatar-framing.png')")],
  ['framing layer', app.includes('className="avatar-viewfinder"')],
  ['decorative semantics', app.includes('className="avatar-viewfinder" aria-hidden="true"')],
  ['activation state', app.includes("className={`hero-avatar${isFramingActive ? ' is-framing-active' : ''}`}")],
  ['viewfinder styles', css.includes('.avatar-viewfinder{')],
  ['scan animation', css.includes('@keyframes viewfinderScan')],
  ['reduced motion', /prefers-reduced-motion:reduce[\s\S]*avatar-viewfinder/.test(css)],
  ['full-body composition marker', css.includes('/* HERO FULL-BODY COMPOSITION */')],
  ['desktop full-body height', css.includes('height:88%')],
  ['top hand clearance', css.includes('top:1%')],
  ['bounded vertical parallax', css.includes('--avatar-y-safe:clamp(-2px,var(--avatar-y),2px)')],
  ['ground shadow restored', css.includes('.hero-closeup .avatar-ground{display:block')],
  ['valid asset size', asset.size > 500_000],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exitCode = 1
