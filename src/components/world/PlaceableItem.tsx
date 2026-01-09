/**
 * 可放置物品的3D渲染组件
 * 支持各种家具、方块的渲染和预览
 */

import { ItemModelConfig } from '../../config/ItemModels'

interface PlaceableItemProps {
  itemType: string
  config: ItemModelConfig
  position: [number, number, number]
  rotation?: [number, number, number]
  isPreview?: boolean      // 是否为预览模式（半透明）
  canPlace?: boolean        // 是否可放置（预览模式下，绿色=可，红色=不可）
}

/**
 * 可放置物品组件
 */
export function PlaceableItem({
  itemType,
  config,
  position,
  rotation = [0, 0, 0],
  isPreview = false,
  canPlace = true
}: PlaceableItemProps) {
  // 计算实际位置（位置 + 偏移）
  const actualPosition: [number, number, number] = [
    position[0] + config.offset[0],
    position[1] + config.offset[1],
    position[2] + config.offset[2]
  ]

  // 预览模式下的材质设置
  const previewOpacity = isPreview ? 0.5 : 1.0
  const previewColor = isPreview ? (canPlace ? '#00FF00' : '#FF0000') : undefined

  return (
    <group position={actualPosition} rotation={rotation}>
      {config.shape === 'box' && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={config.size} />
          <meshStandardMaterial
            color={previewColor || config.color}
            transparent={isPreview}
            opacity={previewOpacity}
          />
        </mesh>
      )}

      {config.shape === 'table' && (
        <TableMesh size={config.size} color={previewColor || config.color} isPreview={isPreview} opacity={previewOpacity} />
      )}

      {config.shape === 'chair' && (
        <ChairMesh size={config.size} color={previewColor || config.color} isPreview={isPreview} opacity={previewOpacity} />
      )}

      {config.shape === 'bed' && (
        <BedMesh size={config.size} color={previewColor || config.color} isPreview={isPreview} opacity={previewOpacity} />
      )}

      {config.shape === 'cabinet' && (
        <CabinetMesh size={config.size} color={previewColor || config.color} isPreview={isPreview} opacity={previewOpacity} />
      )}

      {config.shape === 'flowerpot' && (
        <FlowerpotMesh size={config.size} color={previewColor || config.color} isPreview={isPreview} opacity={previewOpacity} />
      )}

      {config.shape === 'shipping_box' && (
        <ShippingBoxMesh size={config.size} isPreview={isPreview} opacity={previewOpacity} />
      )}
    </group>
  )
}

/**
 * 桌子模型
 */
function TableMesh({ size, color, isPreview, opacity }: { size: [number, number, number]; color?: string; isPreview: boolean; opacity: number }) {
  const [width, height, depth] = size
  const legThickness = 0.08

  return (
    <group>
      {/* 桌面 */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.08, depth]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 四条桌腿 */}
      <mesh position={[width / 2 - legThickness, legThickness, depth / 2 - legThickness]} castShadow>
        <boxGeometry args={[legThickness, height * 0.8, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
      <mesh position={[-width / 2, legThickness, depth / 2 - legThickness]} castShadow>
        <boxGeometry args={[legThickness, height * 0.8, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
      <mesh position={[width / 2 - legThickness, legThickness, -depth / 2]} castShadow>
        <boxGeometry args={[legThickness, height * 0.8, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
      <mesh position={[-width / 2, legThickness, -depth / 2]} castShadow>
        <boxGeometry args={[legThickness, height * 0.8, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
    </group>
  )
}

/**
 * 椅子模型
 */
function ChairMesh({ size, color, isPreview, opacity }: { size: [number, number, number]; color?: string; isPreview: boolean; opacity: number }) {
  const [width, height, depth] = size
  const legThickness = 0.06
  const seatThickness = 0.08

  return (
    <group>
      {/* 座位 */}
      <mesh position={[0, seatThickness, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, seatThickness, depth]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 靠背 */}
      <mesh position={[0, height / 2 + seatThickness / 2, -depth / 2 + seatThickness / 2]} castShadow>
        <boxGeometry args={[width, height * 0.6, seatThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 四条椅腿 */}
      <mesh position={[width / 2 - legThickness, legThickness, depth / 2 - legThickness]} castShadow>
        <boxGeometry args={[legThickness, height * 0.5, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
      <mesh position={[-width / 2, legThickness, depth / 2 - legThickness]} castShadow>
        <boxGeometry args={[legThickness, height * 0.5, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
      <mesh position={[width / 2 - legThickness, legThickness, -depth / 2 + seatThickness]} castShadow>
        <boxGeometry args={[legThickness, height * 0.5, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
      <mesh position={[-width / 2, legThickness, -depth / 2 + seatThickness]} castShadow>
        <boxGeometry args={[legThickness, height * 0.5, legThickness]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
    </group>
  )
}

/**
 * 床模型
 */
function BedMesh({ size, color, isPreview, opacity }: { size: [number, number, number]; color?: string; isPreview: boolean; opacity: number }) {
  const [width, height, depth] = size

  return (
    <group>
      {/* 床架 */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height * 0.5, depth]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 床垫（白色） */}
      <mesh position={[0, height * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.95, height * 0.3, depth * 0.95]} />
        <meshStandardMaterial color="#FFFFFF" transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 枕头 */}
      <mesh position={[0, height * 0.9, -depth * 0.35]} castShadow>
        <boxGeometry args={[width * 0.6, 0.1, 0.2]} />
        <meshStandardMaterial color="#F5F5DC" transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 床头板 */}
      <mesh position={[0, height * 0.7, -depth / 2]} castShadow>
        <boxGeometry args={[width, height * 0.6, 0.08]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
    </group>
  )
}

/**
 * 柜子模型
 */
function CabinetMesh({ size, color, isPreview, opacity }: { size: [number, number, number]; color?: string; isPreview: boolean; opacity: number }) {
  const [width, height, depth] = size

  return (
    <group>
      {/* 柜体 */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 门缝线 */}
      <mesh position={[0, height / 2, depth / 2 + 0.001]}>
        <boxGeometry args={[0.02, height * 0.95, 0.01]} />
        <meshStandardMaterial color="#5D4037" transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 门把手 */}
      <mesh position={[width * 0.2, height / 2, depth / 2 + 0.01]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#FFD700" transparent={isPreview} opacity={opacity} />
      </mesh>
    </group>
  )
}

/**
 * 花盆模型
 */
function FlowerpotMesh({ size, color, isPreview, opacity }: { size: [number, number, number]; color?: string; isPreview: boolean; opacity: number }) {
  const [width, height, depth] = size

  return (
    <group>
      {/* 花盆体 */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[width / 2, width * 0.4, height, 12]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 绿色植物 */}
      <mesh position={[0, height + 0.1, 0]} castShadow>
        <coneGeometry args={[width * 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#228B22" transparent={isPreview} opacity={opacity} />
      </mesh>
    </group>
  )
}

/**
 * 出货箱模型
 */
function ShippingBoxMesh({ size, isPreview, opacity }: { size: [number, number, number]; isPreview: boolean; opacity: number }) {
  const [width, height, depth] = size

  return (
    <group>
      {/* 箱体 */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#8B4513" transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 箱盖 */}
      <mesh position={[0, height, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.05, 0.08, depth * 1.05]} />
        <meshStandardMaterial color="#A0522D" transparent={isPreview} opacity={opacity} />
      </mesh>

      {/* 出货箱标志（木板） */}
      <mesh position={[0, height / 2 + 0.01, depth / 2]}>
        <planeGeometry args={[width * 0.8, 0.3]} />
        <meshStandardMaterial color="#DEB887" transparent={isPreview} opacity={opacity} />
      </mesh>
    </group>
  )
}
