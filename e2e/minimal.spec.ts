import { test, expect } from '@playwright/test'

test('Minimal Canvas test', async ({ page }) => {
  console.log('📍 Testing /testminimal ...')
  await page.goto('/testminimal', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await page.waitForTimeout(2000)

  const canvasCount = await page.locator('canvas').count()
  console.log(`Canvas数量: ${canvasCount}`)

  const h1Text = await page.locator('h1').textContent()
  console.log(`标题: ${h1Text}`)

  // Capture console errors
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
      console.error('❌', msg.text())
    }
  })

  await page.screenshot({ path: 'e2e/screenshots/testminimal.png' })
  console.log('✅ 截图已保存')

  expect(canvasCount).toBeGreaterThan(0)
  expect(h1Text).toContain('Minimal Test')
})
