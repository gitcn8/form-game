/**
 * 作物配置系统
 * 定义所有作物类型的属性、生长时间、收益等
 */

import { CropType } from '../inventory/ItemStack'

// 重新导出 CropType 以便其他模块使用
export type { CropType } from '../inventory/ItemStack'

/**
 * 作物配置接口
 */
export interface CropConfig {
  name: string // 作物名称
  growTime: number // 生长时间（游戏天数）
  yield: number // 收获量（个）
  price: number // 单价（金币）
  color: string // 作物颜色（用于UI显示）
  seedPrice: number // 种子价格（金币/包，每包10个）
  seedColor: string // 种子颜色（可选）
  stages: number // 生长阶段数（用于动画）
}

/**
 * 作物配置表
 * 时间单位：游戏天数（现实12分钟 = 游戏内1天 = 720秒）
 */
export const CROP_CONFIG: Record<CropType, CropConfig> = {
  wheat: {
    name: '小麦',
    growTime: 5, // 5游戏天（现实60秒）
    yield: 3, // 收获量
    price: 8, // 单价
    color: '#FFD700', // 金黄色
    seedPrice: 3,
    seedColor: '#DAA520',
    stages: 5 // 5个生长阶段
  },

  carrot: {
    name: '胡萝卜',
    growTime: 7, // 7游戏天（现实84秒）
    yield: 4,
    price: 10,
    color: '#FFA500', // 橙色
    seedPrice: 2,
    seedColor: '#FF8C00',
    stages: 5 // 5个生长阶段
  },

  tomato: {
    name: '番茄',
    growTime: 9, // 9游戏天（现实108秒）
    yield: 5,
    price: 12,
    color: '#FF6347', // 红色
    seedPrice: 8,
    seedColor: '#DC143C',
    stages: 5 // 5个生长阶段
  },

  potato: {
    name: '土豆',
    growTime: 12, // 12游戏天（现实144秒）
    yield: 6, // 收获多
    price: 15, // 贵
    color: '#DAA520', // 土黄色
    seedPrice: 5,
    seedColor: '#B8860B',
    stages: 5 // 5个生长阶段
  },

  pumpkin: {
    name: '南瓜',
    growTime: 15, // 15游戏天（现实180秒）
    yield: 1, // 只有一个大南瓜
    price: 150, // 很贵！
    color: '#FF8C00', // 橙红色
    seedPrice: 20, // 种子贵
    seedColor: '#FF4500',
    stages: 5 // 5个生长阶段
  }
}

/**
 * 获取作物配置
 */
export function getCropConfig(cropType: CropType): CropConfig {
  return CROP_CONFIG[cropType]
}

/**
 * 计算作物总收入
 */
export function calculateCropIncome(cropType: CropType): number {
  const config = getCropConfig(cropType)
  return config.yield * config.price
}

/**
 * 计算作物每天收益
 */
export function calculateCropProfitPerDay(cropType: CropType): number {
  const config = getCropConfig(cropType)
  const totalIncome = config.yield * config.price
  return totalIncome / config.growTime
}

/**
 * 检查作物是否成熟
 * @param plantTime 种植时间戳（毫秒）
 * @param cropType 作物类型
 * @returns 是否成熟
 */
export function isCropReady(plantTime: number, cropType: CropType): boolean {
  const config = getCropConfig(cropType)
  const currentTime = Date.now()
  const elapsedGameDays = getElapsedGameDays(plantTime, currentTime)
  return elapsedGameDays >= config.growTime
}

/**
 * 获取作物生长进度（0-100）
 * @param plantTime 种植时间戳（毫秒）
 * @param cropType 作物类型
 * @returns 生长进度百分比
 */
export function getCropProgress(plantTime: number, cropType: CropType): number {
  const config = getCropConfig(cropType)
  const currentTime = Date.now()
  const elapsedGameDays = getElapsedGameDays(plantTime, currentTime)
  const progress = (elapsedGameDays / config.growTime) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * 计算经过的游戏天数
 * @param startTime 开始时间戳（毫秒）
 * @param endTime 结束时间戳（毫秒）
 * @returns 经过的游戏天数
 */
export function getElapsedGameDays(startTime: number, endTime: number = Date.now()): number {
  // 现实12分钟 = 游戏内1天
  // 12 * 60 * 1000 = 720000 毫秒 = 1游戏天
  const REAL_MS_PER_GAME_DAY = 12 * 60 * 1000
  const elapsedRealMs = endTime - startTime
  return elapsedRealMs / REAL_MS_PER_GAME_DAY
}

/**
 * 获取作物当前生长阶段（1-5）
 * @param plantTime 种植时间戳（毫秒）
 * @param cropType 作物类型
 * @returns 当前生长阶段（1-5），5表示成熟
 */
export function getCropStage(plantTime: number, cropType: CropType): number {
  const config = getCropConfig(cropType)
  const progress = getCropProgress(plantTime, cropType)
  const stage = Math.floor((progress / 100) * config.stages) + 1
  return Math.min(stage, config.stages)
}

/**
 * 作物经济数据对比表（用于UI显示）
 */
export const CROP_COMPARISON_TABLE = [
  {
    type: 'wheat' as CropType,
    name: '小麦',
    growTime: 5,
    yield: 3,
    price: 8,
    totalIncome: 24,
    profitPerDay: 4.8,
    profitPerSecond: 0.40,
    feature: '快速周转，高频操作'
  },
  {
    type: 'carrot' as CropType,
    name: '胡萝卜',
    growTime: 7,
    yield: 4,
    price: 10,
    totalIncome: 40,
    profitPerDay: 5.7,
    profitPerSecond: 0.48,
    feature: '平衡型，适合新手'
  },
  {
    type: 'tomato' as CropType,
    name: '番茄',
    growTime: 9,
    yield: 5,
    price: 12,
    totalIncome: 60,
    profitPerDay: 6.7,
    profitPerSecond: 0.56,
    feature: '需要频繁浇水'
  },
  {
    type: 'potato' as CropType,
    name: '土豆',
    growTime: 12,
    yield: 6,
    price: 15,
    totalIncome: 90,
    profitPerDay: 7.5,
    profitPerSecond: 0.63,
    feature: '慢速高回报，佛系玩法'
  },
  {
    type: 'pumpkin' as CropType,
    name: '南瓜',
    growTime: 15,
    yield: 1,
    price: 150,
    totalIncome: 150,
    profitPerDay: 10.0,
    profitPerSecond: 0.83,
    feature: '豪赌型，超慢超高回报'
  }
]
