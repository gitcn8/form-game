import { useState, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { PlaceableItem } from '../world/PlaceableItem'
import { getItemModelConfig } from '../../config/ItemModels'

interface BuildPreviewProps {
  buildMode: boolean
  selectedItemType: string | null  // 当前选中的物品类型
  placedItems: Array<{
    id: string
    type: string
    position: [number, number, number]
    rotation?: [number, number, number]
  }>
  maxDistance?: number
}

/**
 * 建造预览组件（半透明物品）
 * 显示当前选中物品的放置位置预览
 */
export function BuildPreview({
  buildMode,
  selectedItemType,
  placedItems,
  maxDistance = 5
}: BuildPreviewProps) {
  const { camera } = useThree()
  const [previewPosition, setPreviewPosition] = useState<[number, number, number] | null>(null)
  const [canPlace, setCanPlace] = useState(true)
  const raycaster = useRef(new THREE.Raycaster())

  useFrame(() => {
    if (!buildMode || !selectedItemType) {
      setPreviewPosition(null)
      return
    }

    // 检查物品是否可放置
    const config = getItemModelConfig(selectedItemType)
    if (!config) {
      setPreviewPosition(null)
      return
    }

    // 从相机向前发射射线
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)

    // 检测与地面的交点
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersectPoint = new THREE.Vector3()
    raycaster.current.ray.intersectPlane(groundPlane, intersectPoint)

    if (intersectPoint) {
      // 检查距离
      const distance = camera.position.distanceTo(intersectPoint)
      if (distance > maxDistance) {
        setPreviewPosition(null)
        return
      }

      // 对齐到网格（中心点）
      const alignedX = Math.round(intersectPoint.x)
      const alignedZ = Math.round(intersectPoint.z)

      // 检查该位置是否已有物品（简单的碰撞检测）
      const hasItem = placedItems.some((item) => {
        const itemConfig = getItemModelConfig(item.type)
        if (!itemConfig) return false
        const dx = Math.abs(item.position[0] - alignedX)
        const dz = Math.abs(item.position[2] - alignedZ)
        // 检查水平距离（考虑物品大小）
        const minDistance = (config.size[0] + itemConfig.size[0]) / 2
        return dx < minDistance * 0.5 && dz < minDistance * 0.5
      })

      setCanPlace(!hasItem)
      setPreviewPosition([alignedX, 0, alignedZ])
    } else {
      setPreviewPosition(null)
    }
  })

  if (!buildMode || !previewPosition || !selectedItemType) return null

  const config = getItemModelConfig(selectedItemType)
  if (!config) return null

  return (
    <PlaceableItem
      itemType={selectedItemType}
      config={config}
      position={previewPosition}
      isPreview={true}
      canPlace={canPlace}
    />
  )
}
