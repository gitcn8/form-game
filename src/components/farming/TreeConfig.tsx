/**
 * 果树配置系统
 * 定义所有果树类型的属性、生长时间、产量等
 */

/**
 * 树果类型
 */
export type TreeType = 'apple' | 'orange' | 'peach' | 'cherry' | 'pear'

/**
 * 树果配置接口
 */
export interface TreeConfig {
  name: string // 果树名称
  growTime: number // 生长时间（游戏天数）
  yield: number // 每次收获产量（个）
  price: number // 单价（金币）
  color: string // 果实颜色（用于UI显示）
  saplingPrice: number // 树苗价格（金币）
  saplingColor: string // 树苗颜色
  stages: number // 生长阶段数
  harvestInterval: number // 收获间隔（游戏天数，成熟后多久可以再次收获）
  emoji: string // 果实emoji
}

/**
 * 果树配置表
 * 时间单位：游戏天数（现实12分钟 = 游戏内1天 = 720秒）
 */
export const TREE_CONFIG: Record<TreeType, TreeConfig> = {
  apple: {
    name: '苹果树',
    growTime: 20, // 20游戏天（现实4小时）
    yield: 8, // 每次收获8个苹果
    price: 5, // 单价
    color: '#FF4444', // 红色
    saplingPrice: 30, // 树苗价格
    saplingColor: '#228B22', // 深绿色
    stages: 4, // 4个生长阶段
    harvestInterval: 5, // 每5游戏天可以收获一次
    emoji: '🍎'
  },

  orange: {
    name: '橙子树',
    growTime: 25, // 25游戏天（现实5小时）
    yield: 10,
    price: 6,
    color: '#FFA500', // 橙色
    saplingPrice: 35,
    saplingColor: '#32CD32', // 柠檬绿
    stages: 4,
    harvestInterval: 6,
    emoji: '🍊'
  },

  peach: {
    name: '桃树',
    growTime: 22, // 22游戏天（现实4.4小时）
    yield: 6,
    price: 8,
    color: '#FFC0CB', // 粉色
    saplingPrice: 40,
    saplingColor: '#FF69B4', // 亮粉色
    stages: 4,
    harvestInterval: 5,
    emoji: '🍑'
  },

  cherry: {
    name: '樱桃树',
    growTime: 18, // 18游戏天（现实3.6小时）
    yield: 5,
    price: 12, // 樱桃较贵
    color: '#DC143C', // 深红色
    saplingPrice: 50,
    saplingColor: '#8B0000', // 暗红色
    stages: 4,
    harvestInterval: 4, // 樱桃成熟快
    emoji: '🍒'
  },

  pear: {
    name: '梨树',
    growTime: 24, // 24游戏天（现实4.8小时）
    yield: 9,
    price: 7,
    color: '#E6DBAC', // 黄绿色
    saplingPrice: 38,
    saplingColor: '#9ACD32', // 黄绿色
    stages: 4,
    harvestInterval: 6,
    emoji: '🍐'
  }
}

/**
 * 获取果树配置
 */
export function getTreeConfig(treeType: TreeType): TreeConfig {
  return TREE_CONFIG[treeType]
}

/**
 * 检查树果是否成熟
 */
export function isTreeReady(tree: {
  treeType?: TreeType
  plantTime?: number
  lastHarvestTime?: number
}): boolean {
  if (!tree.treeType || !tree.plantTime) return false

  const config = TREE_CONFIG[tree.treeType]
  const currentTime = Date.now()

  // 首次成熟检查
  const timeSincePlant = currentTime - tree.plantTime
  const growTimeMs = config.growTime * 12 * 60 * 1000 // 游戏天转毫秒

  if (timeSincePlant < growTimeMs) return false

  // 如果有上次收获时间，检查是否到了下次收获间隔
  if (tree.lastHarvestTime) {
    const timeSinceLastHarvest = currentTime - tree.lastHarvestTime
    const harvestIntervalMs = config.harvestInterval * 12 * 60 * 1000
    return timeSinceLastHarvest >= harvestIntervalMs
  }

  return true
}

/**
 * 计算树果生长进度（0-1）
 */
export function getTreeGrowthProgress(tree: {
  treeType?: TreeType
  plantTime?: number
}): number {
  if (!tree.treeType || !tree.plantTime) return 0

  const config = TREE_CONFIG[tree.treeType]
  const currentTime = Date.now()
  const timeSincePlant = currentTime - tree.plantTime
  const growTimeMs = config.growTime * 12 * 60 * 1000

  return Math.min(timeSincePlant / growTimeMs, 1)
}
