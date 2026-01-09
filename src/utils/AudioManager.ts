/**
 * 音效管理器
 * 使用 Web Audio API 生成动物叫声和其他音效
 * 支持基于距离的音量控制
 */

class AudioManager {
  private audioContext: AudioContext | null = null
  private masterVolume: number = 0.3 // 主音量（0-1）

  // 初始化音频上下文（需要用户交互后才能创建）
  private ensureContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  /**
   * 播放动物叫声
   * @param animalType 动物类型
   * @param distance 距离玩家的距离
   */
  playAnimalSound(animalType: string, distance: number = 0): void {
    try {
      const ctx = this.ensureContext()

      // 根据距离计算音量（距离越远音量越小）
      // 听觉范围：15个单位
      const maxDistance = 15
      let volume = this.masterVolume

      if (distance > maxDistance) {
        return // 超出听觉范围，不播放
      } else if (distance > 0) {
        // 线性衰减：距离越远音量越小
        volume = volume * (1 - distance / maxDistance)
      }

      // 根据动物类型生成不同的叫声
      switch (animalType) {
        case 'chicken':
          this.playChickenSound(ctx, volume)
          break
        case 'pig':
          this.playPigSound(ctx, volume)
          break
        case 'cow':
          this.playCowSound(ctx, volume)
          break
        case 'sheep':
          this.playSheepSound(ctx, volume)
          break
        default:
          this.playGenericSound(ctx, volume)
      }
    } catch (error) {
      console.warn('播放音效失败:', error)
    }
  }

  /**
   * 鸡叫声："咯咯咯"
   * 高频短促，重复多次
   */
  private playChickenSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime

    // 重复3-5次"咯咯"
    const repeats = 3 + Math.floor(Math.random() * 3)

    for (let i = 0; i < repeats; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle' // 三角波，类似鸡叫声
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now) // 高频

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.1)
    }
  }

  /**
   * 猪叫声："哼哼哼"
   * 中频，低沉
   */
  private playPigSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.4

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth' // 锯齿波，粗糙
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.linearRampToValueAtTime(150, now + duration) // 音调下降

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  /**
   * 牛叫声："牟牟牟"
   * 低频，长音
   */
  private playCowSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 1.2

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine' // 正弦波，柔和
    osc.frequency.setValueAtTime(120, now)
    osc.frequency.linearRampToValueAtTime(80, now + duration * 0.3) // 音调下降
    osc.frequency.linearRampToValueAtTime(100, now + duration * 0.6) // 稍微上升
    osc.frequency.linearRampToValueAtTime(70, now + duration) // 再次下降

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.1)
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + duration * 0.5)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  /**
   * 羊叫声："咩咩咩"
   * 中高频，鼻音
   */
  private playSheepSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.6

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.linearRampToValueAtTime(350, now + duration * 0.5)

    // 添加滤波器模拟鼻音
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 2

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  /**
   * 通用音效
   */
  private playGenericSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.3

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = 300

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.05)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  /**
   * 播放交互音效（放置、喂食、产出等）
   */
  playInteractionSound(type: 'place' | 'feed' | 'product' | 'warning' | 'hit' | 'kill' | 'success'): void {
    try {
      const ctx = this.ensureContext()
      const now = ctx.currentTime
      const volume = this.masterVolume * 0.4

      switch (type) {
        case 'place':
          // 放置音效：清脆的叮声
          this.playDingSound(ctx, volume)
          break
        case 'feed':
          // 喂食音效：咀嚼声
          this.playChewSound(ctx, volume)
          break
        case 'product':
          // 产出音效：愉悦的叮叮声
          this.playSuccessSound(ctx, volume)
          break
        case 'warning':
          // 警告音效：低沉的提示音
          this.playWarningSound(ctx, volume)
          break
        case 'hit':
          // 击中音效：短促的打击声
          this.playHitSound(ctx, volume)
          break
        case 'kill':
          // 击杀音效：沉闷的重击声
          this.playKillSound(ctx, volume)
          break
        case 'success':
          // 成功音效：愉悦的上升音调
          this.playSuccessSound(ctx, volume)
          break
      }
    } catch (error) {
      console.warn('播放交互音效失败:', error)
    }
  }

  private playDingSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.2

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  private playChewSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime

    // 模拟咀嚼的短促声音
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(200 + Math.random() * 100, now + i * 0.15)

      gain.gain.setValueAtTime(0, now + i * 0.15)
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.15 + 0.03)
      gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.12)
    }
  }

  private playSuccessSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime

    // 两声清脆的叮声
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1000 + i * 200, now + i * 0.15)

      gain.gain.setValueAtTime(0, now + i * 0.15)
      gain.gain.linearRampToValueAtTime(volume * 0.5, now + i * 0.15 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.17)
    }
  }

  private playWarningSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.4

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(200, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.05)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  private playHitSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.1

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + duration)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  private playKillSound(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.3

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(100, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + duration)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 获取主音量
   */
  getMasterVolume(): number {
    return this.masterVolume
  }
}

// 导出单例
export const audioManager = new AudioManager()
