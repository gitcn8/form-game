import Phaser from 'phaser'

export class Player {
  private container: Phaser.GameObjects.Container
  private body!: Phaser.GameObjects.Rectangle
  private head!: Phaser.GameObjects.Circle
  private leftArm!: Phaser.GameObjects.Rectangle
  private rightArm!: Phaser.GameObjects.Rectangle
  private leftLeg!: Phaser.GameObjects.Rectangle
  private rightLeg!: Phaser.GameObjects.Rectangle

  private velocity: Phaser.Math.Vector2
  private speed: number = 150
  private isMoving: boolean = false

  private keys: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
    UP: Phaser.Input.Keyboard.Key
    LEFT: Phaser.Input.Keyboard.Key
    DOWN: Phaser.Input.Keyboard.Key
    RIGHT: Phaser.Input.Keyboard.Key
  }

  private walkCycle: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y)
    this.createCharacter(scene)

    this.velocity = new Phaser.Math.Vector2(0, 0)

    this.keys = scene.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      UP: Phaser.Input.Keyboard.KeyCodes.UP,
      LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
      DOWN: Phaser.Input.Keyboard.KeyCodes.DOWN,
      RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT
    }) as typeof this.keys

    console.log('✅ 角色已创建')
  }

  private createCharacter(scene: Phaser.Scene) {
    // 身体（蓝色上衣）
    this.body = scene.add.rectangle(0, 5, 20, 24, 0x4a90d9)
    this.body.setOrigin(0.5, 0)
    this.container.add(this.body)

    // 头（肤色圆）
    this.head = scene.add.circle(0, -8, 12, 0xffcc99)
    this.container.add(this.head)

    // 左臂
    this.leftArm = scene.add.rectangle(-12, 0, 6, 16, 0xffcc99)
    this.leftArm.setOrigin(0.5, 0)
    this.container.add(this.leftArm)

    // 右臂
    this.rightArm = scene.add.rectangle(12, 0, 6, 16, 0xffcc99)
    this.rightArm.setOrigin(0.5, 0)
    this.container.add(this.rightArm)

    // 左腿
    this.leftLeg = scene.add.rectangle(-5, 16, 6, 12, 0x2d5016)
    this.leftLeg.setOrigin(0.5, 0)
    this.container.add(this.leftLeg)

    // 右腿
    this.rightLeg = scene.add.rectangle(5, 16, 6, 12, 0x2d5016)
    this.rightLeg.setOrigin(0.5, 0)
    this.container.add(this.rightLeg)
  }

  update(delta: number) {
    this.velocity.set(0, 0)
    this.isMoving = false

    if (this.keys.W.isDown || this.keys.UP.isDown) {
      this.velocity.y = -1
    }
    if (this.keys.S.isDown || this.keys.DOWN.isDown) {
      this.velocity.y = 1
    }
    if (this.keys.A.isDown || this.keys.LEFT.isDown) {
      this.velocity.x = -1
    }
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) {
      this.velocity.x = 1
    }

    if (this.velocity.length() > 0) {
      this.velocity.normalize().scale(this.speed)
      this.isMoving = true
    }

    const deltaTime = delta / 1000
    this.container.x += this.velocity.x * deltaTime
    this.container.y += this.velocity.y * deltaTime

    this.container.x = Phaser.Math.Clamp(this.container.x, 20, 780)
    this.container.y = Phaser.Math.Clamp(this.container.y, 20, 580)

    this.updateAnimation(deltaTime)
  }

  private updateAnimation(deltaTime: number) {
    if (!this.isMoving) {
      // 站立姿态
      this.leftArm.setAngle(0.1)
      this.rightArm.setAngle(-0.1)
      this.leftLeg.setAngle(0)
      this.rightLeg.setAngle(0)
      return
    }

    this.walkCycle += deltaTime * 0.01

    // 腿部摆动
    const legSwing = Math.sin(this.walkCycle) * 0.3
    this.leftLeg.setAngle(legSwing)
    this.rightLeg.setAngle(-legSwing)

    // 手臂摆动（与腿相反）
    const armSwing = Math.sin(this.walkCycle) * 0.25
    this.leftArm.setAngle(0.1 + armSwing)
    this.rightArm.setAngle(-0.1 - armSwing)
  }

  getPosition() {
    return { x: this.container.x, y: this.container.y }
  }

  setPosition(x: number, y: number) {
    this.container.x = x
    this.container.y = y
  }

  getContainer() {
    return this.container
  }
}
