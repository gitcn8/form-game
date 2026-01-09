import { materialColors } from '../world/BlockTypes'

interface PlacedBlockProps {
  block: {
    id: string
    type: 'wood' | 'stone' | 'dirt' | 'door' | 'glass' | 'planks'
    position: [number, number, number]
  }
  onRemove: (blockId: string) => void
}

/**
 * 已放置的方块组件
 * 支持点击拆除和悬停高亮
 */
export function PlacedBlock({ block, onRemove }: PlacedBlockProps) {
  // 根据方块类型设置不同的几何体和材质
  const getGeometryAndMaterial = () => {
    switch (block.type) {
      case 'door':
        // 门：窄而高
        return {
          geometry: <boxGeometry args={[0.4, 1, 1]} />,
          material: <meshStandardMaterial color={materialColors.door} />
        }
      case 'glass':
        // 玻璃：半透明
        return {
          geometry: <boxGeometry args={[1, 1, 1]} />,
          material: <meshStandardMaterial color={materialColors.glass} transparent opacity={0.3} />
        }
      default:
        // 普通方块
        return {
          geometry: <boxGeometry args={[1, 1, 1]} />,
          material: <meshStandardMaterial color={materialColors[block.type]} />
        }
    }
  }

  const { geometry, material } = getGeometryAndMaterial()

  return (
    <mesh
      position={block.position}
      onClick={(e) => {
        e.stopPropagation()
        onRemove(block.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        ;(e.eventObject as any).userData.hovered = true
      }}
      onPointerOut={(e) => {
        ;(e.eventObject as any).userData.hovered = false
      }}
      castShadow
      receiveShadow
    >
      {geometry}
      {material}
    </mesh>
  )
}
