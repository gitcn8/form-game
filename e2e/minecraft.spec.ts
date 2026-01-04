import { test, expect } from '@playwright/test'

test.describe('我的世界风格农场测试', () => {
  test('验证第一人称视角', async ({ page }) => {
    console.log('📍 测试我的世界风格农场...')

    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
        console.error('❌', msg.text())
      }
    })

    await page.goto('/farm3d', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(2000)

    // 检查Canvas
    const canvasCount = await page.locator('canvas').count()
    console.log(`Canvas数量: ${canvasCount}`)
    expect(canvasCount).toBeGreaterThan(0)

    // 检查标题
    const titleText = await page.locator('h1').textContent()
    console.log(`页面标题: ${titleText}`)
    expect(titleText).toContain('我的世界农场')

    // 截图
    await page.screenshot({ path: 'e2e/screenshots/minecraft-style.png' })
    console.log('✅ 截图已保存')

    if (errors.length > 0) {
      console.error(`❌ 发现 ${errors.length} 个错误`)
    } else {
      console.log('✅ 无错误')
    }

    expect(errors.length).toBe(0)
  })
})
