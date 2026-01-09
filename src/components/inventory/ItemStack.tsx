/**
 * 物品堆叠数据结构和工具函数
 */

export type ItemType = 'block' | 'tool' | 'item' | 'crop' | 'decoration' | 'machine' | 'animal' | 'special'

export type BlockType = 'wood' | 'stone' | 'dirt' | 'coal' | 'iron_ore' | 'gold_ore' | 'diamond' | 'glass' | 'door' | 'planks'
// CropType 现在从 FarmConfig.tsx 导入，以支持多种作物
export type CropType = 'carrot' | 'wheat' | 'potato' | 'tomato' | 'pumpkin'
export type ToolType = 'hoe' | 'watering_can' | 'sickle' | 'axe' | 'pickaxe' | 'shovel'
export type DecorationType = 'decor_table' | 'decor_chair' | 'decor_bed' | 'decor_cabinet' | 'decor_flowerpot' | 'decor_painting'
export type MachineType = 'machine_oven' | 'machine_boiler' | 'machine_juicer' | 'machine_grinder' | 'machine_mixer'
export type AnimalType = 'animal_chicken' | 'animal_cow' | 'animal_sheep' | 'animal_pig' | 'animal_feed' | 'animal_hay'
export type FacilityType = 'facility_chicken_coop' | 'facility_barn'
export type SpecialType = 'special_fertilizer' | 'special_expansion'
// 移除 SeedType，现在种子和作物使用相同的 CropType
export type AnimalProductType = 'egg' | 'milk' | 'wool' | 'meat' | 'pork' | 'beef' | 'chicken_meat' | 'mutton'
export type TreeType = 'apple' | 'orange' | 'peach' | 'cherry' | 'pear'
export type TreeFruitType = 'apple' | 'orange' | 'peach' | 'cherry' | 'pear'
export type FoodType = 'flour' | 'bread' | 'cake' | 'soup' | 'juice' | 'cheese' | 'pizza' | 'jammed_fruit'

/**
 * 物品堆叠接口
 */
export interface ItemStack {
  id: string // 唯一标识
  itemType: ItemType
  blockType?: BlockType
  cropType?: CropType
  toolType?: ToolType
  type?: BlockType | CropType | ToolType // 通用类型字段（兼容旧代码）
  count: number
  maxStack: number
  durability?: number // 工具耐久度
  maxDurability?: number // 工具最大耐久度
  name: string // 显示名称
  color?: string // 显示颜色（用于方块）
}

/**
 * 物品配置
 */
export const ITEM_CONFIG: Record<string, {
  name: string
  itemType: ItemType
  maxStack: number
  color?: string
  durability?: number
}> = {
  // 方块类
  wood: { name: '木头', itemType: 'block', maxStack: 64, color: '#8B4513' },
  stone: { name: '石头', itemType: 'block', maxStack: 64, color: '#808080' },
  dirt: { name: '泥土', itemType: 'block', maxStack: 64, color: '#8B6914' },
  coal: { name: '煤炭', itemType: 'block', maxStack: 64, color: '#2C2C2C' },
  iron_ore: { name: '铁矿石', itemType: 'block', maxStack: 64, color: '#A0522D' },
  gold_ore: { name: '金矿石', itemType: 'block', maxStack: 64, color: '#FFD700' },
  diamond: { name: '钻石', itemType: 'block', maxStack: 64, color: '#00CED1' },
  glass: { name: '玻璃', itemType: 'block', maxStack: 64, color: '#ADD8E6' },
  door: { name: '木门', itemType: 'block', maxStack: 64, color: '#8B4513' },
  planks: { name: '木板', itemType: 'block', maxStack: 64, color: '#DEB887' },

  // 作物类
  carrot: { name: '胡萝卜', itemType: 'crop', maxStack: 64 },
  wheat: { name: '小麦', itemType: 'crop', maxStack: 64 },
  potato: { name: '土豆', itemType: 'crop', maxStack: 64 },
  tomato: { name: '番茄', itemType: 'crop', maxStack: 64 },
  pumpkin: { name: '南瓜', itemType: 'crop', maxStack: 64 },

  // 工具类（暂时不支持堆叠）
  hoe: { name: '锄头', itemType: 'tool', maxStack: 1, durability: 100 },
  watering_can: { name: '水壶', itemType: 'tool', maxStack: 1, durability: 100 },
  sickle: { name: '镰刀', itemType: 'tool', maxStack: 1, durability: 100 },
  axe: { name: '斧头', itemType: 'tool', maxStack: 1, durability: 100 },
  pickaxe: { name: '镐子', itemType: 'tool', maxStack: 1, durability: 100 },
  shovel: { name: '铁锹', itemType: 'tool', maxStack: 1, durability: 100 },

  // 种子类（已移除，现在作物可以直接种植）
  // seed_carrot: { name: '胡萝卜种子', itemType: 'item', maxStack: 64, color: '#FFA500' },
  // seed_wheat: { name: '小麦种子', itemType: 'item', maxStack: 64, color: '#DAA520' },
  // seed_potato: { name: '土豆种子', itemType: 'item', maxStack: 64, color: '#DEB887' },
  // seed_tomato: { name: '番茄种子', itemType: 'item', maxStack: 64, color: '#FF6347' },
  // seed_pumpkin: { name: '南瓜种子', itemType: 'item', maxStack: 64, color: '#FF7518' },

  // 装饰类
  decor_table: { name: '桌子', itemType: 'decoration', maxStack: 64 },
  decor_chair: { name: '椅子', itemType: 'decoration', maxStack: 64 },
  decor_bed: { name: '床', itemType: 'decoration', maxStack: 64 },
  decor_cabinet: { name: '柜子', itemType: 'decoration', maxStack: 64 },
  decor_flowerpot: { name: '花盆', itemType: 'decoration', maxStack: 64 },
  decor_painting: { name: '画', itemType: 'decoration', maxStack: 64 },

  // 机器设备类（不支持堆叠）
  machine_oven: { name: '烤箱', itemType: 'machine', maxStack: 1 },
  machine_boiler: { name: '锅炉', itemType: 'machine', maxStack: 1 },
  machine_juicer: { name: '榨汁机', itemType: 'machine', maxStack: 1 },
  machine_grinder: { name: '研磨机', itemType: 'machine', maxStack: 1 },
  machine_mixer: { name: '搅拌机', itemType: 'machine', maxStack: 1 },

  // 动物类
  animal_chicken: { name: '小鸡', itemType: 'animal', maxStack: 64 },
  animal_cow: { name: '小牛', itemType: 'animal', maxStack: 64 },
  animal_sheep: { name: '小羊', itemType: 'animal', maxStack: 64 },
  animal_pig: { name: '小猪', itemType: 'animal', maxStack: 64 },
  animal_feed: { name: '动物饲料', itemType: 'animal', maxStack: 64 },
  animal_hay: { name: '干草', itemType: 'animal', maxStack: 64 },
  facility_chicken_coop: { name: '鸡舍', itemType: 'animal', maxStack: 64 },
  facility_barn: { name: '牛棚', itemType: 'animal', maxStack: 64 },

  // 动物产品类
  egg: { name: '鸡蛋', itemType: 'item', maxStack: 64, color: '#FFFACD' },
  milk: { name: '牛奶', itemType: 'item', maxStack: 64, color: '#F5F5DC' },
  wool: { name: '羊毛', itemType: 'item', maxStack: 64, color: '#FFFAF0' },
  meat: { name: '肉类', itemType: 'item', maxStack: 64, color: '#CD5C5C' },
  pork: { name: '猪肉', itemType: 'item', maxStack: 64, color: '#FFB6C1' },
  beef: { name: '牛肉', itemType: 'item', maxStack: 64, color: '#8B4513' },
  chicken_meat: { name: '鸡肉', itemType: 'item', maxStack: 64, color: '#FFDEAD' },
  mutton: { name: '羊肉', itemType: 'item', maxStack: 64, color: '#FFB347' },

  // 加工食品类
  flour: { name: '面粉', itemType: 'item', maxStack: 64, color: '#F5DEB3' },
  bread: { name: '面包', itemType: 'item', maxStack: 64, color: '#DEB887' },
  cake: { name: '蛋糕', itemType: 'item', maxStack: 64, color: '#FFC0CB' },
  soup: { name: '汤品', itemType: 'item', maxStack: 64, color: '#FFA500' },
  juice: { name: '果汁', itemType: 'item', maxStack: 64, color: '#FFD700' },
  cheese: { name: '奶酪', itemType: 'item', maxStack: 64, color: '#FFEC8B' },
  pizza: { name: '披萨', itemType: 'item', maxStack: 64, color: '#FF6347' },
  jammed_fruit: { name: '果酱', itemType: 'item', maxStack: 64, color: '#FF1493' },

  // 树苗类
  apple: { name: '苹果树苗', itemType: 'item', maxStack: 64, color: '#228B22' },
  orange: { name: '橙子树苗', itemType: 'item', maxStack: 64, color: '#32CD32' },
  peach: { name: '桃树苗', itemType: 'item', maxStack: 64, color: '#FF69B4' },
  cherry: { name: '樱桃树苗', itemType: 'item', maxStack: 64, color: '#8B0000' },
  pear: { name: '梨树苗', itemType: 'item', maxStack: 64, color: '#9ACD32' },

  // 特殊物品类
  special_fertilizer: { name: '肥料', itemType: 'special', maxStack: 64 },
  special_expansion: { name: '扩建许可证', itemType: 'special', maxStack: 64 },
}

/**
 * 创建空槽位
 */
export function createEmptyStack(): ItemStack {
  return {
    id: '',
    itemType: 'item',
    count: 0,
    maxStack: 64,
    name: '空'
  }
}

/**
 * 创建物品堆叠
 */
export function createStack(
  type: BlockType | CropType | ToolType | DecorationType | MachineType | AnimalType | SpecialType | FacilityType | AnimalProductType | TreeType | TreeFruitType | FoodType,
  count: number = 1
): ItemStack | null {
  const config = ITEM_CONFIG[type]
  if (!config) return null

  const actualCount = Math.min(count, config.maxStack)

  const stack: ItemStack = {
    id: `${type}_${Date.now()}_${Math.random()}`,
    itemType: config.itemType,
    type: type, // 添加通用类型字段
    count: actualCount,
    maxStack: config.maxStack,
    name: config.name,
    color: config.color
  }

  // 根据类型设置具体字段
  if (config.itemType === 'block') {
    stack.blockType = type as BlockType
  } else if (config.itemType === 'crop') {
    stack.cropType = type as CropType
  } else if (config.itemType === 'tool') {
    stack.toolType = type as ToolType
    stack.durability = config.durability
    stack.maxDurability = config.durability
  } else if (config.itemType === 'decoration') {
    // 装饰品使用 decorationType 字段
    ;(stack as any).decorationType = type as DecorationType
  } else if (config.itemType === 'machine') {
    // 机器使用 machineType 字段
    ;(stack as any).machineType = type as MachineType
  } else if (config.itemType === 'animal') {
    // 动物使用 animalType 字段
    ;(stack as any).animalType = type as AnimalType | FacilityType
  } else if (config.itemType === 'special') {
    // 特殊物品使用 specialType 字段
    ;(stack as any).specialType = type as SpecialType
  } else if (config.itemType === 'item' && (type === 'egg' || type === 'milk' || type === 'wool' || type === 'meat' || type === 'pork' || type === 'beef' || type === 'chicken_meat' || type === 'mutton')) {
    // 动物产品使用 productType 字段
    ;(stack as any).productType = type as AnimalProductType
  } else if (config.itemType === 'item' && (type === 'apple' || type === 'orange' || type === 'peach' || type === 'cherry' || type === 'pear')) {
    // 树苗使用 treeType 字段
    ;(stack as any).treeType = type as TreeType
  } else if (config.itemType === 'item' && (type === 'flour' || type === 'bread' || type === 'cake' || type === 'soup' || type === 'juice' || type === 'cheese' || type === 'pizza' || type === 'jammed_fruit')) {
    // 加工食品使用 foodType 字段
    ;(stack as any).foodType = type as FoodType
  }
  // 移除了种子处理逻辑，现在作物可以直接种植

  return stack
}

/**
 * 检查两个物品是否可以堆叠
 */
export function canStack(stack1: ItemStack, stack2: ItemStack): boolean {
  // 必须都是非空槽位
  if (stack1.count === 0 || stack2.count === 0) return false

  // 工具和机器不能堆叠
  if (stack1.itemType === 'tool' || stack2.itemType === 'tool') return false
  if (stack1.itemType === 'machine' || stack2.itemType === 'machine') return false

  // 类型必须相同
  if (stack1.itemType !== stack2.itemType) return false

  // 具体类型必须相同
  if (stack1.itemType === 'block' && stack2.itemType === 'block') {
    return stack1.blockType === stack2.blockType
  }

  if (stack1.itemType === 'crop' && stack2.itemType === 'crop') {
    return stack1.cropType === stack2.cropType
  }

  // 装饰品
  if (stack1.itemType === 'decoration' && stack2.itemType === 'decoration') {
    return (stack1 as any).decorationType === (stack2 as any).decorationType
  }

  // 动物
  if (stack1.itemType === 'animal' && stack2.itemType === 'animal') {
    return (stack1 as any).animalType === (stack2 as any).animalType
  }

  // 特殊物品
  if (stack1.itemType === 'special' && stack2.itemType === 'special') {
    return (stack1 as any).specialType === (stack2 as any).specialType
  }

  // 普通物品（树苗、动物产品、加工食品等）
  if (stack1.itemType === 'item' && stack2.itemType === 'item') {
    // 树苗
    if ((stack1 as any).treeType && (stack2 as any).treeType) {
      return (stack1 as any).treeType === (stack2 as any).treeType
    }
    // 动物产品
    if ((stack1 as any).productType && (stack2 as any).productType) {
      return (stack1 as any).productType === (stack2 as any).productType
    }
    // 加工食品
    if ((stack1 as any).foodType && (stack2 as any).foodType) {
      return (stack1 as any).foodType === (stack2 as any).foodType
    }
  }

  return false
}

/**
 * 合并两个物品堆叠
 * @returns 合并后的堆叠，如果无法合并则返回 null
 */
export function mergeStacks(stack1: ItemStack, stack2: ItemStack): ItemStack | null {
  if (!canStack(stack1, stack2)) return null

  const totalCount = stack1.count + stack2.count
  const maxStack = stack1.maxStack

  if (totalCount <= maxStack) {
    // 完全合并到 stack1
    return {
      ...stack1,
      count: totalCount
    }
  } else {
    // 部分合并
    return {
      ...stack1,
      count: maxStack
    }
  }
}

/**
 * 拆分物品堆叠
 * @param count 要拆分的数量
 * @returns 拆分后的新堆叠
 */
export function splitStack(stack: ItemStack, count: number): { original: ItemStack; split: ItemStack } | null {
  if (count <= 0 || count >= stack.count) return null

  return {
    original: {
      ...stack,
      count: stack.count - count,
      id: `${stack.type}_${Date.now()}_${Math.random()}`
    },
    split: {
      ...stack,
      count: count,
      id: `${stack.type}_${Date.now()}_${Math.random()}`
    }
  } as any
}

/**
 * 检查槽位是否为空
 */
export function isEmpty(stack: ItemStack): boolean {
  return stack.count === 0 || !stack.id
}
