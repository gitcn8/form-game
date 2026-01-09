/**
 * 生物群落系统
 * 定义不同的生物群落类型和它们的特性
 */

export enum BiomeType {
  GRASSLAND = 'grassland', // 草地（默认，最常见）
  DESERT = 'desert', // 沙漠（黄色沙子，有仙人掌）
  SNOW = 'snow', // 雪地（白色雪，有松树）
  RAINFOREST = 'rainforest', // 雨林（深绿色，有热带植物）
  RIVER = 'river', // 河流（水）
  VILLAGE = 'village' // 村庄（可能有 NPC 房屋）
}

export interface Biome {
  type: BiomeType
  name: string
  groundColor: string
  waterColor?: string
  features: string[]
  treeChance: number // 0-1, 生成树木的概率
  rarity: number // 0-1, 稀有度，越小越稀有
}

export const BIOMES: Record<BiomeType, Biome> = {
  [BiomeType.GRASSLAND]: {
    type: BiomeType.GRASSLAND,
    name: '草地',
    groundColor: '#7CFC00',
    features: ['grass', 'flowers', 'trees'],
    treeChance: 0.05,
    rarity: 0.6 // 60% 的概率
  },
  [BiomeType.DESERT]: {
    type: BiomeType.DESERT,
    name: '沙漠',
    groundColor: '#DEB887',
    features: ['cactus', 'sand_dunes'],
    treeChance: 0.01, // 很少有树
    rarity: 0.15 // 15% 的概率
  },
  [BiomeType.SNOW]: {
    type: BiomeType.SNOW,
    name: '雪地',
    groundColor: '#FFFAFA',
    features: ['snow_trees', 'snow_rocks'],
    treeChance: 0.03,
    rarity: 0.1 // 10% 的概率
  },
  [BiomeType.RAINFOREST]: {
    type: BiomeType.RAINFOREST,
    name: '雨林',
    groundColor: '#228B22',
    features: ['dense_trees', 'vines', 'tropical_plants'],
    treeChance: 0.2, // 很多树
    rarity: 0.1 // 10% 的概率
  },
  [BiomeType.RIVER]: {
    type: BiomeType.RIVER,
    name: '河流',
    groundColor: '#4169E1', // 蓝色水面
    waterColor: '#4169E1',
    features: ['water', 'fish'],
    treeChance: 0,
    rarity: 0.05 // 5% 的概率
  },
  [BiomeType.VILLAGE]: {
    type: BiomeType.VILLAGE,
    name: '村庄',
    groundColor: '#8B7355', // 土路颜色
    features: ['houses', 'npcs', 'crops'],
    treeChance: 0,
    rarity: 0.02 // 2% 的概率，很稀有
  }
}

/**
 * 根据噪声值确定生物群落
 * @param noiseValue - 噪声值（0-1）
 * @param moistureValue - 湿度值（0-1）
 * @returns 生物群落类型
 */
export function getBiomeFromNoise(noiseValue: number, moistureValue: number): BiomeType {
  // 使用噪声值和湿度值确定生物群落
  if (noiseValue < 0.3 && moistureValue < 0.3) {
    return BiomeType.DESERT // 干燥低洼地区
  }
  if (noiseValue < 0.2) {
    return BiomeType.RIVER // 低洼地区
  }
  if (noiseValue > 0.8) {
    if (moistureValue > 0.7) {
      return BiomeType.RAINFOREST // 高湿度高地
    }
    return BiomeType.SNOW // 高海拔地区
  }

  // 大部分地区是草地
  return BiomeType.GRASSLAND
}
