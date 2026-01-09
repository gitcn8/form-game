/**
 * 动物系统配置
 * 参考设计：docs/3D_GAME_DESIGN.md
 */

// 游戏时间配置：1游戏天 = 12分钟 = 720秒 = 720000毫秒
const GAME_DAY_IN_SECONDS = 720000  // 使用毫秒单位，与 Date.now() 一致

/**
 * 动物生长阶段配置
 */
interface GrowthStageConfig {
  duration: number        // 持续时间（秒）
  size: [number, number, number]  // 模型尺寸 [宽, 高, 深]
  modelType: string       // 模型类型（用于渲染不同外观）
}

/**
 * 动物产出配置
 */
interface ProductConfig {
  type: 'egg' | 'milk' | 'wool' | 'meat' | null
  interval: number        // 产出周期（秒）
  amount: number          // 每次产出数量
  value: number           // 产品价值（金币）
}

/**
 * 动物需求配置
 */
interface NeedsConfig {
  foods: string[]         // 可食用饲料
  hungerRate: number      // 饥饿速度（秒）
  hungerDamage: number    // 饥饿伤害（每次饥饿扣除的健康值）
}

/**
 * 动物移动配置
 */
interface MovementConfig {
  speed: number           // 移动速度（单位/秒）
  moveIntervalMin: number // 最小移动决策间隔（秒）
  moveIntervalMax: number // 最大移动决策间隔（秒）
  moveDistance: number    // 每次移动的最大距离
  restTimeMin: number     // 最小休息时间（毫秒）
  restTimeMax: number     // 最大休息时间（毫秒）
}

/**
 * 动物声音配置
 */
interface SoundConfig {
  callIntervalMin: number // 最小叫声间隔（毫秒）
  callIntervalMax: number // 最大叫声间隔（毫秒）
  callProbability: number // 每次间隔后叫的概率（0-1）
}

/**
 * 动物完整配置
 */
export interface AnimalConfig {
  id: string              // 唯一ID
  name: string            // 显示名称
  emoji: string           // 图标

  // 生长系统
  growthStages: {
    baby: GrowthStageConfig
    growing: GrowthStageConfig
    adult: GrowthStageConfig
  }

  // 产出系统
  product: ProductConfig

  // 养殖需求
  needs: NeedsConfig

  // 移动系统
  movement: MovementConfig

  // 声音系统
  sound: SoundConfig

  // 购买信息
  buyPrice: number        // 幼崽购买价格
  sellPrice?: number      // 成年出售价格（可选）
}

/**
 * 动物配置表
 */
export const ANIMAL_CONFIGS: Record<string, AnimalConfig> = {
  chicken: {
    id: 'chicken',
    name: '鸡',
    emoji: '🐔',
    growthStages: {
      baby: {
        duration: 10 * GAME_DAY_IN_SECONDS,  // 10游戏天 (2小时)
        size: [0.25, 0.3, 0.28],
        modelType: 'chick'
      },
      growing: {
        duration: 6 * GAME_DAY_IN_SECONDS,  // 6游戏天 (1.2小时)
        size: [0.32, 0.4, 0.36],
        modelType: 'chicken_growing'
      },
      adult: {
        duration: 0,  // 成年后不再生长
        size: [0.4, 0.5, 0.45],
        modelType: 'chicken_adult'
      }
    },
    product: {
      type: 'egg',
      interval: 1 * GAME_DAY_IN_SECONDS,   // 每1游戏天（12分钟）
      amount: 1,
      value: 5
    },
    needs: {
      foods: ['animal_feed', 'wheat', 'carrot'],
      hungerRate: 1.5 * GAME_DAY_IN_SECONDS,  // 每1.5游戏天需要喂食
      hungerDamage: 5  // 降低伤害，让动物活得更久
    },
    movement: {
      speed: 1.5,           // 快速移动
      moveIntervalMin: 3000,   // 3秒
      moveIntervalMax: 5000,   // 5秒
      moveDistance: 3,      // 最大移动3个单位
      restTimeMin: 2000,    // 休息2秒
      restTimeMax: 4000     // 休息4秒
    },
    sound: {
      callIntervalMin: 8000,   // 8秒
      callIntervalMax: 15000,  // 15秒
      callProbability: 0.6     // 60%概率叫
    },
    buyPrice: 50,
    sellPrice: 30
  },

  pig: {
    id: 'pig',
    name: '猪',
    emoji: '🐷',
    growthStages: {
      baby: {
        duration: 14 * GAME_DAY_IN_SECONDS,  // 14游戏天 (2.8小时)
        size: [0.4, 0.5, 0.7],
        modelType: 'piglet'
      },
      growing: {
        duration: 10 * GAME_DAY_IN_SECONDS,  // 10游戏天 (2小时)
        size: [0.55, 0.7, 1.0],
        modelType: 'pig_growing'
      },
      adult: {
        duration: 0,
        size: [0.7, 0.9, 1.3],
        modelType: 'pig_adult'
      }
    },
    product: {
      type: 'meat',
      interval: 0,  // 猪不出产，只能卖肉
      amount: 1,
      value: 50
    },
    needs: {
      foods: ['animal_feed', 'carrot', 'potato'],
      hungerRate: 2 * GAME_DAY_IN_SECONDS,
      hungerDamage: 4  // 降低伤害，让动物活得更久
    },
    movement: {
      speed: 1.0,           // 缓慢移动
      moveIntervalMin: 5000,   // 5秒
      moveIntervalMax: 8000,   // 8秒
      moveDistance: 2,      // 最大移动2个单位
      restTimeMin: 3000,    // 休息3秒
      restTimeMax: 5000     // 休息5秒
    },
    sound: {
      callIntervalMin: 12000,  // 12秒
      callIntervalMax: 20000,  // 20秒
      callProbability: 0.4     // 40%概率叫
    },
    buyPrice: 70,
    sellPrice: 50
  },

  cow: {
    id: 'cow',
    name: '牛',
    emoji: '🐄',
    growthStages: {
      baby: {
        duration: 20 * GAME_DAY_IN_SECONDS,  // 20游戏天 (4小时)
        size: [0.5, 0.8, 1.0],
        modelType: 'calf'
      },
      growing: {
        duration: 14 * GAME_DAY_IN_SECONDS,  // 14游戏天 (2.8小时)
        size: [0.7, 1.2, 1.6],
        modelType: 'cow_growing'
      },
      adult: {
        duration: 0,
        size: [0.9, 1.5, 2.0],
        modelType: 'cow_adult'
      }
    },
    product: {
      type: 'milk',
      interval: 1 * GAME_DAY_IN_SECONDS,   // 每1游戏天（12分钟）
      amount: 1,
      value: 8
    },
    needs: {
      foods: ['hay', 'wheat', 'grass'],
      hungerRate: 2.5 * GAME_DAY_IN_SECONDS,
      hungerDamage: 6  // 降低伤害，让动物活得更久
    },
    movement: {
      speed: 1.2,           // 中等速度
      moveIntervalMin: 8000,   // 8秒
      moveIntervalMax: 12000,  // 12秒
      moveDistance: 4,      // 最大移动4个单位
      restTimeMin: 4000,    // 休息4秒
      restTimeMax: 6000     // 休息6秒
    },
    sound: {
      callIntervalMin: 15000,  // 15秒
      callIntervalMax: 25000,  // 25秒
      callProbability: 0.3     // 30%概率叫
    },
    buyPrice: 100,
    sellPrice: 80
  },

  sheep: {
    id: 'sheep',
    name: '羊',
    emoji: '🐑',
    growthStages: {
      baby: {
        duration: 16 * GAME_DAY_IN_SECONDS,  // 16游戏天 (3.2小时)
        size: [0.35, 0.5, 0.6],
        modelType: 'lamb'
      },
      growing: {
        duration: 10 * GAME_DAY_IN_SECONDS,  // 10游戏天 (2小时)
        size: [0.5, 0.7, 0.85],
        modelType: 'sheep_growing'
      },
      adult: {
        duration: 0,
        size: [0.6, 0.9, 1.1],
        modelType: 'sheep_adult'
      }
    },
    product: {
      type: 'wool',
      interval: 1 * GAME_DAY_IN_SECONDS,   // 每1游戏天（12分钟）
      amount: 1,
      value: 10
    },
    needs: {
      foods: ['hay', 'grass', 'wheat'],
      hungerRate: 2.2 * GAME_DAY_IN_SECONDS,
      hungerDamage: 5  // 降低伤害，让动物活得更久
    },
    movement: {
      speed: 1.3,           // 中等速度
      moveIntervalMin: 4000,   // 4秒
      moveIntervalMax: 7000,   // 7秒
      moveDistance: 3.5,    // 最大移动3.5个单位
      restTimeMin: 2000,    // 休息2秒
      restTimeMax: 4000     // 休息4秒
    },
    sound: {
      callIntervalMin: 10000,  // 10秒
      callIntervalMax: 18000,  // 18秒
      callProbability: 0.5     // 50%概率叫
    },
    buyPrice: 80,
    sellPrice: 60
  }
}

/**
 * 动物实例数据类型
 */
export interface PlacedAnimal {
  id: string                    // 唯一ID
  animalId: string              // 对应 ANIMAL_CONFIGS 的key
  position: [number, number, number]  // 位置 [x, y, z]
  rotation: number              // 旋转角度 (0-360)

  // 生长状态
  birthTime: number             // 出生时间戳（毫秒）
  growthStage: 'baby' | 'growing' | 'adult'  // 当前阶段

  // 养殖状态
  lastFed: number               // 上次喂食时间戳
  lastProduct: number           // 上次产出时间戳
  hunger: number                // 饥饿度 0-100
  happiness: number             // 快乐度 0-100
  health: number                // 健康度 0-100

  // 移动状态
  targetPosition?: [number, number, number]  // 目标位置
  isMoving?: boolean            // 是否在移动
  lastMoveTime?: number         // 上次移动时间戳
  restUntil?: number            // 休息到什么时候

  // 声音状态
  lastSoundTime?: number        // 上次叫声时间戳
  nextSoundTime?: number        // 下次可以叫的时间戳
}

/**
 * 计算动物生长进度 (0-100)
 */
export function getGrowthProgress(animal: PlacedAnimal): number {
  const config = ANIMAL_CONFIGS[animal.animalId]
  const currentTime = Date.now()
  const age = currentTime - animal.birthTime

  if (animal.growthStage === 'baby') {
    const progress = (age / config.growthStages.baby.duration) * 100
    return Math.min(100, Math.max(0, progress))
  } else if (animal.growthStage === 'growing') {
    const babyTime = config.growthStages.baby.duration
    const growingTime = config.growthStages.growing.duration
    const progress = ((age - babyTime) / growingTime) * 100
    return Math.min(100, Math.max(0, progress))
  }

  return 100  // 成年
}

/**
 * 检查动物是否应该升级生长阶段
 */
export function shouldUpgradeGrowthStage(animal: PlacedAnimal): boolean {
  const config = ANIMAL_CONFIGS[animal.animalId]
  const currentTime = Date.now()
  const age = currentTime - animal.birthTime

  if (animal.growthStage === 'baby') {
    return age >= config.growthStages.baby.duration
  } else if (animal.growthStage === 'growing') {
    const totalGrowingTime = config.growthStages.baby.duration +
                             config.growthStages.growing.duration
    return age >= totalGrowingTime
  }

  return false
}

/**
 * 检查动物是否需要喂食
 */
export function isAnimalHungry(animal: PlacedAnimal): boolean {
  const config = ANIMAL_CONFIGS[animal.animalId]
  const currentTime = Date.now()
  const timeSinceLastFed = currentTime - animal.lastFed

  return timeSinceLastFed >= config.needs.hungerRate
}

/**
 * 检查成年动物是否可以产出
 */
export function canAnimalProduce(animal: PlacedAnimal): boolean {
  if (animal.growthStage !== 'adult') return false

  const config = ANIMAL_CONFIGS[animal.animalId]
  if (config.product.type === null || config.product.type === 'meat') return false

  const currentTime = Date.now()
  const timeSinceLastProduct = currentTime - animal.lastProduct

  return timeSinceLastProduct >= config.product.interval
}
