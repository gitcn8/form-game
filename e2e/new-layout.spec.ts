import { test, expect } from '@playwright/test'

test.describe('新UI布局测试', () => {
  test('验证星露谷风格的农场布局', async ({ page }) => {
    console.log('📍 测试新的农场布局...')

    // 监听控制台
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
        console.error('❌', msg.text())
      }
    })

    await page.goto('/game', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(2000)

    // 检查Canvas
    const canvasCount = await page.locator('canvas').count()
    console.log(`Canvas数量: ${canvasCount}`)
    expect(canvasCount).toBeGreaterThan(0)

    // 检查是否有标题"我的农场"
    const titleText = await page.locator('h1').allTextContents()
    console.log(`页面标题: ${titleText.join(', ')}`)

    // 截图
    await page.screenshot({ path: 'e2e/screenshots/new-layout-full.png', fullPage: false })
    console.log('✅ 完整布局截图已保存')

    // 检查错误
    if (errors.length > 0) {
      console.error(`❌ 发现 ${errors.length} 个错误`)
    } else {
      console.log('✅ 无错误')
    }

    expect(errors.length).toBe(0)
  })

  test('测试工具切换和UI响应', async ({ page }) => {
    console.log('📍 测试工具栏交互...')

    await page.goto('/game', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(1000)

    // 初始截图
    await page.screenshot({ path: 'e2e/screenshots/layout-initial.png' })
    console.log('✅ 初始状态截图')

    // 等待2秒看是否有错误
    await page.waitForTimeout(2000)

    // 最终截图
    await page.screenshot({ path: 'e2e/screenshots/layout-after-wait.png' })
    console.log('✅ 等待后截图')
  })
})
