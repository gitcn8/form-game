import { BLOCK_TYPES } from './BlockTypes'

interface WorldBlockProps {
  position: [number, number, number]
  blockType: string
  isTargeted?: boolean  // 是否被瞄准
  onRemove: (position: [number, number, number]) => void
}

/**
 * 世界方块组件（地下层、矿石等）
 * 用于渲染可挖掘的方块
 *
 * 性能优化：
 * - 移除了所有交互事件（onClick、onPointerOver、onPointerOut）
 * - 移除了阴影渲染（castShadow、receiveShadow）
 * - 挖掘通过 MiningSystem 的射线检测实现，不依赖方块的事件
 */
export function WorldBlock({ position, blockType, isTargeted = false }: Omit<WorldBlockProps, 'onRemove'>) {
  const blockData = BLOCK_TYPES[blockType]

  if (!blockData) return null

  const [x, y, z] = position

  // 计算颜色（被瞄准时变深）
  const getColor = (baseColor: string) => {
    if (!isTargeted) return baseColor

    // 简单的颜色变深函数
    const hex = baseColor.replace('#', '')
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40)
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40)
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40)

    return `rgb(${r}, ${g}, ${b})`
  }

  // 草方块特殊处理：由草层和泥土层组成
  if (blockType === 'GRASS') {
    const grassColor = getColor('#7CFC00')  // 草绿色
    const dirtColor = getColor('#8B6914')   // 泥土棕色

    return (
      <group position={[x, y, z]}>
        {/* 泥土层（底部，高度 0.95，中心在 y = -0.475） */}
        <mesh position={[0, -0.475, 0]}>
          <boxGeometry args={[1, 0.95, 1]} />
          <meshStandardMaterial color={dirtColor} />
        </mesh>

        {/* 草层（顶部，高度 0.05，中心在 y = 0.025，刚好贴在泥土层顶部） */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[1, 0.05, 1]} />
          <meshStandardMaterial color={grassColor} />
        </mesh>
      </group>
    )
  }

  // 其他方块：正常渲染（无阴影，无交互事件）
  const darkerColor = getColor(blockData.color)

  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={darkerColor} />
    </mesh>
  )
}
