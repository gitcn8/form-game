/**
 * 机器与食物加工系统配置
 * 参考设计：docs/3D_GAME_DESIGN.md Phase 5
 */

/**
 * 机器类型枚举（与 ItemStack.tsx 保持一致）
 */
export type MachineType = 'machine_oven' | 'machine_boiler' | 'machine_juicer' | 'machine_grinder' | 'machine_mixer'

/**
 * 食物类型枚举
 */
export type FoodType =
  | 'bread'
  | 'cake'
  | 'soup'
  | 'juice'
  | 'cheese'
  | 'pizza'
  | 'flour'
  | 'jammed_fruit'

/**
 * 配方材料
 */
export interface RecipeIngredient {
  itemType: 'crop' | 'animal_product' | 'processed_food' | 'fruit'
  itemId: string // 对应物品ID（crop_wheat, animal_milk等）
  count: number // 需要的数量
}

/**
 * 食物配方
 */
export interface FoodRecipe {
  id: string // 配方ID
  name: string // 食物名称
  icon: string // 图标
  output: FoodType // 产出食物类型
  outputCount: number // 产出数量

  // 配方
  ingredients: RecipeIngredient[] // 所需材料
  processTime: number // 加工时间（秒）

  // 效果
  staminaRestore: number // 恢复体力值
  satiety: number // 饱食度（0-100）
  buff?: {
    type: 'speed' | 'efficiency' | 'luck'
    value: number // 增益百分比
    duration: number // 持续时间（秒）
  }
}

/**
 * 机器配置
 */
export interface MachineConfig {
  id: MachineType // 机器ID
  name: string // 机器名称
  icon: string // 图标
  description: string // 描述

  // 尺寸（用于放置和渲染）
  size: [number, number, number] // [宽, 高, 深]

  // 功能
  recipes: FoodRecipe[] // 可制作的配方列表

  // 购买信息
  buyPrice: number // 购买价格
}

/**
 * 机器配置表
 */
export const MACHINE_CONFIGS: Record<MachineType, MachineConfig> = {
  // ========== 烤箱 ==========
  machine_oven: {
    id: 'machine_oven',
    name: '烤箱',
    icon: '🔥',
    description: '烘焙类食物加工',
    size: [0.6, 0.6, 0.6],
    buyPrice: 200,
    recipes: [
      {
        id: 'recipe_bread',
        name: '面包',
        icon: '🍞',
        output: 'bread',
        outputCount: 1,
        ingredients: [
          { itemType: 'processed_food', itemId: 'food_flour', count: 3 }
        ],
        processTime: 10, // 10秒
        staminaRestore: 20,
        satiety: 30
      },
      {
        id: 'recipe_roasted_pork',
        name: '烤猪肉',
        icon: '🥩',
        output: 'bread', // 复用bread作为烤肉（简化）
        outputCount: 1,
        ingredients: [
          { itemType: 'animal_product', itemId: 'animal_pork', count: 1 }
        ],
        processTime: 15,
        staminaRestore: 40,
        satiety: 50
      },
      {
        id: 'recipe_roasted_beef',
        name: '烤牛肉',
        icon: '🥩',
        output: 'bread', // 复用bread作为烤肉（简化）
        outputCount: 1,
        ingredients: [
          { itemType: 'animal_product', itemId: 'animal_beef', count: 1 }
        ],
        processTime: 15,
        staminaRestore: 45,
        satiety: 55
      },
      {
        id: 'recipe_roasted_chicken',
        name: '烤鸡肉',
        icon: '🍗',
        output: 'bread', // 复用bread作为烤肉（简化）
        outputCount: 1,
        ingredients: [
          { itemType: 'animal_product', itemId: 'animal_chicken_meat', count: 1 }
        ],
        processTime: 12,
        staminaRestore: 35,
        satiety: 40
      },
      {
        id: 'recipe_roasted_mutton',
        name: '烤羊肉',
        icon: '🥩',
        output: 'bread', // 复用bread作为烤肉（简化）
        outputCount: 1,
        ingredients: [
          { itemType: 'animal_product', itemId: 'animal_mutton', count: 1 }
        ],
        processTime: 15,
        staminaRestore: 40,
        satiety: 50
      }
    ]
  },

  // ========== 锅炉 ==========
  machine_boiler: {
    id: 'machine_boiler',
    name: '锅炉',
    icon: '🍲',
    description: '煮汤、制作奶酪、果酱',
    size: [0.5, 0.4, 0.5],
    buyPrice: 250,
    recipes: [
      {
        id: 'recipe_soup',
        name: '汤品',
        icon: '🍲',
        output: 'soup',
        outputCount: 1,
        ingredients: [
          { itemType: 'crop', itemId: 'crop_carrot', count: 2 },
          { itemType: 'crop', itemId: 'crop_potato', count: 1 }
        ],
        processTime: 12,
        staminaRestore: 30,
        satiety: 40
      },
      {
        id: 'recipe_cheese',
        name: '奶酪',
        icon: '🧀',
        output: 'cheese',
        outputCount: 1,
        ingredients: [
          { itemType: 'animal_product', itemId: 'animal_milk', count: 3 }
        ],
        processTime: 20,
        staminaRestore: 35,
        satiety: 45,
        buff: {
          type: 'efficiency',
          value: 10, // 工作效率+10%
          duration: 300 // 5分钟
        }
      },
      {
        id: 'recipe_jam',
        name: '果酱',
        icon: '🍓',
        output: 'jammed_fruit',
        outputCount: 1,
        ingredients: [
          { itemType: 'fruit', itemId: 'fruit_cherry', count: 5 }
        ],
        processTime: 15,
        staminaRestore: 25,
        satiety: 35
      }
    ]
  },

  // ========== 榨汁机 ==========
  machine_juicer: {
    id: 'machine_juicer',
    name: '榨汁机',
    icon: '🧃',
    description: '水果 → 果汁',
    size: [0.3, 0.4, 0.3],
    buyPrice: 300,
    recipes: [
      {
        id: 'recipe_juice',
        name: '果汁',
        icon: '🧃',
        output: 'juice',
        outputCount: 1,
        ingredients: [
          { itemType: 'fruit', itemId: 'fruit_apple', count: 3 }
        ],
        processTime: 8,
        staminaRestore: 15,
        satiety: 20
      },
      {
        id: 'recipe_orange_juice',
        name: '橙汁',
        icon: '🍊',
        output: 'juice',
        outputCount: 2,
        ingredients: [
          { itemType: 'fruit', itemId: 'fruit_orange', count: 3 }
        ],
        processTime: 8,
        staminaRestore: 18,
        satiety: 25
      },
      {
        id: 'recipe_peach_juice',
        name: '桃汁',
        icon: '🍑',
        output: 'juice',
        outputCount: 2,
        ingredients: [
          { itemType: 'fruit', itemId: 'fruit_peach', count: 3 }
        ],
        processTime: 8,
        staminaRestore: 20,
        satiety: 28
      }
    ]
  },

  // ========== 研磨机 ==========
  machine_grinder: {
    id: 'machine_grinder',
    name: '研磨机',
    icon: '⚙️',
    description: '小麦 → 面粉',
    size: [0.4, 0.5, 0.4],
    buyPrice: 350,
    recipes: [
      {
        id: 'recipe_flour',
        name: '面粉',
        icon: '🌾',
        output: 'flour',
        outputCount: 1,  // 产出1个面粉
        ingredients: [
          { itemType: 'crop', itemId: 'crop_wheat', count: 4 }  // 需要4个小麦
        ],
        processTime: 15,
        staminaRestore: 5,
        satiety: 10
      }
    ]
  },

  // ========== 搅拌机 ==========
  machine_mixer: {
    id: 'machine_mixer',
    name: '搅拌机',
    icon: '🥣',
    description: '制作蛋糕、饼干',
    size: [0.25, 0.35, 0.25],
    buyPrice: 400,
    recipes: [
      {
        id: 'recipe_cake',
        name: '蛋糕',
        icon: '🍰',
        output: 'cake',
        outputCount: 1,
        ingredients: [
          { itemType: 'processed_food', itemId: 'food_flour', count: 3 },
          { itemType: 'animal_product', itemId: 'animal_egg', count: 2 }
        ],
        processTime: 25,
        staminaRestore: 80,
        satiety: 100,
        buff: {
          type: 'speed',
          value: 20, // 移动速度+20%
          duration: 600 // 10分钟
        }
      },
      {
        id: 'recipe_pizza',
        name: '披萨',
        icon: '🍕',
        output: 'pizza',
        outputCount: 1,
        ingredients: [
          { itemType: 'processed_food', itemId: 'food_flour', count: 2 },
          { itemType: 'processed_food', itemId: 'food_cheese', count: 1 },
          { itemType: 'crop', itemId: 'crop_tomato', count: 2 }
        ],
        processTime: 30,
        staminaRestore: 60,
        satiety: 80,
        buff: {
          type: 'luck',
          value: 15, // 幸运+15%（作物品质提升）
          duration: 600
        }
      }
    ]
  }
}

/**
 * 放置的机器实例数据
 */
export interface PlacedMachine {
  id: string // 唯一ID（使用位置键）
  machineType: MachineType // 机器类型
  position: [number, number, number] // 位置 [x, y, z]

  // 加工状态
  processing: boolean // 是否正在加工
  recipeId?: string // 当前加工的配方ID
  processStartTime?: number // 开始加工时间戳
  processEndTime?: number // 预计结束时间戳
  processedCount?: number // 加工次数（用于计算成品数量）
}

/**
 * 食物物品配置（用于背包系统和商店系统）
 */
export const FOOD_ITEMS: Record<FoodType, {
  name: string
  icon: string
  description: string
  price: number // 出售价格
  staminaRestore: number
  satiety: number
  buff?: {
    type: 'speed' | 'efficiency' | 'luck'
    value: number
    duration: number
  }
}> = {
  bread: {
    name: '面包',
    icon: '🍞',
    description: '恢复20体力',
    price: 30,
    staminaRestore: 20,
    satiety: 30
  },
  cake: {
    name: '蛋糕',
    icon: '🍰',
    description: '恢复80体力，速度+20%',
    price: 50,
    staminaRestore: 80,
    satiety: 100,
    buff: {
      type: 'speed',
      value: 20,
      duration: 600
    }
  },
  soup: {
    name: '汤品',
    icon: '🍲',
    description: '恢复30体力',
    price: 40,
    staminaRestore: 30,
    satiety: 40
  },
  juice: {
    name: '果汁',
    icon: '🧃',
    description: '恢复15体力',
    price: 25,
    staminaRestore: 15,
    satiety: 20
  },
  cheese: {
    name: '奶酪',
    icon: '🧀',
    description: '恢复35体力，效率+10%',
    price: 40,
    staminaRestore: 35,
    satiety: 45,
    buff: {
      type: 'efficiency',
      value: 10,
      duration: 300
    }
  },
  pizza: {
    name: '披萨',
    icon: '🍕',
    description: '恢复60体力，幸运+15%',
    price: 60,
    staminaRestore: 60,
    satiety: 80,
    buff: {
      type: 'luck',
      value: 15,
      duration: 600
    }
  },
  flour: {
    name: '面粉',
    icon: '🌾',
    description: '半成品，可用于烘焙',
    price: 15,
    staminaRestore: 5,
    satiety: 10
  },
  jammed_fruit: {
    name: '果酱',
    icon: '🍓',
    description: '恢复25体力',
    price: 35,
    staminaRestore: 25,
    satiety: 35
  }
}

/**
 * 获取机器配置
 */
export function getMachineConfig(machineType: MachineType): MachineConfig {
  return MACHINE_CONFIGS[machineType]
}

/**
 * 获取配方配置
 */
export function getRecipe(machineType: MachineType, recipeId: string): FoodRecipe | undefined {
  const config = getMachineConfig(machineType)
  return config.recipes.find(r => r.id === recipeId)
}

/**
 * 检查配方是否可以制作（检查材料是否足够）
 */
export function canCraftRecipe(
  recipe: FoodRecipe,
  inventory: Array<{ itemType: string; itemId?: string; count: number }>
): boolean {
  for (const ingredient of recipe.ingredients) {
    // 查找背包中是否有足够的材料
    const hasIngredient = inventory.some(item => {
      // 匹配材料类型和ID
      if (item.itemType !== ingredient.itemType) return false
      if (item.itemId !== ingredient.itemId) return false
      return item.count >= ingredient.count
    })

    if (!hasIngredient) return false
  }

  return true
}

/**
 * 计算配方加工进度（0-100）
 */
export function getProcessProgress(
  processStartTime: number,
  processEndTime: number
): number {
  const now = Date.now()
  if (now >= processEndTime) return 100

  const totalDuration = processEndTime - processStartTime
  const elapsed = now - processStartTime
  return Math.floor((elapsed / totalDuration) * 100)
}
