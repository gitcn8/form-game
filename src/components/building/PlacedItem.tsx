/**
 * 已放置物品组件
 * 支持所有类型物品的渲染和交互（拆除、旋转等）
 */

import { PlaceableItem } from '../world/PlaceableItem'
import { getItemModelConfig } from '../../config/ItemModels'

interface PlacedItemProps {
  item: {
    id: string
    type: string  // 物品类型（wood、decor_bed、shipping_box等）
    position: [number, number, number]
    rotation?: [number, number, number]  // 物品旋转
  }
  onRemove: (itemId: string) => void
  onInteract?: (item: any) => void  // 交互回调（比如睡觉、打开出货箱）
}

/**
 * 已放置物品组件
 * 支持点击拆除、交互
 */
export function PlacedItem({ item, onRemove, onInteract }: PlacedItemProps) {
  const config = getItemModelConfig(item.type)
  if (!config) {
    console.warn('未找到物品配置:', item.type)
    return null
  }

  // 某些物品支持交互（床、出货箱等）
  const isInteractable = item.type === 'decor_bed' || item.type === 'shipping_box'

  return (
    <PlaceableItem
      itemType={item.type}
      config={config}
      position={item.position}
      rotation={item.rotation}
      isPreview={false}
      canPlace={true}
    />
  )
}
