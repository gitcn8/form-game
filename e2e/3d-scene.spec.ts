import { test, expect } from '@playwright/test'

test.describe('3D场景测试', () => {
  test('快速检查3D测试页面', async ({ page }) => {
    // 监听控制台
    const consoleLogs: string[] = []
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`)
    })

    console.log('📍 正在访问 /test3d ...')
    await page.goto('/test3d', { waitUntil: 'domcontentloaded', timeout: 10000 })

    // 快速截图
    await page.screenshot({ path: 'e2e/screenshots/test3d-quick.png' })
    console.log('✅ 截图已保存')

    // 检查页面是否有内容
    const title = page.locator('h1')
    const titleVisible = await title.isVisible().catch(() => false)
    console.log(`标题可见: ${titleVisible}`)

    // 检查Canvas
    const canvasCount = await page.locator('canvas').count()
    console.log(`Canvas数量: ${canvasCount}`)

    // 输出控制台日志
    console.log('📋 控制台日志:', consoleLogs.slice(0, 20))

    // 保存页面HTML
    const html = await page.content()
    console.log('页面HTML长度:', html.length)

    expect(canvasCount).toBeGreaterThan(0)
  })

  test('检查游戏页面', async ({ page }) => {
    console.log('📍 正在访问 /game ...')
    await page.goto('/game', { waitUntil: 'domcontentloaded', timeout: 15000 })

    // 截图
    await page.screenshot({
      path: 'e2e/screenshots/game-page.png',
      fullPage: false
    })
    console.log('✅ 游戏页面截图已保存')

    // 检查关键元素
    const hasCanvas = await page.locator('canvas').count() > 0
    console.log(`有Canvas: ${hasCanvas}`)

    // 检查是否有错误
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
        console.error('❌ 控制台错误:', msg.text())
      }
    })

    // 等待2秒看是否有错误
    await page.waitForTimeout(2000)

    if (errors.length > 0) {
      console.error('发现', errors.length, '个错误')
    } else {
      console.log('✅ 无控制台错误')
    }
  })
})
