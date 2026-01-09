/**
 * 物品3D模型配置
 * 定义所有可放置物品的形状、尺寸和外观
 */

import type { BlockType, DecorationType, MachineType, FacilityType } from '../components/inventory/ItemStack'

/**
 * 物品形状类型
 */
export type ItemShape =
  | 'box'           // 立方体（泥土、石头等）
  | 'bed'           // 床
  | 'table'         // 桌子
  | 'chair'         // 椅子
  | 'cabinet'       // 柜子
  | 'flowerpot'     // 花盆
  | 'shipping_box'  // 出货箱

/**
 * 物品3D模型配置接口
 */
export interface ItemModelConfig {
  shape: ItemShape
  size: [number, number, number]  // [宽, 高, 深]
  color?: string                   // 主颜色
  offset: [number, number, number] // 放置位置偏移 [x, y, z]
  rotation?: [number, number, number] // 初始旋转 [x, y, z]
}

/**
 * 所有可放置物品的3D模型配置
 */
export const ITEM_MODELS: Record<string, ItemModelConfig> = {
  // ========== 方块类 ==========
  wood: {
    shape: 'box',
    size: [1, 1, 1],
    color: '#8B4513',
    offset: [0, 0.5, 0]
  },
  stone: {
    shape: 'box',
    size: [1, 1, 1],
    color: '#808080',
    offset: [0, 0.5, 0]
  },
  dirt: {
    shape: 'box',
    size: [1, 1, 1],
    color: '#8B6914',
    offset: [0, 0.5, 0]
  },
  planks: {
    shape: 'box',
    size: [1, 1, 1],
    color: '#DEB887',
    offset: [0, 0.5, 0]
  },
  glass: {
    shape: 'box',
    size: [1, 1, 1],
    color: '#ADD8E6',
    offset: [0, 0.5, 0]
  },

  // ========== 装饰类 ==========
  decor_table: {
    shape: 'table',
    size: [1.2, 0.75, 0.8],
    color: '#8B4513',
    offset: [0, 0.375, 0]
  },
  decor_chair: {
    shape: 'chair',
    size: [0.5, 0.9, 0.5],
    color: '#A0522D',
    offset: [0, 0.45, 0]
  },
  decor_bed: {
    shape: 'bed',
    size: [2, 0.6, 1.2],
    color: '#DEB887',
    offset: [0, 0.3, 0]
  },
  decor_cabinet: {
    shape: 'cabinet',
    size: [0.8, 1.2, 0.5],
    color: '#8B4513',
    offset: [0, 0.6, 0]
  },
  decor_flowerpot: {
    shape: 'flowerpot',
    size: [0.3, 0.4, 0.3],
    color: '#CD853F',
    offset: [0, 0.2, 0]
  },

  // ========== 设施类 ==========
  shipping_box: {
    shape: 'shipping_box',
    size: [1.5, 1, 1.5],
    color: '#8B4513',
    offset: [0, 0.5, 0]
  }
}

/**
 * 获取物品的3D模型配置
 */
export function getItemModelConfig(itemType: string): ItemModelConfig | null {
  return ITEM_MODELS[itemType] || null
}

/**
 * 检查物品是否可放置
 */
export function isPlaceable(itemType: string): boolean {
  return ITEM_MODELS.hasOwnProperty(itemType)
}
