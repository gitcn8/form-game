import { useState, useMemo } from 'react'
import { CropType, getCropConfig } from '../farming/CropConfig'
import { TreeType, getTreeConfig, isTreeReady } from '../farming/TreeConfig'

interface FarmPlotProps {
  position: [number, number, number]
  state: string
  cropType?: CropType // 新增：作物类型
  treeType?: TreeType // 新增：树木类型
  plantTime?: number // 新增：种植时间
  lastHarvestTime?: number // 新增：上次收获时间
  onClick: () => void
}

/**
 * 单根作物组件
 * 支持颜色覆盖（用于不同作物类型）
 */
function SingleCarrot({
  position,
  growthStage,
  colorOverride
}: {
  position: [number, number, number]
  growthStage: 'planted' | 'ready'
  colorOverride?: string // 可选的颜色覆盖
}) {
  if (growthStage === 'planted') {
    // 小苗阶段：2片绿色小叶子
    return (
      <group position={position}>
        <mesh position={[-0.02, 0.08, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.015, 0.08, 0.06]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        <mesh position={[0.02, 0.08, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.015, 0.08, 0.06]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>
    )
  }

  // 成熟阶段：使用颜色覆盖或默认橙色
  const cropColor = colorOverride || '#FF8C00'

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.025, 0.2, 8]} />
        <meshStandardMaterial color={cropColor} />
      </mesh>

      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.03, 0.06, 0.03]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      <mesh position={[-0.04, 0.22, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.04]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      <mesh position={[0.04, 0.22, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.04]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      <mesh position={[0, 0.22, 0.04]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.04]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

/**
 * 胡萝卜作物（每块地4根）
 */
function CarrotCrop({ growthStage }: { growthStage: 'planted' | 'ready' }) {
  if (growthStage === 'planted') {
    // 小苗阶段：4个小苗
    // 耕地高度 0.9，中心在 y=0，顶部在 y=0.45
    // 作物应该从耕地顶部开始生长
    const positions: [number, number, number][] = [
      [-0.3, 0.5, -0.2],
      [0.3, 0.5, -0.2],
      [-0.3, 0.5, 0.1],
      [0.3, 0.5, 0.1]
    ]

    return (
      <group>
        {positions.map((pos, i) => (
          <SingleCarrot key={i} position={pos} growthStage={growthStage} />
        ))}
      </group>
    )
  }

  // 成熟阶段：4根胡萝卜
  const positions: [number, number, number][] = [
    [-0.3, 0.5, -0.2],
    [0.3, 0.5, -0.2],
    [-0.3, 0.5, 0.1],
    [0.3, 0.5, 0.1]
  ]

  return (
    <group>
      {positions.map((pos, i) => (
        <SingleCarrot key={i} position={pos} growthStage={growthStage} />
      ))}
    </group>
  )
}

/**
 * 小麦作物模型
 * 实物特征：细长草状茎，顶部有下垂的金黄色麦穗，密集生长
 */
function WheatCrop({ growthStage, count }: { growthStage: 'planted' | 'ready'; count: number }) {
  if (growthStage === 'planted') {
    // 小苗阶段：5x5网格排列的绿色嫩芽（使用useMemo缓存）
    const positions = useMemo(() => {
      const pos: [number, number, number][] = []
      for (let i = 0; i < 25; i++) {
        const row = Math.floor(i / 5)
        const col = i % 5
        const x = (col - 2) * 0.12
        const z = (row - 2) * 0.12
        pos.push([x, 0.5, z] as [number, number, number])
      }
      return pos
    }, [growthStage])

    return (
      <group>
        {positions.map((pos, i) => (
          <group key={i} position={pos}>
            <mesh position={[0, 0.05, 0]} rotation={[0, 0, (i % 3 - 1) * 0.1]} castShadow>
              <cylinderGeometry args={[0.008, 0.01, 0.1, 4]} />
              <meshStandardMaterial color="#32CD32" />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  // 成熟阶段：5x5网格排列的细长茎，顶部有下垂的麦穗（使用useMemo缓存）
  const positions = useMemo(() => {
    const pos: [number, number, number][] = []
    for (let i = 0; i < 25; i++) {
      const row = Math.floor(i / 5)
      const col = i % 5
      const x = (col - 2) * 0.12
      const z = (row - 2) * 0.12
      pos.push([x, 0.5, z] as [number, number, number])
    }
    return pos
  }, [growthStage])

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* 细长的绿色茎 */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.008, 0.3, 5]} />
            <meshStandardMaterial color="#9ACD32" />
          </mesh>
          {/* 金黄色下垂的麦穗 */}
          <mesh position={[0, 0.32, 0]} rotation={[0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.02, 0.1, 6]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          {/* 麦须 */}
          <mesh position={[0, 0.38, 0]} rotation={[0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.003, 0.008, 0.06, 4]} />
            <meshStandardMaterial color="#DAA520" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * 土豆作物模型
 * 实物特征：地上只看到茂密的绿色茎叶，土豆在地下不可见
 */
function PotatoCrop({ growthStage, count }: { growthStage: 'planted' | 'ready'; count: number }) {
  if (growthStage === 'planted') {
    // 小苗阶段：4x4网格排列的小芽（使用useMemo缓存）
    const positions = useMemo(() => {
      const pos: [number, number, number][] = []
      for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4)
        const col = i % 4
        const x = (col - 1.5) * 0.15
        const z = (row - 1.5) * 0.15
        pos.push([x, 0.5, z] as [number, number, number])
      }
      return pos
    }, [growthStage])

    return (
      <group>
        {positions.map((pos, i) => (
          <group key={i} position={pos}>
            {/* 小茎 */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.015, 0.08, 5]} />
              <meshStandardMaterial color="#32CD32" />
            </mesh>
            {/* 小叶子 */}
            <mesh position={[0, 0.08, 0]} castShadow>
              <sphereGeometry args={[0.03, 6, 4]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  // 成熟阶段：4x4网格排列的茂密茎叶丛，看不到土豆（在地下）（使用useMemo缓存）
  const positions = useMemo(() => {
    const pos: [number, number, number][] = []
    for (let i = 0; i < 16; i++) {
      const row = Math.floor(i / 4)
      const col = i % 4
      const x = (col - 1.5) * 0.15
      const z = (row - 1.5) * 0.15
      pos.push([x, 0.5, z] as [number, number, number])
    }
    return pos
  }, [growthStage])

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* 茎 */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.2, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* 茂密的深绿色叶子丛 */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#2E8B57" />
          </mesh>
          {/* 额外的叶子细节 */}
          <mesh position={[0.04, 0.16, 0]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[0.04, 0.08, 0.04]} />
            <meshStandardMaterial color="#3CB371" />
          </mesh>
          <mesh position={[-0.04, 0.16, 0]} rotation={[0, 0, -0.3]} castShadow>
            <boxGeometry args={[0.04, 0.08, 0.04]} />
            <meshStandardMaterial color="#3CB371" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * 番茄作物模型
 * 实物特征：高大的灌木状植株（0.4-0.5米），有分枝，多个红色番茄挂在植株不同位置
 */
function TomatoCrop({ growthStage, count }: { growthStage: 'planted' | 'ready'; count: number }) {
  if (growthStage === 'planted') {
    // 小苗阶段：小番茄苗
    const positions: [number, number, number][] = []
    for (let i = 0; i < 4; i++) {
      const row = Math.floor(i / 2)
      const col = i % 2
      const x = (col === 0 ? -0.25 : 0.25)
      const z = (row === 0 ? -0.2 : 0.15)
      positions.push([x, 0.5, z] as [number, number, number])
    }

    return (
      <group>
        {positions.map((pos, i) => (
          <group key={i} position={pos}>
            {/* 小茎 */}
            <mesh position={[0, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.02, 0.16, 6]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* 小叶丛 */}
            <mesh position={[0, 0.14, 0]} castShadow>
              <sphereGeometry args={[0.04, 6, 4]} />
              <meshStandardMaterial color="#32CD32" />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  // 成熟阶段：高大植株 + 多个红色番茄
  const plantCount = Math.min(count, 5) // 每块地最多5株
  const positions: [number, number, number][] = []
  for (let i = 0; i < plantCount; i++) {
    const angle = (i / plantCount) * Math.PI * 2
    const radius = 0.25
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    positions.push([x, 0.5, z] as [number, number, number])
  }

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* 主茎 */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, 0.4, 7]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* 茂密的绿色叶丛 */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial color="#2E8B57" />
          </mesh>
          <mesh position={[0, 0.36, 0]} castShadow>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* 多个红色番茄挂在植株不同位置 */}
          <mesh position={[0.06, 0.22, 0]} castShadow>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color="#FF6347" />
          </mesh>
          <mesh position={[-0.06, 0.26, 0.04]} castShadow>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color="#FF6347" />
          </mesh>
          <mesh position={[0, 0.32, -0.05]} castShadow>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshStandardMaterial color="#FF4500" />
          </mesh>
          {/* 支撑杆（番茄种植常用） */}
          <mesh position={[0.08, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.5, 5]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * 南瓜作物模型
 * 实物特征：匍匐的藤蔓，宽大的绿色叶片，中心有一个大的扁圆形橙色南瓜
 */
function PumpkinCrop({ growthStage, count }: { growthStage: 'planted' | 'ready'; count: number }) {
  if (growthStage === 'planted') {
    // 小苗阶段：南瓜苗，可以看到小藤蔓和叶子
    return (
      <group position={[0, 0.5, 0]}>
        {/* 主藤蔓 */}
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.35, 6]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* 小叶子 */}
        <mesh position={[0.08, 0.06, 0]} rotation={[0, 0, 0.5]} castShadow>
          <boxGeometry args={[0.1, 0.02, 0.08]} />
          <meshStandardMaterial color="#32CD32" />
        </mesh>
        <mesh position={[-0.06, 0.06, 0.05]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.06]} />
          <meshStandardMaterial color="#32CD32" />
        </mesh>
        {/* 卷须 */}
        <mesh position={[0.12, 0.04, 0]} rotation={[0, 0, 0.8]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 4]} />
          <meshStandardMaterial color="#3CB371" />
        </mesh>
      </group>
    )
  }

  // 成熟阶段：大南瓜 + 匍匐藤蔓 + 大叶子
  const positions: [number, number, number][] = []
  for (let i = 0; i < count; i++) {
    // 南瓜很大，每块地只种1个，在中心位置
    positions.push([0, 0.5, 0] as [number, number, number])
  }

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* 匍匐的藤蔓（从中心向外延伸） */}
          <mesh position={[0.2, 0.02, 0]} rotation={[0, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.015, 0.018, 0.45, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[-0.18, 0.02, 0.1]} rotation={[0, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.015, 0.018, 0.4, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[0.05, 0.02, -0.2]} rotation={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.018, 0.35, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>

          {/* 宽大的绿色叶片 */}
          <mesh position={[0.25, 0.08, 0]} rotation={[0, 0, 0.6]} castShadow>
            <boxGeometry args={[0.18, 0.025, 0.14]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[-0.22, 0.08, 0.12]} rotation={[0, 0, -0.7]} castShadow>
            <boxGeometry args={[0.16, 0.025, 0.12]} />
            <meshStandardMaterial color="#2E8B57" />
          </mesh>
          <mesh position={[0.08, 0.08, -0.22]} rotation={[0, 0.8, 0.3]} castShadow>
            <boxGeometry args={[0.15, 0.025, 0.11]} />
            <meshStandardMaterial color="#2E8B57" />
          </mesh>

          {/* 卷须（南瓜特征） */}
          <mesh position={[0.3, 0.04, 0.05]} rotation={[0, 0, 1.2]} castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.15, 4]} />
            <meshStandardMaterial color="#3CB371" />
          </mesh>

          {/* 大扁圆形南瓜 */}
          <mesh position={[0, 0.14, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 10]} />
            <meshStandardMaterial color="#FF8C00" />
          </mesh>
          {/* 南瓜纹理（棱纹） */}
          <mesh position={[0, 0.14, 0]} castShadow>
            <torusGeometry args={[0.16, 0.008, 8, 16]} />
            <meshStandardMaterial color="#FF6600" />
          </mesh>

          {/* 南瓜蒂 */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.04, 6]} />
            <meshStandardMaterial color="#556B2F" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * 3D作物组件
 * 根据作物类型渲染不同的3D模型
 */
function Crop({ cropType, growthStage }: { cropType: CropType; growthStage: 'planted' | 'ready' }) {
  const config = getCropConfig(cropType)

  if (growthStage === 'planted') {
    // 小苗阶段 - 根据作物类型渲染不同的幼苗
    switch (cropType) {
      case 'wheat':
        return <WheatCrop growthStage={growthStage} count={config.yield} />
      case 'potato':
        return <PotatoCrop growthStage={growthStage} count={config.yield} />
      case 'tomato':
        return <TomatoCrop growthStage={growthStage} count={config.yield} />
      case 'pumpkin':
        return <PumpkinCrop growthStage={growthStage} count={config.yield} />
      case 'carrot':
      default:
        // 胡萝卜使用原有的小苗模型
        const positions: [number, number, number][] = [
          [-0.3, 0.5, -0.2],
          [0.3, 0.5, -0.2],
          [-0.3, 0.5, 0.1],
          [0.3, 0.5, 0.1]
        ]
        return (
          <group>
            {positions.map((pos, i) => (
              <SingleCarrot key={i} position={pos} growthStage={growthStage} />
            ))}
          </group>
        )
    }
  }

  // 成熟阶段 - 根据作物类型渲染不同的成熟作物
  switch (cropType) {
    case 'wheat':
      return <WheatCrop growthStage={growthStage} count={config.yield} />
    case 'potato':
      return <PotatoCrop growthStage={growthStage} count={config.yield} />
    case 'tomato':
      return <TomatoCrop growthStage={growthStage} count={config.yield} />
    case 'pumpkin':
      return <PumpkinCrop growthStage={growthStage} count={config.yield} />
    case 'carrot':
    default:
      // 胡萝卜使用原有的成熟模型（橙色圆锥体）
      const count = config.yield
      const carrotPositions: [number, number, number][] = []
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / 2)
        const col = i % 2
        const x = (col === 0 ? -0.3 : 0.3)
        const z = (row === 0 ? -0.2 : 0.1)
        carrotPositions.push([x, 0.5, z] as [number, number, number])
      }
      return (
        <group>
          {carrotPositions.map((pos, i) => (
            <SingleCarrot key={i} position={pos} growthStage={growthStage} colorOverride="#FFA500" />
          ))}
        </group>
      )
  }
}

/**
 * 农场地块组件
 * 显示不同状态的地块（未开垦、已开垦、已浇水、已种植、可收获）
 * 并显示3D作物
 */
export function FarmPlot({ position, state, cropType, treeType, plantTime, lastHarvestTime, onClick }: FarmPlotProps) {
  const [hovered, setHovered] = useState(false)

  const getColor = () => {
    switch (state) {
      case 'empty':
        return '#7CFC00' // 草绿色（未开垦）
      case 'tilled':
        return '#5C4033' // 深棕色（已开垦）
      case 'watered':
        return '#3D2914' // 深褐色（浇水后）
      case 'planted':
        return '#5C4033' // 深棕色（已种植）
      case 'ready':
        return '#5C4033' // 深棕色（可收获）
      case 'tree':
        return '#7CFC00' // 树木生长中（草地）
      case 'tree_ready':
        return '#7CFC00' // 树木成熟（草地）
      default:
        return '#7CFC00'
    }
  }

  // 检查树木是否成熟
  const isTreeMature = treeType && plantTime && isTreeReady({ treeType, plantTime, lastHarvestTime })

  // 计算实际渲染位置：树木需要比耕地高
  const isTreeState = state === 'tree' || state === 'tree_ready'
  const renderPosition: [number, number, number] = isTreeState
    ? [position[0], position[1] + 0.5, position[2]]  // 树木：从 y=0 开始（-0.45 + 0.5 = 0.05）
    : position  // 耕地：保持原位置 y=-0.95

  return (
    <group position={renderPosition}>
      {/* 只在非树木状态时显示地块（树木不需要显示地块，只是草地） */}
      {!isTreeState && (
        <mesh
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.02 : 1}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 0.9, 1]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
      )}

      {(state === 'planted' || state === 'ready') && cropType && (
        <Crop cropType={cropType} growthStage={state} />
      )}

      {/* 渲染树木 */}
      {isTreeState && treeType && (
        <Tree
          treeType={treeType}
          plantTime={plantTime!}
          isMature={isTreeMature || false}
          onClick={onClick}
        />
      )}
    </group>
  )
}

/**
 * 树苗组件（刚种植阶段）- Minecraft方块风格
 */
function Sapling({ treeType, onClick }: { treeType: TreeType; onClick?: () => void }) {
  const config = getTreeConfig(treeType)

  // 根据树种获取树干颜色
  const getTrunkColor = () => {
    const colors: Record<TreeType, string> = {
      apple: '#8B4513',
      orange: '#A0522D',
      peach: '#CD853F',
      cherry: '#8B4513',
      pear: '#D2B48C'
    }
    return colors[treeType]
  }

  return (
    <group onClick={onClick}>
      {/* 树干方块 */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color={getTrunkColor()} />
      </mesh>

      {/* 顶部叶子方块（统一绿色） */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.2]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

/**
 * 幼树组件（生长中期）- Minecraft方块风格
 */
function YoungTree({ treeType, progress, onClick }: { treeType: TreeType; progress: number; onClick?: () => void }) {
  const config = getTreeConfig(treeType)

  // 根据进度计算尺寸
  const trunkHeight = 0.5 + progress * 0.3 // 0.5 -> 0.8
  const blockSize = 0.3 + progress * 0.2 // 0.3 -> 0.5

  // 根据树种获取树干颜色
  const getTrunkColor = () => {
    const colors: Record<TreeType, string> = {
      apple: '#8B4513',
      orange: '#A0522D',
      peach: '#CD853F',
      cherry: '#8B4513',
      pear: '#D2B48C'
    }
    return colors[treeType]
  }

  return (
    <group onClick={onClick}>
      {/* 树干方块 */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.25, trunkHeight, 0.25]} />
        <meshStandardMaterial color={getTrunkColor()} />
      </mesh>

      {/* 树冠方块（十字形，统一绿色） */}
      <mesh position={[0, trunkHeight + blockSize / 2, 0]} castShadow>
        <boxGeometry args={[blockSize, blockSize, blockSize]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      <mesh position={[blockSize * 0.7, trunkHeight + blockSize * 0.5, 0]} castShadow>
        <boxGeometry args={[blockSize * 0.7, blockSize * 0.7, blockSize * 0.7]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      <mesh position={[-blockSize * 0.7, trunkHeight + blockSize * 0.5, 0]} castShadow>
        <boxGeometry args={[blockSize * 0.7, blockSize * 0.7, blockSize * 0.7]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      <mesh position={[0, trunkHeight + blockSize * 0.5, blockSize * 0.7]} castShadow>
        <boxGeometry args={[blockSize * 0.7, blockSize * 0.7, blockSize * 0.7]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

/**
 * 成熟树组件（完整的大树）- Minecraft方块风格
 */
function MatureTree({ treeType, showFruits, onClick }: { treeType: TreeType; showFruits: boolean; onClick?: () => void }) {
  const config = getTreeConfig(treeType)

  const trunkHeight = 1.0
  const blockSize = 0.7 // 树冠方块大小

  // 根据树种获取树干颜色
  const getTrunkColor = () => {
    const colors: Record<TreeType, string> = {
      apple: '#8B4513',
      orange: '#A0522D',
      peach: '#CD853F',
      cherry: '#8B4513',
      pear: '#D2B48C'
    }
    return colors[treeType]
  }

  return (
    <group onClick={onClick}>
      {/* 树干：2个原木方块垂直堆叠 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial color={getTrunkColor()} />
      </mesh>

      {/* 树冠：多层方块结构（统一绿色） */}
      {/* 底层（十字形） */}
      <mesh position={[0, trunkHeight + blockSize * 0.5, 0]} castShadow>
        <boxGeometry args={[blockSize, blockSize, blockSize]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[blockSize * 0.8, trunkHeight + blockSize * 0.5, 0]} castShadow>
        <boxGeometry args={[blockSize * 0.8, blockSize * 0.8, blockSize * 0.8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[-blockSize * 0.8, trunkHeight + blockSize * 0.5, 0]} castShadow>
        <boxGeometry args={[blockSize * 0.8, blockSize * 0.8, blockSize * 0.8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, trunkHeight + blockSize * 0.5, blockSize * 0.8]} castShadow>
        <boxGeometry args={[blockSize * 0.8, blockSize * 0.8, blockSize * 0.8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      <mesh position={[0, trunkHeight + blockSize * 0.5, -blockSize * 0.8]} castShadow>
        <boxGeometry args={[blockSize * 0.8, blockSize * 0.8, blockSize * 0.8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* 第二层（小一号） */}
      <mesh position={[0, trunkHeight + blockSize * 1.3, 0]} castShadow>
        <boxGeometry args={[blockSize * 0.7, blockSize * 0.7, blockSize * 0.7]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* 顶层（单个方块） */}
      <mesh position={[0, trunkHeight + blockSize * 1.8, 0]} castShadow>
        <boxGeometry args={[blockSize * 0.5, blockSize * 0.5, blockSize * 0.5]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* 成熟时显示方块果实（挂在树叶外侧表面） */}
      {showFruits && (
        <>
          {[
            // 底层树叶（4个侧面，在树叶表面）
            { x: 0.5, y: trunkHeight + blockSize * 0.3, z: 0 },  // 前面
            { x: -0.5, y: trunkHeight + blockSize * 0.3, z: 0 }, // 后面
            { x: 0, y: trunkHeight + blockSize * 0.3, z: 0.5 },  // 右面
            { x: 0, y: trunkHeight + blockSize * 0.3, z: -0.5 },  // 左面
            // 底层树叶拐角（4个角）
            { x: 0.35, y: trunkHeight + blockSize * 0.4, z: 0.35 },
            { x: -0.35, y: trunkHeight + blockSize * 0.4, z: 0.35 },
            { x: 0.35, y: trunkHeight + blockSize * 0.4, z: -0.35 },
            { x: -0.35, y: trunkHeight + blockSize * 0.4, z: -0.35 },
            // 第二层（4个侧面）
            { x: 0.4, y: trunkHeight + blockSize * 0.9, z: 0 },
            { x: -0.4, y: trunkHeight + blockSize * 0.9, z: 0 },
            { x: 0, y: trunkHeight + blockSize * 0.9, z: 0.4 },
            { x: 0, y: trunkHeight + blockSize * 0.9, z: -0.4 }
          ].map((pos, i) => (
            <mesh key={i} position={[pos.x, pos.y, pos.z]} castShadow>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
              <meshStandardMaterial
                color={config.color}
                emissive={config.color}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

/**
 * 树木组件
 * 根据生长阶段显示不同的模型
 */
function Tree({ treeType, plantTime, isMature, onClick }: {
  treeType: TreeType
  plantTime: number
  isMature: boolean
  onClick?: () => void
}) {
  const config = getTreeConfig(treeType)

  // 计算生长进度（0-1）
  const progress = Math.min((Date.now() - plantTime) / (config.growTime * 12 * 60 * 1000), 1)

  // 如果已经成熟，显示完整的大树并结果实
  if (isMature) {
    return <MatureTree treeType={treeType} showFruits={true} onClick={onClick} />
  }

  // 树苗阶段（前30%）：显示刚种植的小树苗
  if (progress < 0.3) {
    return <Sapling treeType={treeType} onClick={onClick} />
  }

  // 幼树阶段（30%-80%）：显示生长中的树
  if (progress < 0.8) {
    const youngProgress = (progress - 0.3) / 0.5 // 归一化到0-1
    return <YoungTree treeType={treeType} progress={youngProgress} onClick={onClick} />
  }

  // 接近成熟（80%-100%）：显示大树，但还没结果实
  return <MatureTree treeType={treeType} showFruits={false} onClick={onClick} />
}
