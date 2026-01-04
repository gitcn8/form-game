import { test, expect } from '@playwright/test'

test.describe('独立3D农场游戏测试', () => {
  test('无需登录的3D农场', async ({ page }) => {
    const consoleLogs: string[] = []
    const errors: string[] = []

    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error') {
        errors.push(text)
      }
      consoleLogs.push(`[${msg.type()}] ${text}`)
    })

    console.log('📍 正在访问 /farm3d ...')
    await page.goto('/farm3d', { waitUntil: 'domcontentloaded', timeout: 10000 })

    // 等待一下让3D场景加载
    await page.waitForTimeout(2000)

    // 截图
    await page.screenshot({ path: 'e2e/screenshots/farm3d-game.png' })
    console.log('✅ 截图已保存')

    // 检查Canvas
    const canvasCount = await page.locator('canvas').count()
    console.log(`Canvas数量: ${canvasCount}`)

    // 检查页面内容
    const titleText = await page.locator('h1').textContent()
    console.log(`页面标题: ${titleText}`)

    // 检查是否显示游戏UI
    const hasUI = await page.locator('text=🪓 锄头').count() > 0
    console.log(`游戏UI可见: ${hasUI}`)

    // 输出控制台日志
    console.log('📋 控制台日志（前10条）:', consoleLogs.slice(0, 10))

    // 检查错误
    if (errors.length > 0) {
      console.error('❌ 发现错误:', errors)
    } else {
      console.log('✅ 无错误')
    }

    expect(canvasCount).toBeGreaterThan(0)
    expect(titleText).toContain('我的农场')
  })

  test('完整的游戏流程测试', async ({ page }) => {
    console.log('📍 测试完整游戏流程...')

    await page.goto('/farm3d', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    // 初始截图
    await page.screenshot({ path: 'e2e/screenshots/farm3d-initial.png' })
    console.log('✅ 初始状态截图')

    // 点击3次土地（耕地）
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    if (box) {
      // 点击中心位置
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(500)
      console.log('✅ 点击了土地')
    }

    // 最终截图
    await page.screenshot({ path: 'e2e/screenshots/farm3d-after-click.png' })
    console.log('✅ 操作后截图')
  })
})
