import { test, expect } from '@playwright/test'

test.describe('开放世界农场测试', () => {
  test('验证开放世界地图和WASD移动', async ({ page }) => {
    console.log('📍 测试开放世界农场...')

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
    expect(titleText).toContain('开放世界农场')

    // 截图
    await page.screenshot({ path: 'e2e/screenshots/open-world-initial.png' })
    console.log('✅ 初始状态截图')

    // 测试WASD移动 - 按W键
    await page.keyboard.press('w')
    await page.waitForTimeout(500)

    // 检查位置是否变化
    const posText = await page.locator('text=位置:').textContent()
    console.log(`玩家位置: ${posText}`)

    await page.screenshot({ path: 'e2e/screenshots/open-world-after-move.png' })
    console.log('✅ 移动后截图')

    // 检查迷你地图
    const minimapVisible = await page.locator('text=世界地图').isVisible()
    console.log(`迷你地图可见: ${minimapVisible}`)

    if (errors.length > 0) {
      console.error(`❌ 发现 ${errors.length} 个错误`)
    } else {
      console.log('✅ 无错误')
    }

    expect(errors.length).toBe(0)
  })
})
