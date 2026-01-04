import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { useGameStore } from '../../store/gameStore'

export class MainScene extends Phaser.Scene {
  private graphics!: Phaser.GameObjects.Graphics
  private plots: Phaser.GameObjects.Rectangle[] = []
  private player!: Player
  private currentTool: string = 'hoe' // hoe, water, seed, harvest
  private toolText!: Phaser.GameObjects.Text
  private feedbackTexts: Phaser.GameObjects.Text[] = []
  private helpPanel!: Phaser.GameObjects.Container
  private helpVisible: boolean = false
  private keys!: {
    ONE: Phaser.Input.Keyboard.Key
    TWO: Phaser.Input.Keyboard.Key
    THREE: Phaser.Input.Keyboard.Key
    FOUR: Phaser.Input.Keyboard.Key
    H: Phaser.Input.Keyboard.Key
  }

  // 工具体力消耗（降低到原来的1/3）
  private readonly toolEnergyCost = {
    hoe: 2,
    water: 1,
    seed: 1,
    harvest: 0
  }

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    console.log('🎮 Phaser场景已创建')

    // 创建绘图对象
    this.graphics = this.add.graphics()

    // 绘制背景
    this.drawBackground()

    // 绘制农场土地
    this.drawFarmPlots()

    // 创建玩家
    this.player = new Player(this, 400, 300)

    // 设置工具切换快捷键
    this.keys = this.input.keyboard!.addKeys({
      ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
      TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
      THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
      FOUR: Phaser.Input.Keyboard.KeyCodes.FOUR,
      H: Phaser.Input.Keyboard.KeyCodes.H
    }) as typeof this.keys

    // 工具切换事件
    this.input.keyboard!.on('keydown-ONE', () => this.switchTool('hoe'))
    this.input.keyboard!.on('keydown-TWO', () => this.switchTool('water'))
    this.input.keyboard!.on('keydown-THREE', () => this.switchTool('seed'))
    this.input.keyboard!.on('keydown-FOUR', () => this.switchTool('harvest'))
    this.input.keyboard!.on('keydown-H', () => this.toggleHelp())

    // 添加UI文本
    this.add
      .text(400, 30, '🌾 农场主小游戏', {
        fontSize: '28px',
        color: '#1a202c',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(100)

    this.add
      .text(400, 55, 'WASD移动 | 1-4切换工具 | 点击土地使用工具 | H帮助', {
        fontSize: '14px',
        color: '#4a5568'
      })
      .setOrigin(0.5)
      .setDepth(100)

    // 工具栏提示（显示体力消耗）
    this.add
      .text(140, 570, '1:锄头(-2) 2:水壶(-1) 3:种子(-1) 4:镰刀(0)', {
        fontSize: '13px',
        color: '#4a5568',
        fontStyle: 'italic'
      })
      .setOrigin(0.5)
      .setDepth(100)

    // 当前工具显示
    this.toolText = this.add
      .text(660, 570, `当前: ${this.getToolEmoji(this.currentTool)}`, {
        fontSize: '18px',
        color: '#2d3748',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(100)

    console.log('✅ 场景初始化完成')
  }

  private switchTool(tool: string) {
    this.currentTool = tool
    this.toolText.setText(`当前: ${this.getToolEmoji(tool)}`)
    console.log(`🔧 切换工具: ${this.getToolEmoji(tool)}`)
  }

  private getToolEmoji(tool: string): string {
    const emojis = {
      hoe: '锄头 🪓',
      water: '水壶 💧',
      seed: '种子 🌱',
      harvest: '镰刀 🌾'
    }
    return emojis[tool as keyof typeof emojis] || tool
  }

  private checkEnergy(cost: number): boolean {
    const energy = useGameStore.getState().player.energy
    return energy >= cost
  }

  private consumeEnergy(cost: number): void {
    useGameStore.getState().useEnergy(cost)
    const energy = useGameStore.getState().player.energy
    const maxEnergy = useGameStore.getState().player.maxEnergy

    // 显示体力消耗提示
    this.showFeedback(`-${cost} 体力`, 400, 100, 0xff6b6b)
    console.log(`⚡ 体力消耗: ${cost}, 剩余: ${energy}/${maxEnergy}`)
  }

  private showFeedback(text: string, x: number, y: number, color: number = 0xffffff) {
    const feedback = this.add.text(x, y, text, {
      fontSize: '20px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    feedback.setOrigin(0.5)
    feedback.setDepth(1000)

    // 动画效果：向上飘动并消失
    this.tweens.add({
      targets: feedback,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        feedback.destroy()
      }
    })
  }

  private createHelpPanel() {
    this.helpPanel = this.add.container(400, 300)
    this.helpPanel.setDepth(2000)
    this.helpPanel.setVisible(false)

    // 半透明背景
    const bg = this.add.rectangle(0, 0, 700, 450, 0x000000, 0.85)
    bg.setOrigin(0.5)
    this.helpPanel.add(bg)

    // 边框
    const border = this.add.rectangle(0, 0, 700, 450, 0x4a5568)
    border.setOrigin(0.5)
    border.setStrokeStyle(4, 0x68d391)
    this.helpPanel.add(border)

    // 标题
    const title = this.add.text(0, -180, '🎮 游戏说明', {
      fontSize: '32px',
      color: '#68d391',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)
    this.helpPanel.add(title)

    // 帮助内容
    const helpText = this.add.text(0, -130, [
      '🎯 游戏目标：种植作物、收获赚钱！',
      '',
      '⌨️ 操作说明：',
      '  • WASD / 方向键 - 移动角色',
      '  • 1-4 - 切换工具',
      '  • 鼠标点击 - 使用工具',
      '  • H - 显示/隐藏帮助',
      '',
      '🔧 工具介绍：',
      '  1. 锄头 🪓 - 开垦土地 (消耗2体力)',
      '  2. 水壶 💧 - 浇水加速生长 (消耗1体力)',
      '  3. 种子 🌱 - 播种作物 (消耗1体力)',
      '  4. 镰刀 🌾 - 收获成熟作物 (消耗0体力)',
      '',
      '🌱 作物流程：',
      '  空地 → 耕地 → 浇水 → 播种 → 等待成熟 → 收获',
      '  （萝卜需要10秒成熟，收获获得10金币）',
      '',
      '💡 提示：体力不足时无法操作，点击"睡觉"恢复体力'
    ].join('\n'), {
      fontSize: '16px',
      color: '#e2e8f0',
      lineSpacing: 8,
      align: 'left'
    })
    helpText.setOrigin(0.5, 0)
    this.helpPanel.add(helpText)

    // 关闭提示
    const closeText = this.add.text(0, 190, '按 H 键关闭', {
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold'
    })
    closeText.setOrigin(0.5)
    this.helpPanel.add(closeText)
  }

  private toggleHelp() {
    if (!this.helpPanel) {
      this.createHelpPanel()
    }

    this.helpVisible = !this.helpVisible
    this.helpPanel.setVisible(this.helpVisible)
    console.log(this.helpVisible ? '📖 显示帮助面板' : '❌ 关闭帮助面板')
  }

  private drawBackground() {
    // 绘制草地背景
    this.graphics.fillStyle(0x90cdf4, 1)
    this.graphics.fillRect(0, 0, 800, 600)

    // 绘制装饰性草地
    this.graphics.fillStyle(0x68d391, 0.3)
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, 800)
      const y = Phaser.Math.Between(0, 600)
      const size = Phaser.Math.Between(30, 80)
      this.graphics.fillCircle(x, y, size)
    }
  }

  private drawFarmPlots() {
    const plotSize = 56
    const gap = 10
    const rows = 4
    const cols = 6
    const totalWidth = cols * plotSize + (cols - 1) * gap
    const totalHeight = rows * plotSize + (rows - 1) * gap
    const startX = 400 - totalWidth / 2 + plotSize / 2
    const startY = 320 - totalHeight / 2 + plotSize / 2

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (plotSize + gap)
        const y = startY + row * (plotSize + gap)

        // 绘制土地
        const plot = this.add.rectangle(x, y, plotSize, plotSize, 0x8b6914)
        plot.setStrokeStyle(2, 0x5c3d0a)
        plot.setData('plotId', row * cols + col)
        plot.setData('state', 'empty')
        plot.setInteractive()

        // 点击事件
        plot.on('pointerdown', () => {
          this.handlePlotClick(plot)
        })

        // 鼠标悬停效果
        plot.on('pointerover', () => {
          plot.setStrokeStyle(4, 0xffd700)
        })

        plot.on('pointerout', () => {
          const state = plot.getData('state')
          const color = state === 'watered' ? 0x1e40af : 0x5c3d0a
          plot.setStrokeStyle(2, color)
        })

        this.plots.push(plot)

        // 添加土地编号（更小更淡）
        this.add
          .text(x, y, `${row * cols + col + 1}`, {
            fontSize: '9px',
            color: 'rgba(254, 243, 199, 0.4)',
            fontStyle: 'bold'
          })
          .setOrigin(0.5)
          .setDepth(1)
      }
    }

    console.log(`✅ 创建了 ${this.plots.length} 块土地`)

    // 添加装饰元素
    this.addDecorations()
  }

  private addDecorations() {
    // 添加小房子（左上角）
    this.drawHouse(80, 80)

    // 添加水井（右上角）
    this.drawWell(720, 80)

    // 添加仓库（右下角）
    this.drawWarehouse(700, 520)

    // 添加树木（分布在边缘，避开中央农场区域）
    const treePositions = [
      { x: 40, y: 200 },
      { x: 40, y: 350 },
      { x: 40, y: 500 },
      { x: 760, y: 250 },
      { x: 760, y: 400 },
      { x: 200, y: 60 },
      { x: 400, y: 55 },
      { x: 600, y: 60 }
    ]
    treePositions.forEach(pos => this.drawTree(pos.x, pos.y))

    // 添加花草（在边缘区域）
    for (let i = 0; i < 20; i++) {
      const side = Phaser.Math.Between(0, 3)
      let x: number, y: number

      // 在四个边缘随机生成，避开中央农场
      switch(side) {
        case 0: // 上边
          x = Phaser.Math.Between(50, 750)
          y = Phaser.Math.Between(50, 100)
          break
        case 1: // 下边
          x = Phaser.Math.Between(50, 750)
          y = Phaser.Math.Between(500, 550)
          break
        case 2: // 左边
          x = Phaser.Math.Between(50, 100)
          y = Phaser.Math.Between(100, 500)
          break
        case 3: // 右边
          x = Phaser.Math.Between(700, 750)
          y = Phaser.Math.Between(100, 500)
          break
        default:
          x = Phaser.Math.Between(50, 750)
          y = Phaser.Math.Between(50, 550)
      }
      this.drawFlower(x, y)
    }

    // 添加石头（在边缘区域）
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(50, 750)
      const y = Phaser.Math.Between(50, 550)

      // 简单检查是否在中央农场区域（跳过）
      if (x > 150 && x < 650 && y > 150 && y < 490) {
        continue
      }
      this.drawRock(x, y)
    }

    // 添加栅栏（装饰性边界）
    this.drawFence()

    console.log('✅ 添加了场景装饰')
  }

  private drawWarehouse(x: number, y: number) {
    const container = this.add.container(x, y)

    // 仓库主体
    const house = this.add.rectangle(0, 5, 55, 40, 0xcd853f)
    house.setStrokeStyle(2, 0x8b4513)
    container.add(house)

    // 屋顶
    const roof = this.add.rectangle(0, -12, 68, 22, 0x8b0000)
    roof.setStrokeStyle(2, 0x5c0000)
    container.add(roof)

    // 大门
    const door = this.add.rectangle(0, 12, 18, 16, 0x654321)
    door.setStrokeStyle(1, 0x3e2723)
    container.add(door)

    // 窗户
    const window1 = this.add.rectangle(-14, 2, 8, 8, 0x87ceeb)
    window1.setStrokeStyle(1, 0x4682b4)
    container.add(window1)

    const window2 = this.add.rectangle(14, 2, 8, 8, 0x87ceeb)
    window2.setStrokeStyle(1, 0x4682b4)
    container.add(window2)

    container.setDepth(0)
  }

  private drawFence() {
    // 简单的栅栏边界
    const fenceColor = 0x8b4513
    const fencePositions = [
      // 上边栅栏
      { x: 120, y: 130, w: 80, h: 8 },
      { x: 600, y: 130, w: 80, h: 8 },
      // 下边栅栏
      { x: 120, y: 510, w: 80, h: 8 },
      { x: 600, y: 510, w: 80, h: 8 },
      // 左边栅栏
      { x: 120, y: 250, w: 8, h: 60 },
      { x: 120, y: 390, w: 8, h: 60 },
      // 右边栅栏
      { x: 680, y: 250, w: 8, h: 60 },
      { x: 680, y: 390, w: 8, h: 60 }
    ]

    fencePositions.forEach(pos => {
      const fence = this.add.rectangle(pos.x, pos.y, pos.w, pos.h, fenceColor)
      fence.setStrokeStyle(1, 0x654321)
      fence.setDepth(-1)
    })
  }

  private drawHouse(x: number, y: number) {
    const container = this.add.container(x, y)

    // 房子主体
    const house = this.add.rectangle(0, 10, 60, 45, 0xf4a460)
    house.setStrokeStyle(2, 0x8b4513)
    container.add(house)

    // 屋顶（用梯形模拟：一个宽矩形）
    const roof = this.add.rectangle(0, -15, 75, 25, 0xb22222)
    roof.setStrokeStyle(2, 0x8b0000)
    container.add(roof)

    // 门
    const door = this.add.rectangle(0, 18, 14, 20, 0x654321)
    door.setStrokeStyle(1, 0x3e2723)
    container.add(door)

    // 左窗户
    const window1 = this.add.rectangle(-16, 8, 10, 10, 0x87ceeb)
    window1.setStrokeStyle(1, 0x4682b4)
    container.add(window1)

    // 右窗户
    const window2 = this.add.rectangle(16, 8, 10, 10, 0x87ceeb)
    window2.setStrokeStyle(1, 0x4682b4)
    container.add(window2)

    // 烟囱
    const chimney = this.add.rectangle(16, -25, 10, 18, 0x8b4513)
    chimney.setStrokeStyle(1, 0x5d3a1a)
    container.add(chimney)

    container.setDepth(0)
  }

  private drawWell(x: number, y: number) {
    const container = this.add.container(x, y)

    // 井壁
    const well = this.add.circle(0, 0, 22, 0x808080)
    well.setStrokeStyle(3, 0x696969)
    container.add(well)

    // 井水
    const water = this.add.circle(0, 0, 16, 0x4169e1)
    container.add(water)

    // 井架（两根柱子）
    const post1 = this.add.rectangle(-12, -18, 4, 25, 0x8b4513)
    post1.setStrokeStyle(1, 0x654321)
    container.add(post1)

    const post2 = this.add.rectangle(12, -18, 4, 25, 0x8b4513)
    post2.setStrokeStyle(1, 0x654321)
    container.add(post2)

    // 横梁
    const beam = this.add.rectangle(0, -25, 30, 4, 0x654321)
    container.add(beam)

    container.setDepth(0)
  }

  private drawTree(x: number, y: number) {
    const container = this.add.container(x, y)

    // 树干
    const trunk = this.add.rectangle(0, 12, 10, 20, 0x8b4513)
    trunk.setStrokeStyle(1, 0x654321)
    container.add(trunk)

    // 树冠（用3个圆形叠加，从下到上变小）
    const layer1 = this.add.circle(0, -2, 20, 0x228b22)
    layer1.setStrokeStyle(1, 0x006400)
    container.add(layer1)

    const layer2 = this.add.circle(0, -18, 16, 0x228b22)
    layer2.setStrokeStyle(1, 0x006400)
    container.add(layer2)

    const layer3 = this.add.circle(0, -32, 12, 0x228b22)
    layer3.setStrokeStyle(1, 0x006400)
    container.add(layer3)

    container.setDepth(0)
  }

  private drawFlower(x: number, y: number) {
    const container = this.add.container(x, y)
    const colors = [0xff69b4, 0xff6347, 0xffd700, 0x9370db, 0xffffff]
    const color = Phaser.Utils.Array.GetRandom(colors)

    // 茎
    const stem = this.add.rectangle(0, 6, 2, 10, 0x228b22)
    container.add(stem)

    // 花瓣
    const flower = this.add.circle(0, 0, 5, color)
    flower.setStrokeStyle(1, 0xffb6c1)
    container.add(flower)

    // 花蕊
    const center = this.add.circle(0, 0, 2, 0xffd700)
    container.add(center)

    container.setDepth(-1)
  }

  private drawRock(x: number, y: number) {
    const container = this.add.container(x, y)
    const rock = this.add.ellipse(0, 0, Phaser.Math.Between(12, 18), Phaser.Math.Between(8, 11), 0x808080)
    rock.setStrokeStyle(1, 0x696969)
    container.add(rock)
    container.setDepth(-1)
  }

  private handlePlotClick(plot: Phaser.GameObjects.Rectangle) {
    const currentState = plot.getData('state')
    const energyCost = this.toolEnergyCost[this.currentTool as keyof typeof this.toolEnergyCost]

    console.log(`点击土地 #${plot.getData('plotId')}, 当前状态: ${currentState}, 工具: ${this.currentTool}`)

    // 检查体力是否足够
    if (!this.checkEnergy(energyCost)) {
      this.showFeedback('❌ 体力不足！', plot.x, plot.y - 20, 0xff4444)
      console.log('⚠️ 体力不足，无法执行操作')
      return
    }

    switch (this.currentTool) {
      case 'hoe':
        if (currentState === 'empty') {
          this.consumeEnergy(energyCost)
          plot.fillColor = 0x5c3d0a // 深棕色（耕地）
          plot.setData('state', 'tilled')
          this.showFeedback('✅ 已开垦', plot.x, plot.y - 20, 0x90EE90)
          console.log('✅ 土地已开垦')
        } else {
          this.showFeedback('⚠️ 无需开垦', plot.x, plot.y - 20, 0xFFD700)
        }
        break

      case 'water':
        if (currentState === 'tilled' || currentState === 'planted') {
          this.consumeEnergy(energyCost)
          plot.fillColor = 0x1e40af // 深蓝色（湿润）
          plot.setStrokeStyle(2, 0x1e40af)
          plot.setData('state', 'watered')
          this.showFeedback('💧 已浇水', plot.x, plot.y - 20, 0x87CEEB)
          console.log('✅ 土地已浇水')
        } else if (currentState === 'watered') {
          this.showFeedback('⚠️ 已浇水', plot.x, plot.y - 20, 0xFFD700)
        } else {
          this.showFeedback('⚠️ 无法浇水', plot.x, plot.y - 20, 0xFFD700)
        }
        break

      case 'seed':
        if (currentState === 'tilled' || currentState === 'watered') {
          this.consumeEnergy(energyCost)
          plot.fillColor = 0x22c55e // 绿色（播种）
          plot.setData('state', 'planted')
          plot.setData('crop', '萝卜')
          plot.setData('plantTime', this.time.now) // 记录播种时间

          // 添加作物图标
          const cropText = this.add.text(plot.x, plot.y, '🌱', {
            fontSize: '32px'
          })
          cropText.setOrigin(0.5).setDepth(2)
          plot.setData('cropText', cropText) // 保存引用

          this.showFeedback('🌱 已播种', plot.x, plot.y - 20, 0x90EE90)
          console.log('✅ 已播种萝卜')
        } else if (currentState === 'planted') {
          this.showFeedback('⚠️ 已有作物', plot.x, plot.y - 20, 0xFFD700)
          console.log('⚠️ 这块地已经种了作物')
        } else {
          this.showFeedback('⚠️ 需要先耕地', plot.x, plot.y - 20, 0xFFD700)
        }
        break

      case 'harvest':
        if (currentState === 'ready') {
          this.consumeEnergy(energyCost)
          // 收获成熟作物
          plot.fillColor = 0x8b6914 // 恢复为棕色
          plot.setStrokeStyle(2, 0x5c3d0a)
          plot.setData('state', 'empty')
          plot.setData('crop', null)

          // 移除作物图标
          const cropText = plot.getData('cropText')
          if (cropText) {
            cropText.destroy()
          }

          // 奖励金币
          useGameStore.getState().addGold(10)
          this.showFeedback('🥕 +10金币', plot.x, plot.y - 20, 0xFFD700)
          console.log('✅ 已收获萝卜，获得10金币')
        } else if (currentState === 'planted') {
          this.showFeedback('⚠️ 未成熟', plot.x, plot.y - 20, 0xFFD700)
          console.log('⚠️ 作物还没成熟，需要等待')
        } else if (currentState === 'empty' || currentState === 'tilled') {
          this.showFeedback('⚠️ 无作物', plot.x, plot.y - 20, 0xFFD700)
          console.log('⚠️ 这里没有作物可以收获')
        }
        break
    }
  }

  update(time: number, delta: number) {
    // 更新玩家
    this.player.update(delta)

    // 更新作物生长（每秒检查一次）
    this.updateCrops()
  }

  private updateCrops() {
    const now = this.time.now

    this.plots.forEach(plot => {
      const state = plot.getData('state')

      // 只处理已播种的作物
      if (state === 'planted') {
        const plantTime = plot.getData('plantTime')
        const crop = plot.getData('crop')

        if (plantTime && crop) {
          // 萝卜生长需要10秒（测试用）
          const growthTime = 10000
          const elapsed = now - plantTime

          if (elapsed >= growthTime) {
            // 作物成熟
            plot.fillColor = 0xffa500 // 橙色（成熟）
            plot.setData('state', 'ready')

            // 更新作物图标
            const cropText = plot.getData('cropText')
            if (cropText) {
              cropText.setText('🥕') // 萝卜图标
            }

            console.log(`✅ 作物成熟！土地 #${plot.getData('plotId')}`)
          }
        }
      }
    })
  }
}
