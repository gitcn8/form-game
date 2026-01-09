/**
 * 种子配置系统
 * 定义所有种子类型的属性和价格
 */

import { CropType } from '../inventory/ItemStack'
export type { CropType } from '../inventory/ItemStack'
import { ItemStack, createStack } from '../inventory/ItemStack'

export type SeedType = 'carrot_seed' | 'wheat_seed' | 'potato_seed' | 'tomato_seed' | 'pumpkin_seed'

/**
 * 种子配置接口
 */
export interface SeedConfig {
  name: string // 种子名称
  cropType: CropType // 对应的作物类型
  price: number // 种子价格（金币/包，每包10个）
  color: string // 种子颜色
  seedsPerPack: number // 每包包含的种子数量
}

/**
 * 种子配置表
 */
export const SEED_CONFIG: Record<SeedType, SeedConfig> = {
  carrot_seed: {
    name: '胡萝卜种子',
    cropType: 'carrot',
    price: 2,
    color: '#FF8C00',
    seedsPerPack: 10
  },

  wheat_seed: {
    name: '小麦种子',
    cropType: 'wheat',
    price: 3,
    color: '#DAA520',
    seedsPerPack: 10
  },

  potato_seed: {
    name: '土豆种子',
    cropType: 'potato',
    price: 5,
    color: '#B8860B',
    seedsPerPack: 10
  },

  tomato_seed: {
    name: '番茄种子',
    cropType: 'tomato',
    price: 8,
    color: '#DC143C',
    seedsPerPack: 10
  },

  pumpkin_seed: {
    name: '南瓜种子',
    cropType: 'pumpkin',
    price: 20, // 贵！
    color: '#FF4500',
    seedsPerPack: 5 // 南瓜种子只卖5个一包
  }
}

/**
 * 获取种子配置
 */
export function getSeedConfig(seedType: SeedType): SeedConfig {
  return SEED_CONFIG[seedType]
}

/**
 * 根据作物类型获取种子类型
 */
export function getSeedTypeByCrop(cropType: CropType): SeedType {
  const mapping: Record<CropType, SeedType> = {
    carrot: 'carrot_seed',
    wheat: 'wheat_seed',
    potato: 'potato_seed',
    tomato: 'tomato_seed',
    pumpkin: 'pumpkin_seed'
  }
  return mapping[cropType]
}

/**
 * 购买种子包
 * @param seedType 种子类型
 * @param packs 购买包数
 * @returns 种子 ItemStack
 */
export function buySeedPack(seedType: SeedType, packs: number = 1): ItemStack | null {
  const config = getSeedConfig(seedType)
  const totalSeeds = config.seedsPerPack * packs

  // 创建种子 ItemStack（使用 cropType 作为类型）
  // 注意：种子在背包中以 cropType 标识，但数量是种子数量
  return createStack(config.cropType, totalSeeds)
}

/**
 * 计算种子购买成本
 */
export function calculateSeedCost(seedType: SeedType, packs: number = 1): number {
  const config = getSeedConfig(seedType)
  return config.price * packs
}

/**
 * 种子商店目录（用于商店UI显示）
 */
export const SEED_SHOP_ITEMS = [
  {
    seedType: 'wheat_seed' as SeedType,
    name: '小麦种子',
    price: 3,
    perPack: 10,
    description: '5游戏天成熟（60秒），收获3个，共24金币'
  },
  {
    seedType: 'carrot_seed' as SeedType,
    name: '胡萝卜种子',
    price: 2,
    perPack: 10,
    description: '7游戏天成熟（84秒），收获4个，共40金币'
  },
  {
    seedType: 'tomato_seed' as SeedType,
    name: '番茄种子',
    price: 8,
    perPack: 10,
    description: '9游戏天成熟（108秒），收获5个，共60金币'
  },
  {
    seedType: 'potato_seed' as SeedType,
    name: '土豆种子',
    price: 5,
    perPack: 10,
    description: '12游戏天成熟（144秒），收获6个，共90金币'
  },
  {
    seedType: 'pumpkin_seed' as SeedType,
    name: '南瓜种子',
    price: 20,
    perPack: 5,
    description: '15游戏天成熟（180秒），收获1个，共150金币（贵！）'
  }
]
