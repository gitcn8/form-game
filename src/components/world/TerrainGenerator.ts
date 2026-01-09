/**
 * 简化的 Perlin Noise 实现
 * 用于生成自然地形
 */

class PerlinNoise {
  private permutation: number[] = []
  private p: number[] = []

  constructor(seed: number = Math.random() * 10000) {
    // 初始化排列数组
    this.permutation = Array.from({ length: 256 }, (_, i) => i)

    // 使用种子打乱数组
    let random = this.seededRandom(seed)
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]]
    }

    // 复制两份以处理溢出
    this.p = [...this.permutation, ...this.permutation]
  }

  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  /**
   * 获取 2D 噪声值
   * @param x - X 坐标
   * @param y - Y 坐标
   * @returns 噪声值（0-1）
   */
  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)

    const u = this.fade(x)
    const v = this.fade(y)

    const A = this.p[X] + Y
    const B = this.p[X + 1] + Y

    return (
      this.lerp(
        this.lerp(this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y), u),
        this.lerp(this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1), u),
        v
      ) *
        0.5 +
      0.5
    )
  }

  /**
   * 获取多层噪声（分形噪声）
   * @param x - X 坐标
   * @param y - Y 坐标
   * @param octaves - 层数
   * @param persistence - 持久度
   * @returns 噪声值（0-1）
   */
  fbm(x: number, y: number, octaves: number = 4, persistence: number = 0.5): number {
    let total = 0
    let frequency = 1
    let amplitude = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= 2
    }

    return total / maxValue
  }
}

/**
 * 地形生成器
 * 使用噪声算法生成无限地形
 */
export class TerrainGenerator {
  private heightNoise: PerlinNoise
  private moistureNoise: PerlinNoise
  private biomeNoise: PerlinNoise
  private seed: number

  constructor(seed: number = Math.random() * 10000) {
    this.seed = seed
    this.heightNoise = new PerlinNoise(seed)
    this.moistureNoise = new PerlinNoise(seed + 1000)
    this.biomeNoise = new PerlinNoise(seed + 2000)
  }

  /**
   * 获取指定位置的地形高度
   * @param worldX - 世界 X 坐标
   * @param worldZ - 世界 Z 坐标
   * @returns 地形高度（0-10）
   */
  getHeight(worldX: number, worldZ: number): number {
    // 使用分形噪声生成高度
    const scale = 0.01 // 噪声缩放，值越大地形越平缓
    const height = this.heightNoise.fbm(worldX * scale, worldZ * scale, 4, 0.5)

    // 平原为主：大部分区域高度在 0-2 之间
    if (height < 0.7) {
      return height * 2 // 低洼地区，0-1.4
    } else if (height < 0.9) {
      return 1.4 + (height - 0.7) * 5 // 小山丘，1.4-2.4
    } else {
      return 2.4 + (height - 0.9) * 38 // 高山，2.4-6（很少）
    }
  }

  /**
   * 获取指定位置的湿度值
   * @param worldX - 世界 X 坐标
   * @param worldZ - 世界 Z 坐标
   * @returns 湿度值（0-1）
   */
  getMoisture(worldX: number, worldZ: number): number {
    const scale = 0.008
    return this.moistureNoise.fbm(worldX * scale, worldZ * scale, 3, 0.5)
  }

  /**
   * 获取指定位置的生物群落类型
   * @param worldX - 世界 X 坐标
   * @param worldZ - 世界 Z 坐标
   * @returns 生物群落类型
   */
  getBiomeType(worldX: number, worldZ: number): string {
    const height = this.getHeight(worldX, worldZ)
    const moisture = this.getMoisture(worldX, worldZ)

    // 使用高度和湿度确定生物群落
    if (height < 0.5) {
      return 'river' // 低洼地区是河流
    }

    const biomeValue = this.biomeNoise.fbm(worldX * 0.005, worldZ * 0.005, 2, 0.5)

    if (moisture < 0.3 && biomeValue > 0.6) {
      return 'desert' // 干燥地区
    }
    if (height > 4 && moisture > 0.5) {
      return 'snow' // 高海拔湿润地区
    }
    if (moisture > 0.7 && biomeValue > 0.7) {
      return 'rainforest' // 高湿度地区
    }

    // 默认草地
    return 'grassland'
  }

  /**
   * 获取指定位置是否应该生成树木
   * @param worldX - 世界 X 坐标
   * @param worldZ - 世界 Z 坐标
   * @returns 是否生成树木
   */
  shouldGenerateTree(worldX: number, worldZ: number): boolean {
    const biomeType = this.getBiomeType(worldX, worldZ)
    const treeChance: Record<string, number> = {
      grassland: 0.05,
      desert: 0.01,
      snow: 0.03,
      rainforest: 0.2,
      river: 0,
      village: 0
    }

    const chance = treeChance[biomeType] || 0.05
    const random = this.heightNoise.noise2D(worldX * 0.5, worldZ * 0.5)

    return random < chance
  }

  /**
   * 获取指定位置的地形颜色
   * @param worldX - 世界 X 坐标
   * @param worldZ - 世界 Z 坐标
   * @returns 地形颜色
   */
  getGroundColor(worldX: number, worldZ: number): string {
    const biomeType = this.getBiomeType(worldX, worldZ)
    const colors: Record<string, string> = {
      grassland: '#7CFC00',
      desert: '#DEB887',
      snow: '#FFFAFA',
      rainforest: '#228B22',
      river: '#4169E1',
      village: '#8B7355'
    }

    return colors[biomeType] || '#7CFC00'
  }
}

// 导出单例
let terrainGeneratorInstance: TerrainGenerator | null = null

export function getTerrainGenerator(seed?: number): TerrainGenerator {
  if (!terrainGeneratorInstance) {
    terrainGeneratorInstance = new TerrainGenerator(seed)
  }
  return terrainGeneratorInstance
}
