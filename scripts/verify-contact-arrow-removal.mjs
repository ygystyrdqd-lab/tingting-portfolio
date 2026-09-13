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
