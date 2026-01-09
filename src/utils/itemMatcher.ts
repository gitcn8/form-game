/**
 * 物品匹配工具
 * 用于将配方的材料格式与背包物品格式进行匹配
 */

import type { ItemStack } from '../components/inventory/ItemStack'
import type { RecipeIngredient } from '../config/MachineConfig'

// 重新导出 ItemStack 类型供其他模块使用
export type { ItemStack } from '../components/inventory/ItemStack'

/**
 * 从配方的 itemId 中提取类型信息
 *
 * 配方格式：itemId: 'crop_wheat', 'animal_milk', 'food_flour', 'fruit_apple'
 * 背包格式：cropType: 'wheat', productType: 'milk', 等
 */
export function parseIngredientId(itemId: string): {
  itemType: string
  subType: string
} {
  const parts = itemId.split('_')
  if (parts.length < 2) {
    throw new Error(`Invalid itemId format: ${itemId}`)
  }

  const itemType = parts[0] // 'crop', 'animal', 'food', 'fruit'
  const subType = parts.slice(1).join('_') // 'wheat', 'milk', 'flour', 'apple'

  return { itemType, subType }
}

/**
 * 检查背包物品是否匹配配方材料
 */
export function matchesIngredient(
  item: ItemStack,
  ingredient: RecipeIngredient
): boolean {
  // 空物品不匹配
  if (item.count === 0 || !item.id) {
    return false
  }

  // itemType 必须匹配
  // 注意：ingredient.itemType 可能是 'crop', 'animal_product', 'processed_food', 'fruit'
  // 而 item.itemType 是 'block', 'tool', 'item', 'crop' 等
  // 需要做映射转换
  const itemItemType = mapIngredientTypeToItemType(ingredient.itemType)
  if (item.itemType !== itemItemType) {
    return false
  }

  // 解析配方 itemId
  const { subType } = parseIngredientId(ingredient.itemId)

  // 根据 itemType 检查子类型
  switch (ingredient.itemType) {
    case 'crop':
      return item.cropType === subType

    case 'animal_product':
      // 动物产品：egg, milk, wool, meat
      return (item as any).productType === subType

    case 'processed_food':
      // 加工食品：flour, cheese, bread, cake 等
      // 需要检查物品的 foodType 或 name
      // 简化处理：使用 name 匹配
      const foodNames: Record<string, string> = {
        food_flour: '面粉',
        food_cheese: '奶酪',
        food_bread: '面包',
        food_cake: '蛋糕',
        food_pizza: '披萨',
        food_soup: '汤品',
        food_juice: '果汁',
        food_jam: '果酱'
      }
      return item.name === foodNames[ingredient.itemId]

    case 'fruit':
      // 水果：apple, orange, peach, cherry, pear
      // 水果可能是 'item' 类型，使用 treeType 字段
      return (item as any).treeType === subType || (item as any).fruitType === subType

    default:
      return false
  }
}

/**
 * 将配方材料类型映射到物品类型
 */
function mapIngredientTypeToItemType(ingredientType: string): string {
  switch (ingredientType) {
    case 'crop':
      return 'crop'
    case 'animal_product':
      return 'item' // 动物产品是 'item' 类型
    case 'processed_food':
      return 'item' // 加工食品也是 'item' 类型
    case 'fruit':
      return 'item' // 水果也是 'item' 类型
    default:
      return ingredientType
  }
}

/**
 * 查找背包中匹配材料的物品
 * @returns 匹配的物品索引，如果没有找到返回 -1
 */
export function findIngredientInInventory(
  inventory: ItemStack[],
  ingredient: RecipeIngredient
): number {
  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i]
    if (matchesIngredient(item, ingredient)) {
      return i
    }
  }
  return -1
}

/**
 * 检查背包中是否有足够的材料
 */
export function hasEnoughIngredients(
  inventory: ItemStack[],
  ingredients: RecipeIngredient[]
): boolean {
  // 创建背包物品的副本用于计数
  const remainingItems = inventory.map(item => ({ ...item }))

  for (const ingredient of ingredients) {
    let needed = ingredient.count

    // 查找匹配的物品并累加数量
    for (let i = 0; i < remainingItems.length && needed > 0; i++) {
      const item = remainingItems[i]

      if (matchesIngredient(item, ingredient)) {
        const available = item.count
        if (available >= needed) {
          // 找到足够的材料
          needed = 0
        } else {
          // 数量不足，继续查找
          needed -= available
        }
      }
    }

    // 如果还需要材料，说明背包不够
    if (needed > 0) {
      return false
    }
  }

  return true
}

/**
 * 从背包中扣除材料
 * @returns 更新后的背包数组
 */
export function consumeIngredients(
  inventory: ItemStack[],
  ingredients: RecipeIngredient[]
): ItemStack[] {
  const newInventory = inventory.map(item => ({ ...item }))

  for (const ingredient of ingredients) {
    let needed = ingredient.count

    // 查找并扣除匹配的物品
    for (let i = 0; i < newInventory.length && needed > 0; i++) {
      const item = newInventory[i]

      if (matchesIngredient(item, ingredient)) {
        const available = item.count

        if (available >= needed) {
          // 扣除所需数量
          item.count -= needed
          needed = 0

          // 如果数量为0，重置为空槽位
          if (item.count === 0) {
            Object.assign(item, {
              id: '',
              itemType: 'item' as const,
              count: 0,
              maxStack: 64,
              name: '空',
              cropType: undefined,
              blockType: undefined,
              toolType: undefined,
              color: undefined
            })
          }
        } else {
          // 扣除全部，继续查找
          item.count = 0
          needed -= available

          // 重置为空槽位
          Object.assign(item, {
            id: '',
            itemType: 'item' as const,
            count: 0,
            maxStack: 64,
            name: '空',
            cropType: undefined,
            blockType: undefined,
            toolType: undefined,
            color: undefined
          })
        }
      }
    }
  }

  return newInventory
}

/**
 * 创建食物物品
 */
export function createFoodItem(
  foodType: string,
  count: number
): ItemStack {
  const foodConfig: Record<string, { name: string; icon: string; color?: string }> = {
    bread: { name: '面包', icon: '🍞' },
    cake: { name: '蛋糕', icon: '🍰' },
    soup: { name: '汤品', icon: '🍲' },
    juice: { name: '果汁', icon: '🧃' },
    cheese: { name: '奶酪', icon: '🧀' },
    pizza: { name: '披萨', icon: '🍕' },
    flour: { name: '面粉', icon: '🌾' },
    jammed_fruit: { name: '果酱', icon: '🍓' }
  }

  const config = foodConfig[foodType] || { name: foodType, icon: '📦' }

  return {
    id: `food_${foodType}_${Date.now()}_${Math.random()}`,
    itemType: 'item',
    count,
    maxStack: 64,
    name: config.name,
    color: config.color
  } as ItemStack
}
