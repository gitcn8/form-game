import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { PointerLockControls } from '@react-three/drei'

// 材料颜色定义
const materialColors = {
  wood: '#8B4513',    // 棕色
  stone: '#808080',   // 灰色
  dirt: '#8B6914',    // 褐色
  grass: '#7CFC00',   // 草绿色
  coal_ore: '#2C2C2C', // 煤矿（黑色）
  iron_ore: '#A0522D', // 铁矿（棕红色）
  gold_ore: '#FFD700', // 金矿（金色）
  diamond_ore: '#00CED1', // 钻石（青蓝色）
  bedrock: '#1A1A1A'  // 基岩（深黑色）
}

// 方块类型定义
interface BlockType {
  id: string
  name: string
  color: string
  hardness: number  // 挖掘所需时间（秒）
  tool: 'pickaxe' | 'shovel' | 'axe' | 'hoe' | null
  drops: string | null
  minLevel: number  // 最小Y层
  maxLevel: number  // 最大Y层
}

const BLOCK_TYPES: Record<string, BlockType> = {
  GRASS: { id: 'grass', name: '草方块', color: materialColors.grass, hardness: 1, tool: 'shovel', drops: 'dirt', minLevel: 0, maxLevel: 0 },
  DIRT: { id: 'dirt', name: '泥土', color: materialColors.dirt, hardness: 1, tool: 'shovel', drops: 'dirt', minLevel: -1, maxLevel: -1 },
  STONE: { id: 'stone', name: '石头', color: materialColors.stone, hardness: 3, tool: 'pickaxe', drops: 'stone', minLevel: -2, maxLevel: -10 },
  COAL_ORE: { id: 'coal_ore', name: '煤矿', color: materialColors.coal_ore, hardness: 3, tool: 'pickaxe', drops: 'coal', minLevel: -4, maxLevel: -10 },
  IRON_ORE: { id: 'iron_ore', name: '铁矿', color: materialColors.iron_ore, hardness: 4, tool: 'pickaxe', drops: 'iron_ore', minLevel: -6, maxLevel: -10 },
  GOLD_ORE: { id: 'gold_ore', name: '金矿', color: materialColors.gold_ore, hardness: 5, tool: 'pickaxe', drops: 'gold_ore', minLevel: -8, maxLevel: -10 },
  DIAMOND_ORE: { id: 'diamond_ore', name: '钻石矿', color: materialColors.diamond_ore, hardness: 6, tool: 'pickaxe', drops: 'diamond', minLevel: -10, maxLevel: -10 },
  BEDROCK: { id: 'bedrock', name: '基岩', color: materialColors.bedrock, hardness: Infinity, tool: null, drops: null, minLevel: -10, maxLevel: -10 },
  WOOD: { id: 'wood', name: '木头', color: materialColors.wood, hardness: 2, tool: 'axe', drops: 'wood', minLevel: 0, maxLevel: 10 }
}

// 矿石生成概率
function generateBlockAt(x: number, y: number, z: number): string {
  // y=-10 是基岩层（不可破坏）
  if (y === -10) return 'BEDROCK'

  // 地面层是草地
  if (y === 0) return 'GRASS'

  // 浅层土壤
  if (y === -1) {
    return Math.random() < 0.1 ? 'STONE' : 'DIRT'
  }

  // 石头层
  if (y >= -3) {
    const rand = Math.random()
    if (rand < 0.05) return 'COAL_ORE'
    return 'STONE'
  }

  // 煤矿层
  if (y >= -5) {
    const rand = Math.random()
    if (rand < 0.15) return 'COAL_ORE'
    if (rand < 0.17) return 'IRON_ORE'
    return 'STONE'
  }

  // 铁矿层
  if (y >= -7) {
    const rand = Math.random()
    if (rand < 0.10) return 'COAL_ORE'
    if (rand < 0.25) return 'IRON_ORE'
    if (rand < 0.26) return 'GOLD_ORE'
    return 'STONE'
  }

  // 金矿层
  if (y >= -9) {
    const rand = Math.random()
    if (rand < 0.08) return 'COAL_ORE'
    if (rand < 0.20) return 'IRON_ORE'
    if (rand < 0.30) return 'GOLD_ORE'
    if (rand < 0.31) return 'DIAMOND_ORE'
    return 'STONE'
  }

  // 钻石层
  const rand = Math.random()
  if (rand < 0.05) return 'COAL_ORE'
  if (rand < 0.15) return 'IRON_ORE'
  if (rand < 0.22) return 'GOLD_ORE'
  if (rand < 0.28) return 'DIAMOND_ORE'
  return 'STONE'
}

// 世界方块组件（地下层、矿石等）
function WorldBlock({
  position,
  blockType,
  onRemove
}: {
  position: [number, number, number]
  blockType: string
  onRemove: (position: [number, number, number]) => void
}) {
  const [hovered, setHover] = useState(false)
  const blockData = BLOCK_TYPES[blockType]

  if (!blockData) return null

  return (
    <mesh
      position={position}
      onClick={() => onRemove(position)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={hovered ? 1.02 : 1}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.98, 0.98, 0.98]} />
      <meshStandardMaterial color={blockData.color} />
    </mesh>
  )
}

// 农场地块
function FarmPlot({
  position,
  state,
  onClick
}: {
  position: [number, number, number]
  state: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const getColor = () => {
    switch (state) {
      case 'empty': return '#7CFC00'      // 草绿色（未开垦）
      case 'tilled': return '#5C4033'     // 深棕色（已开垦）
      case 'watered': return '#3D2914'    // 深褐色（浇水后）
      case 'planted': return '#5C4033'    // 深棕色（已种植）
      case 'ready': return '#5C4033'      // 深棕色（可收获）
      default: return '#7CFC00'
    }
  }

  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.02 : 1}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.98, 0.2, 0.98]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>

      {/* 3D作物 */}
      {(state === 'planted' || state === 'ready') && (
        <Crop type="carrot" growthStage={state} />
      )}
    </group>
  )
}

// 3D作物组件
function Crop({ type, growthStage }: { type: 'carrot', growthStage: 'planted' | 'ready' }) {
  if (type === 'carrot') {
    return <CarrotCrop growthStage={growthStage} />
  }
  return null
}

// 单根胡萝卜组件
function SingleCarrot({ position, growthStage }: {
  position: [number, number, number]
  growthStage: 'planted' | 'ready'
}) {
  if (growthStage === 'planted') {
    // 小苗阶段：2片绿色小叶子
    return (
      <group position={position}>
        {/* 左叶 */}
        <mesh position={[-0.02, 0.08, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.015, 0.08, 0.06]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        {/* 右叶 */}
        <mesh position={[0.02, 0.08, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.015, 0.08, 0.06]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      </group>
    )
  }

  // 成熟阶段：橙色萝卜身 + 绿叶
  return (
    <group position={position}>
      {/* 萝卜身（圆锥体用圆柱模拟） */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.025, 0.2, 8]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* 顶部绿叶 */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.03, 0.06, 0.03]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* 左叶 */}
      <mesh position={[-0.04, 0.22, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.04]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* 右叶 */}
      <mesh position={[0.04, 0.22, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.04]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* 后叶 */}
      <mesh position={[0, 0.22, 0.04]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.04]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

// 胡萝卜作物（每块地4根）
function CarrotCrop({ growthStage }: { growthStage: 'planted' | 'ready' }) {
  if (growthStage === 'planted') {
    // 小苗阶段：4个小苗
    const positions: [number, number, number][] = [
      [-0.3, 0.1, -0.2],
      [0.3, 0.1, -0.2],
      [-0.3, 0.1, 0.1],
      [0.3, 0.1, 0.1]
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
    [-0.3, 0.1, -0.2],
    [0.3, 0.1, -0.2],
    [-0.3, 0.1, 0.1],
    [0.3, 0.1, 0.1]
  ]

  return (
    <group>
      {positions.map((pos, i) => (
        <SingleCarrot key={i} position={pos} growthStage={growthStage} />
      ))}
    </group>
  )
}

// 掉落物品组件
function DroppedItem({ item }: { item: { type: 'carrot', position: [number, number, number], count: number } }) {
  if (item.type === 'carrot') {
    return (
      <group position={item.position}>
        {/* 3D胡萝卜模型（简化版，单个代表堆叠） */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.025, 0.2, 8]} />
          <meshStandardMaterial color="#FF8C00" />
        </mesh>
        <mesh position={[0, 0.27, 0]} castShadow>
          <boxGeometry args={[0.03, 0.06, 0.03]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>

        {/* 数量标签 */}
        <mesh position={[0.1, 0.3, 0]}>
          <planeGeometry args={[0.2, 0.1]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      </group>
    )
  }
  return null
}

// 房子（方块风格）
function House({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 房子主体 */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>

      {/* 屋顶 */}
      <mesh position={[0, 3.75, 0]} castShadow>
        <boxGeometry args={[3.5, 1.5, 3.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* 门 */}
      <mesh position={[0, 0.8, 1.51]} castShadow>
        <boxGeometry args={[1, 1.6, 0.15]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* 窗户 */}
      <mesh position={[0.9, 1.8, 1.51]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.15]} />
        <meshStandardMaterial color="#ADD8E6" />
      </mesh>
      <mesh position={[-0.9, 1.8, 1.51]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.15]} />
        <meshStandardMaterial color="#ADD8E6" />
      </mesh>
    </group>
  )
}

// 已放置的方块组件
function PlacedBlock({
  block,
  onRemove
}: {
  block: { id: string, type: 'wood' | 'stone' | 'dirt', position: [number, number, number] }
  onRemove: (blockId: string) => void
}) {
  return (
    <mesh
      position={block.position}
      onClick={(e) => {
        e.stopPropagation()
        onRemove(block.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        (e.eventObject as any).userData.hovered = true
      }}
      onPointerOut={(e) => {
        (e.eventObject as any).userData.hovered = false
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.98, 0.98, 0.98]} />
      <meshStandardMaterial color={materialColors[block.type]} />
    </mesh>
  )
}

// 建造预览组件（半透明方块）
function BuildPreview({
  buildMode,
  selectedMaterial,
  placedBlocks,
  maxDistance = 5
}: {
  buildMode: boolean
  selectedMaterial: 'wood' | 'stone' | 'dirt'
  placedBlocks: Array<{ id: string, type: 'wood' | 'stone' | 'dirt', position: [number, number, number] }>
  maxDistance?: number
}) {
  const { camera } = useThree()
  const [previewPosition, setPreviewPosition] = useState<[number, number, number] | null>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const direction = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!buildMode) {
      setPreviewPosition(null)
      return
    }

    // 从相机向前发射射线
    raycaster.current.setFromCamera({ x: 0, y: 0 }, camera)

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

      // 对齐到网格
      const alignedX = Math.round(intersectPoint.x)
      const alignedY = Math.round(intersectPoint.y + 0.5)  // 在地面上方
      const alignedZ = Math.round(intersectPoint.z)

      // 检查该位置是否已有方块
      const posKey = `${alignedX},${alignedY},${alignedZ}`
      const hasBlock = placedBlocks.some(b => b.id === posKey)

      if (!hasBlock) {
        setPreviewPosition([alignedX, alignedY, alignedZ])
      } else {
        setPreviewPosition(null)
      }
    }
  })

  if (!buildMode || !previewPosition) return null

  return (
    <mesh position={previewPosition}>
      <boxGeometry args={[0.98, 0.98, 0.98]} />
      <meshStandardMaterial
        color={materialColors[selectedMaterial]}
        transparent
        opacity={0.5}
      />
    </mesh>
  )
}

// 树木（方块风格）
function Tree({
  position,
  onChop
}: {
  position: [number, number, number]
  onChop: () => void
}) {
  const [isChopped, setIsChopped] = useState(false)

  const handleClick = () => {
    if (isChopped) return

    setIsChopped(true)
    onChop()

    // 5秒后重生
    setTimeout(() => setIsChopped(false), 5000)
  }

  if (isChopped) return null

  return (
    <group position={position} onClick={handleClick}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[1.2, 1.6, 1.2]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  )
}

// 地面点击检测组件（射线检测）
function GroundClickHandler({ onGroundClick }: { onGroundClick: (position: [number, number, number]) => void }) {
  const { camera, gl } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // 计算鼠标位置（归一化到-1到1）
      mouse.current.x = 0  // 准心在屏幕中心
      mouse.current.y = 0

      // 从相机发射射线
      raycaster.current.setFromCamera(mouse.current, camera)

      // 创建地平面
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

      // 检测射线与地面的交点
      const intersectPoint = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(groundPlane, intersectPoint)

      if (intersectPoint) {
        // 限制在草地范围内（-50到50）
        const x = Math.max(-50, Math.min(50, intersectPoint.x))
        const z = Math.max(-50, Math.min(50, intersectPoint.z))

        onGroundClick([x, 0, z])
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, onGroundClick])

  return null
}

// 火柴盒人（方块风格）
function Player({
  position,
  rotation,
  visible,
  isMoving,
  colors
}: {
  position: [number, number, number]
  rotation: number
  visible: boolean
  isMoving: boolean
  colors: {
    head: string
    body: string
    limbs: string
  }
}) {
  const leftArmRotation = useRef(0)
  const rightArmRotation = useRef(0)
  const leftLegRotation = useRef(0)
  const rightLegRotation = useRef(0)

  // 更新四肢摆动动画
  useFrame(() => {
    if (isMoving) {
      const time = performance.now() / 1000
      const swingSpeed = 10  // 摆动速度
      const swingAmount = 0.5  // 摆动幅度（弧度）

      // 左臂和右腿同步（前后摆动）
      leftArmRotation.current = Math.sin(time * swingSpeed) * swingAmount
      rightLegRotation.current = Math.sin(time * swingSpeed) * swingAmount

      // 右臂和左腿同步（前后摆动，方向相反）
      rightArmRotation.current = Math.sin(time * swingSpeed + Math.PI) * swingAmount
      leftLegRotation.current = Math.sin(time * swingSpeed + Math.PI) * swingAmount
    } else {
      // 停止移动时，四肢恢复直立
      leftArmRotation.current = 0
      rightArmRotation.current = 0
      leftLegRotation.current = 0
      rightLegRotation.current = 0
    }
  })

  if (!visible) return null

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* 头部 */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={colors.head} />
      </mesh>

      {/* 身体 */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color={colors.body} />
      </mesh>

      {/* 左臂 */}
      <mesh position={[-0.35, 1.25, 0]} rotation={[leftArmRotation.current, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color={colors.limbs} />
      </mesh>

      {/* 右臂 */}
      <mesh position={[0.35, 1.25, 0]} rotation={[rightArmRotation.current, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshStandardMaterial color={colors.limbs} />
      </mesh>

      {/* 左腿 */}
      <mesh position={[-0.12, 0.6, 0]} rotation={[leftLegRotation.current, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={colors.limbs} />
      </mesh>

      {/* 右腿 */}
      <mesh position={[0.12, 0.6, 0]} rotation={[rightLegRotation.current, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={colors.limbs} />
      </mesh>
    </group>
  )
}

// 玩家控制器（第一人称/第三人称）
function FirstPersonController({
  onLockChange,
  cameraMode,
  onPlayerPositionChange,
  onPlayerRotationChange,
  onMovingChange
}: {
  onLockChange: (locked: boolean) => void
  cameraMode: 'first' | 'third'
  onPlayerPositionChange: (pos: [number, number, number]) => void
  onPlayerRotationChange: (rotation: number) => void
  onMovingChange: (isMoving: boolean) => void
}) {
  const { camera, gl } = useThree()
  const controls = useRef<any>(null)

  const moveForward = useRef(false)
  const moveBackward = useRef(false)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)

  const velocity = useRef([0, 0, 0])
  const direction = useRef([0, 0, 0])
  const playerPos = useRef([0, 0, 5])
  const playerRotation = useRef(0)

  // 脚步声
  const audioContext = useRef<AudioContext | null>(null)
  const lastStepTime = useRef(0)
  const stepInterval = 0.5 // 脚步间隔（秒）

  // 播放脚步声
  const playFootstep = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContext.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // 使用低频振荡器模拟脚步声
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 80 + Math.random() * 40 // 随机低频
    oscillator.type = 'triangle'

    // 音量包络（快速衰减）
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  useEffect(() => {
    if (!controls.current) return

    // 监听锁定状态
    const handleLock = () => onLockChange(true)
    const handleUnlock = () => onLockChange(false)

    controls.current.addEventListener('lock', handleLock)
    controls.current.addEventListener('unlock', handleUnlock)

    return () => {
      controls.current?.removeEventListener('lock', handleLock)
      controls.current?.removeEventListener('unlock', handleUnlock)
    }
  }, [onLockChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = true; break
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = true; break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = true; break
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = true; break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = false; break
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = false; break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = false; break
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = false; break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!controls.current) return

    const speed = 0.15
    const [vx, vy, vz] = velocity.current
    const [dx, dy, dz] = direction.current
    const [px, py, pz] = playerPos.current

    // 获取相机旋转角度（用于玩家朝向）
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion)
    playerRotation.current = euler.y

    // 阻尼效果
    velocity.current = [
      vx - vx * 0.1,
      vy - vy * 0.1,
      vz - vz * 0.1
    ]

    direction.current = [
      dx - dx * 0.1,
      dy - dy * 0.1,
      dz - dz * 0.1
    ]

    // 移动输入
    if (moveForward.current) velocity.current[2] -= speed * 0.1
    if (moveBackward.current) velocity.current[2] += speed * 0.1
    if (moveLeft.current) velocity.current[0] -= speed * 0.1
    if (moveRight.current) velocity.current[0] += speed * 0.1

    // 应用移动
    const newPx = px + velocity.current[0]
    const newPz = pz + velocity.current[2]

    // 边界限制
    playerPos.current = [
      Math.max(-25, Math.min(25, newPx)),
      0,
      Math.max(-25, Math.min(25, newPz))
    ]

    // 通知父组件玩家位置和旋转
    onPlayerPositionChange([...playerPos.current] as [number, number, number])
    onPlayerRotationChange(playerRotation.current)

    // 检测是否在移动
    const isMoving = Math.abs(velocity.current[0]) > 0.001 || Math.abs(velocity.current[2]) > 0.001

    // 通知父组件玩家是否在移动
    onMovingChange(isMoving)

    // 根据视角模式设置相机位置
    if (cameraMode === 'first') {
      // 第一人称：眼睛高度
      const time = performance.now() / 1000
      const bobSpeed = 10
      const bobAmount = 0.05

      let cameraY = 1.6
      if (isMoving) {
        cameraY = 1.6 + Math.sin(time * bobSpeed) * bobAmount
      }

      camera.position.set(
        playerPos.current[0],
        cameraY,
        playerPos.current[2]
      )

      // 脚步声 - 根据晃动节奏播放
      if (isMoving) {
        const phase = Math.sin(time * bobSpeed)
        const timeSinceLastStep = time - lastStepTime.current

        if (phase < -0.9 && timeSinceLastStep > stepInterval) {
          playFootstep()
          lastStepTime.current = time
        }
      }
    } else {
      // 第三人称：相机在玩家身后上方
      const thirdPersonDistance = 6
      const thirdPersonHeight = 4

      // 计算相机位置（在玩家身后）
      const offsetX = Math.sin(playerRotation.current) * thirdPersonDistance
      const offsetZ = Math.cos(playerRotation.current) * thirdPersonDistance

      camera.position.set(
        playerPos.current[0] - offsetX,
        playerPos.current[1] + thirdPersonHeight,
        playerPos.current[2] - offsetZ
      )
    }
  })

  return (
    <PointerLockControls
      ref={controls}
      args={[camera, gl.domElement]}
    />
  )
}

// 主场景
function FarmScene3D() {
  // 动态地块数据：用Map存储，key为位置字符串 "x,z"，value为地块状态
  const [plots, setPlots] = useState<Map<string, { state: string, position: [number, number, number] }>>(new Map())
  const [currentTool, setCurrentTool] = useState('hoe')
  const [message, setMessage] = useState('点击开始 | WASD移动 | 鼠标控制视角 | 左键点击草地开垦')
  const [isLocked, setIsLocked] = useState(false)

  // 物品系统
  const [droppedItems, setDroppedItems] = useState<Array<{ id: string, type: 'carrot', position: [number, number, number], count: number }>>([])
  const [inventory, setInventory] = useState<{ carrot: number, wood: number, stone: number, dirt: number }>({
    carrot: 0,
    wood: 0,  // 初始木材已用于建房
    stone: 0,
    dirt: 0
  })
  const [gold, setGold] = useState(50)  // 初始金币
  const [showInventory, setShowInventory] = useState(false)
  const [showShop, setShowShop] = useState(false)  // 商店面板

  // 建造系统 - 初始包含简陋房屋
  const [buildMode, setBuildMode] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<'wood' | 'stone' | 'dirt'>('wood')
  const [placedBlocks, setPlacedBlocks] = useState<Array<{ id: string, type: 'wood' | 'stone' | 'dirt', position: [number, number, number] }>>([
    // 地板（3x3）
    { id: 'house_floor_0', type: 'wood', position: [-1, 0, 4] },
    { id: 'house_floor_1', type: 'wood', position: [0, 0, 4] },
    { id: 'house_floor_2', type: 'wood', position: [1, 0, 4] },
    { id: 'house_floor_3', type: 'wood', position: [-1, 0, 5] },
    { id: 'house_floor_4', type: 'wood', position: [0, 0, 5] },
    { id: 'house_floor_5', type: 'wood', position: [1, 0, 5] },
    { id: 'house_floor_6', type: 'wood', position: [-1, 0, 6] },
    { id: 'house_floor_7', type: 'wood', position: [0, 0, 6] },
    { id: 'house_floor_8', type: 'wood', position: [1, 0, 6] },
    // 墙壁（2格高，留门）
    { id: 'house_wall_0', type: 'wood', position: [-1, 1, 4] },
    { id: 'house_wall_1', type: 'wood', position: [1, 1, 4] },
    { id: 'house_wall_2', type: 'wood', position: [-1, 1, 5] },
    // [0, 1, 5] 是门的位置，空着
    { id: 'house_wall_4', type: 'wood', position: [1, 1, 5] },
    { id: 'house_wall_5', type: 'wood', position: [-1, 1, 6] },
    { id: 'house_wall_6', type: 'wood', position: [0, 1, 6] },
    { id: 'house_wall_7', type: 'wood', position: [1, 1, 6] },
    { id: 'house_wall_8', type: 'wood', position: [-1, 2, 4] },
    { id: 'house_wall_9', type: 'wood', position: [1, 2, 4] },
    { id: 'house_wall_10', type: 'wood', position: [-1, 2, 5] },
    { id: 'house_wall_11', type: 'wood', position: [1, 2, 5] },
    { id: 'house_wall_12', type: 'wood', position: [-1, 2, 6] },
    { id: 'house_wall_13', type: 'wood', position: [0, 2, 6] },
    { id: 'house_wall_14', type: 'wood', position: [1, 2, 6] },
    // 屋顶（3x3）
    { id: 'house_roof_0', type: 'wood', position: [-1, 3, 4] },
    { id: 'house_roof_1', type: 'wood', position: [0, 3, 4] },
    { id: 'house_roof_2', type: 'wood', position: [1, 3, 4] },
    { id: 'house_roof_3', type: 'wood', position: [-1, 3, 5] },
    { id: 'house_roof_4', type: 'wood', position: [0, 3, 5] },
    { id: 'house_roof_5', type: 'wood', position: [1, 3, 5] },
    { id: 'house_roof_6', type: 'wood', position: [-1, 3, 6] },
    { id: 'house_roof_7', type: 'wood', position: [0, 3, 6] },
    { id: 'house_roof_8', type: 'wood', position: [1, 3, 6] }
  ])

  // 世界方块系统（地下层、矿石）
  const [worldBlocks, setWorldBlocks] = useState<Map<string, { type: string, position: [number, number, number] }>>(new Map())

  // 视角和玩家相关状态
  const [cameraMode, setCameraMode] = useState<'first' | 'third'>('first')
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 5])
  const [playerRotation, setPlayerRotation] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [showColorPanel, setShowColorPanel] = useState(false)
  const [showPauseMenu, setShowPauseMenu] = useState(true) // 默认显示引导面板

  // 玩家颜色配置
  const [playerColors, setPlayerColors] = useState({
    head: '#ffcc99',
    body: '#4a90d9',
    limbs: '#2d5a8a'
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 工具切换快捷键 (1-4)
      if (e.code === 'Digit1') {
        setCurrentTool('hoe')
        setMessage('🪓 切换到：锄头')
      } else if (e.code === 'Digit2') {
        setCurrentTool('water')
        setMessage('💧 切换到：水壶')
      } else if (e.code === 'Digit3') {
        setCurrentTool('seed')
        setMessage('🌱 切换到：种子')
      } else if (e.code === 'Digit4') {
        setCurrentTool('harvest')
        setMessage('🌾 切换到：镰刀')
      } else if (e.code === 'KeyF') {
        // 切换建造模式
        setBuildMode(prev => !prev)
        setMessage(prev ? '🔨 退出建造模式' : '🔨 进入建造模式')
      } else if (e.code === 'Digit5') {
        // 选择木头
        setSelectedMaterial('wood')
        setMessage('🪵 切换材料：木头')
      } else if (e.code === 'Digit6') {
        // 选择石头
        setSelectedMaterial('stone')
        setMessage('🪨 切换材料：石头')
      } else if (e.code === 'Digit7') {
        // 选择泥土
        setSelectedMaterial('dirt')
        setMessage('🟫 切换材料：泥土')
      } else if (e.code === 'KeyV') {
        // 视角切换
        setCameraMode(prev => {
          const newMode = prev === 'first' ? 'third' : 'first'
          setMessage(newMode === 'first' ? '📷 切换到第一人称' : '📷 切换到第三人称')
          return newMode
        })
      } else if (e.code === 'KeyC') {
        // 打开/关闭颜色设置面板
        setShowColorPanel(prev => !prev)
      } else if (e.code === 'KeyB') {
        // 打开/关闭背包
        setShowInventory(prev => !prev)
      } else if (e.code === 'KeyU') {
        // 打开/关闭商店
        setShowShop(prev => !prev)
      } else if (e.code === 'Escape') {
        // ESC 键：关闭面板并显示暂停菜单
        if (showColorPanel) {
          setShowColorPanel(false)
        } else if (showInventory) {
          setShowInventory(false)
        } else if (showShop) {
          setShowShop(false)
        } else {
          setShowPauseMenu(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showColorPanel, showInventory, playerPosition, droppedItems])

  // 监听颜色面板状态变化，自动解锁/锁定指针
  useEffect(() => {
    if (showColorPanel) {
      // 打开面板时解锁指针
      document.exitPointerLock()
    }
  }, [showColorPanel])

  // 监听背包面板状态变化，自动解锁/锁定指针
  useEffect(() => {
    if (showInventory) {
      document.exitPointerLock()
    }
  }, [showInventory])

  // 监听商店面板状态变化，自动解锁/锁定指针
  useEffect(() => {
    if (showShop) {
      document.exitPointerLock()
    }
  }, [showShop])

  // 自动拾取物品（检测玩家与掉落物品的距离）
  useEffect(() => {
    const pickupDistance = 1.5  // 自动拾取距离

    droppedItems.forEach((item) => {
      const dx = item.position[0] - playerPosition[0]
      const dz = item.position[2] - playerPosition[2]
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance < pickupDistance) {
        // 自动捡起物品
        setInventory(prev => ({
          ...prev,
          carrot: prev.carrot + item.count
        }))
        setMessage(`✅ 自动捡起了 ${item.count} 根胡萝卜`)

        // 从掉落列表中移除
        setDroppedItems(prev => prev.filter(i => i.id !== item.id))
      }
    })
  }, [playerPosition, droppedItems])

  // 出售物品
  const sellItem = (type: 'carrot', count: number) => {
    const prices = { carrot: 10 }

    if (inventory[type] >= count) {
      setInventory(prev => ({
        ...prev,
        [type]: prev[type] - count
      }))
      setGold(prev => prev + count * prices[type])
      setMessage(`💰 出售了 ${count} 根胡萝卜，获得 ${count * prices[type]} 金币`)
    }
  }

  // 丢掉物品
  const dropItem = (type: 'carrot', count: number) => {
    if (inventory[type] >= count) {
      setInventory(prev => ({
        ...prev,
        [type]: prev[type] - count
      }))

      // 在玩家位置生成掉落物
      const newItem = {
        id: Date.now().toString(),
        type: 'carrot' as const,
        position: [playerPosition[0], 0, playerPosition[2]] as [number, number, number],
        count: count
      }

      setDroppedItems(prev => [...prev, newItem])
      setMessage(`📤 丢掉了 ${count} 根胡萝卜`)
    }
  }

  // 树木砍伐处理
  const handleTreeChop = () => {
    const woodAmount = Math.floor(Math.random() * 3) + 3  // 3-5个木材
    setInventory(prev => ({ ...prev, wood: prev.wood + woodAmount }))
    setMessage(`🪓 砍伐成功！获得 ${woodAmount} 个木材`)
  }

  // 放置方块
  const handlePlaceBlock = (position: [number, number, number]) => {
    const [x, y, z] = position

    // 检查材料数量
    if (inventory[selectedMaterial] <= 0) {
      setMessage('❌ 材料不足！')
      return
    }

    // 对齐到网格
    const alignedX = Math.round(x)
    const alignedY = Math.max(0, Math.round(y))  // 至少在地面上
    const alignedZ = Math.round(z)

    // 检查该位置是否已有方块
    const posKey = `${alignedX},${alignedY},${alignedZ}`
    if (placedBlocks.some(b => b.id === posKey)) {
      setMessage('❌ 该位置已有方块！')
      return
    }

    // 扣除材料
    setInventory(prev => ({ ...prev, [selectedMaterial]: prev[selectedMaterial] - 1 }))

    // 添加方块
    const newBlock = {
      id: posKey,
      type: selectedMaterial,
      position: [alignedX, alignedY, alignedZ] as [number, number, number]
    }

    setPlacedBlocks(prev => [...prev, newBlock])
    setMessage(`✅ 放置了 ${selectedMaterial} 方块`)
  }

  // 移除方块
  const handleRemoveBlock = (blockId: string) => {
    const block = placedBlocks.find(b => b.id === blockId)
    if (!block) return

    // 检查是否是房屋的一部分（保护初始房屋）
    if (block.id.startsWith('house_')) {
      setMessage('⚠️ 不能拆除初始房屋！')
      return
    }

    // 返还材料
    setInventory(prev => ({ ...prev, [block.type]: prev[block.type] + 1 }))

    // 移除方块
    setPlacedBlocks(prev => prev.filter(b => b.id !== blockId))
    setMessage(`✅ 拆除了 ${block.type} 方块`)
  }

  // 购买材料
  const buyMaterial = (type: 'wood' | 'stone' | 'dirt', count: number) => {
    const prices = { wood: 5, stone: 8, dirt: 3 }
    const cost = count * prices[type]

    if (gold < cost) {
      setMessage('❌ 金币不足！')
      return
    }

    setGold(prev => prev - cost)
    setInventory(prev => ({ ...prev, [type]: prev[type] + count }))
    setMessage(`✅ 购买了 ${count} 个 ${type}，花费 ${cost} 金币`)
  }

  // 处理地块点击（使用射线检测）
  const handlePlotClick = (clickPosition: [number, number, number]) => {
    const [x, y, z] = clickPosition

    // 如果在建造模式，放置方块
    if (buildMode) {
      handlePlaceBlock([x, y, z])
      return
    }

    // 将位置对齐到网格（1x1x1单位，简化计算）
    const alignedX = Math.round(x)
    const alignedZ = Math.round(z)

    // 创建位置key
    const posKey = `${alignedX},${alignedZ}`

    const newPlots = new Map(plots)
    const plot = newPlots.get(posKey)

    switch (currentTool) {
      case 'hoe':
        if (!plot) {
          // 创建新地块
          newPlots.set(posKey, {
            state: 'tilled',
            position: [alignedX, -0.1, alignedZ]  // 凹陷：y = -0.1
          })
          setMessage('✅ 土地已开垦')
        } else if (plot.state === 'empty') {
          plot.state = 'tilled'
          plot.position[1] = -0.1  // 凹陷
          newPlots.set(posKey, plot)
          setMessage('✅ 土地已开垦')
        }
        break
      case 'water':
        if (plot && (plot.state === 'tilled' || plot.state === 'planted')) {
          plot.state = plot.state === 'tilled' ? 'watered' : 'planted'
          newPlots.set(posKey, plot)
          setMessage('✅ 土地已浇水')
        }
        break
      case 'seed':
        if (plot && (plot.state === 'tilled' || plot.state === 'watered')) {
          plot.state = 'planted'
          newPlots.set(posKey, plot)
          setMessage('✅ 已播种，10秒后成熟')
          setTimeout(() => {
            setPlots((prev) => {
              const updated = new Map(prev)
              const p = updated.get(posKey)
              if (p && p.state === 'planted') {
                p.state = 'ready'
                updated.set(posKey, p)
              }
              return updated
            })
            setMessage('🎉 作物成熟了！快来收获！')
          }, 10000)
        }
        break
      case 'harvest':
        if (plot) {
          if (plot.state === 'ready') {
            // 收获：生成掉落物（每块地4根胡萝卜）
            const droppedItem = {
              id: Date.now().toString(),
              type: 'carrot' as const,
              position: [plot.position[0], 0, plot.position[2]] as [number, number, number],
              count: 4  // 每块地4根胡萝卜
            }

            setDroppedItems(prev => [...prev, droppedItem])
            plot.state = 'tilled'
            newPlots.set(posKey, plot)
            setMessage('🥕 收获成功！4根胡萝卜掉在地上')
          } else if (plot.state === 'planted') {
            setMessage('⚠️ 作物还没成熟')
          }
        }
        break
    }
    setPlots(newPlots)
  }

  // 树木位置
  const treePositions: [number, number, number][] = [
    [-15, 0, 10], [-18, 0, 8], [-20, 0, 5], [-15, 0, -10],
    [18, 0, 12], [20, 0, 8], [22, 0, -5], [18, 0, -12],
    [-5, 0, 15], [5, 0, 15], [0, 0, 18], [-8, 0, -15], [8, 0, -15]
  ]

  const toolEmoji: any = {
    hoe: '🪓',
    water: '💧',
    seed: '🌱',
    harvest: '🌾'
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#87CEEB',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 75 }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <Sky distance={450000} sunPosition={[100, 50, 100]} inclination={0.6} azimuth={0.25} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* 射线检测系统：检测鼠标点击位置 */}
        <GroundClickHandler onGroundClick={handlePlotClick} />

        {/* 玩家控制器 */}
        <FirstPersonController
          onLockChange={setIsLocked}
          cameraMode={cameraMode}
          onPlayerPositionChange={setPlayerPosition}
          onPlayerRotationChange={setPlayerRotation}
          onMovingChange={setIsMoving}
        />

        {/* 玩家模型（第三人称时显示） */}
        <Player
          position={playerPosition}
          rotation={playerRotation}
          visible={cameraMode === 'third'}
          isMoving={isMoving}
          colors={playerColors}
        />

        {/* 建造预览 */}
        <BuildPreview
          buildMode={buildMode}
          selectedMaterial={selectedMaterial}
          placedBlocks={placedBlocks}
        />

        {/* 已放置的方块 */}
        {placedBlocks.map((block) => (
          <PlacedBlock
            key={block.id}
            block={block}
            onRemove={handleRemoveBlock}
          />
        ))}

        {/* 大型草地地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#7CFC00" />
        </mesh>

        {/* 路径 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9, -0.04, 0]} receiveShadow>
          <planeGeometry args={[8, 3]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9, -0.04, 0]} receiveShadow>
          <planeGeometry args={[8, 3]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>

        {/* 动态农场地块 */}
        {Array.from(plots.entries()).map(([posKey, plot]) => (
          <FarmPlot
            key={posKey}
            position={plot.position}
            state={plot.state}
            onClick={() => {}}
          />
        ))}

        {/* 掉落物品 */}
        {droppedItems.map((item) => (
          <DroppedItem key={item.id} item={item} />
        ))}

        {/* 房子 */}
        <House position={[13, 0, 0]} />
        <House position={[-13, 0, 0]} />
        <House position={[13, 0, -13]} />

        {/* 树木 */}
        {treePositions.map((pos, i) => (
          <Tree key={`tree-${i}`} position={pos} onChop={handleTreeChop} />
        ))}
      </Canvas>

      {/* 点击开始屏幕/暂停菜单 */}
      {!isLocked && showPauseMenu && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={() => {
            setShowPauseMenu(false)
            const canvas = document.querySelector('canvas')
            if (canvas) canvas.click()
          }}
        >
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🌾 我的世界农场</h1>
          <p style={{ fontSize: '24px', marginBottom: '30px' }}>点击屏幕开始游戏</p>
          <div style={{ fontSize: '18px', textAlign: 'center', lineHeight: '1.8' }}>
            <div>🎮 WASD / 方向键 - 移动</div>
            <div>🖱️ 鼠标 - 视角</div>
            <div>🔢 1-4 - 切换工具</div>
            <div>📷 V键 - 切换视角</div>
            <div>🎨 C键 - 颜色设置</div>
            <div>🎒 B键 - 背包</div>
            <div>🛒 U键 - 商店</div>
            <div>🔨 F键 - 建造模式 (5-7选择材料)</div>
            <div>👆 左键 - 操作/放置</div>
            <div>🪓 点击树木 - 砍伐获得木材</div>
            <div>⌨️ ESC - 暂停</div>
          </div>
        </div>
      )}

      {/* 准心 */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 100
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%'
          }} />
        </div>
      )}

      {/* HUD - 顶部信息 */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          fontSize: '18px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 100
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {message}
          </div>
          <div>当前工具: {toolEmoji[currentTool]}</div>
          {buildMode && (
            <div style={{ marginTop: '8px', color: '#FFD700', fontWeight: 'bold' }}>
              🔨 建造模式: {selectedMaterial === 'wood' ? '🪵' : selectedMaterial === 'stone' ? '🪨' : '🟫'} {selectedMaterial}
            </div>
          )}
        </div>
      )}

      {/* HUD - 工具栏 */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 100
        }}>
          {(['hoe', 'water', 'seed', 'harvest'] as const).map((tool, index) => (
            <button
              key={tool}
              onClick={() => setCurrentTool(tool)}
              style={{
                width: '70px',
                height: '70px',
                background: currentTool === tool
                  ? 'rgba(255, 215, 0, 0.9)'
                  : 'rgba(0, 0, 0, 0.6)',
                border: currentTool === tool ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '28px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: currentTool === tool ? 'bold' : 'normal'
              }}
            >
              <div style={{ fontSize: '24px' }}>{toolEmoji[tool]}</div>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>按 {index + 1}</div>
            </button>
          ))}
        </div>
      )}

      {/* 颜色设置面板 */}
      {showColorPanel && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '30px',
            borderRadius: '16px',
            color: 'white',
            zIndex: 200,
            minWidth: '300px',
            border: '3px solid rgba(255, 215, 0, 0.6)'
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#FFD700' }}>🎨 角色颜色设置</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label>头部颜色：</label>
              <input
                type="color"
                value={playerColors.head}
                onChange={(e) => setPlayerColors({ ...playerColors, head: e.target.value })}
                style={{ width: '60px', height: '40px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label>身体颜色：</label>
              <input
                type="color"
                value={playerColors.body}
                onChange={(e) => setPlayerColors({ ...playerColors, body: e.target.value })}
                style={{ width: '60px', height: '40px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label>四肢颜色：</label>
              <input
                type="color"
                value={playerColors.limbs}
                onChange={(e) => setPlayerColors({ ...playerColors, limbs: e.target.value })}
                style={{ width: '60px', height: '40px', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowColorPanel(false)
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 215, 0, 0.9)',
                border: '2px solid white',
                borderRadius: '8px',
                color: '#8B4513',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              关闭
            </button>
          </div>

          <div style={{ marginTop: '15px', fontSize: '14px', color: '#90EE90', textAlign: 'center' }}>
            💡 提示：按 V 键切换到第三人称查看效果
          </div>
        </div>
      )}

      {/* 视角指示器 */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '10px 20px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '14px',
          zIndex: 100,
          border: '2px solid rgba(255, 215, 0, 0.4)'
        }}>
          <div>📷 当前视角: {cameraMode === 'first' ? '第一人称' : '第三人称'}</div>
          <div style={{ fontSize: '12px', marginTop: '5px', color: '#90EE90' }}>
            按 V 切换 | 按 C 设置颜色 | 按 B 背包 | 按 U 商店 | 按 F 建造模式
          </div>
        </div>
      )}

      {/* 背包界面 */}
      {showInventory && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(139, 69, 19, 0.95)',
            padding: '30px',
            borderRadius: '16px',
            color: 'white',
            zIndex: 200,
            minWidth: '400px',
            border: '3px solid rgba(255, 215, 0, 0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', fontSize: '28px', color: '#FFD700', textAlign: 'center' }}>🎒 背包</h3>

          {/* 金币显示 */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.2)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '2px solid rgba(255, 215, 0, 0.4)'
          }}>
            <div style={{ fontSize: '24px', color: '#FFD700', fontWeight: 'bold' }}>
              💰 金币: {gold}
            </div>
          </div>

          {/* 物品列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* 胡萝卜 */}
            {inventory.carrot > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '20px' }}>
                    🥕 胡萝卜 x {inventory.carrot}
                  </div>
                  <div style={{ fontSize: '16px', color: '#90EE90' }}>
                    单价: 10 金币
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => sellItem('carrot', 1)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                      border: '2px solid #2d6a2d',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    出售1个
                  </button>
                  <button
                    onClick={() => sellItem('carrot', inventory.carrot)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                      border: '2px solid #2d6a2d',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    全部出售
                  </button>
                  <button
                    onClick={() => dropItem('carrot', 1)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'linear-gradient(to bottom, #f44336, #da190b)',
                      border: '2px solid #a9190b',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    丢掉1个
                  </button>
                </div>
              </div>
            )}

            {/* 空背包提示 */}
            {inventory.carrot === 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '16px',
                color: '#999'
              }}>
                背包是空的<br/>
                <span style={{ fontSize: '14px' }}>走近掉落物品可自动拾取</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setShowInventory(false)}
              style={{
                padding: '10px 30px',
                background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                color: '#8B4513',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              关闭 (B)
            </button>
          </div>

          <div style={{ marginTop: '15px', fontSize: '12px', color: '#90EE90', textAlign: 'center' }}>
            💡 提示：走近物品自动拾取 | 出售获得金币
          </div>
        </div>
      )}

      {/* 商店界面 */}
      {showShop && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(139, 69, 19, 0.95)',
            padding: '30px',
            borderRadius: '16px',
            color: 'white',
            zIndex: 200,
            minWidth: '450px',
            maxWidth: '500px',
            border: '3px solid rgba(255, 215, 0, 0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', fontSize: '28px', color: '#FFD700', textAlign: 'center' }}>🛒 商店</h3>

          {/* 金币显示 */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.2)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '2px solid rgba(255, 215, 0, 0.4)'
          }}>
            <div style={{ fontSize: '24px', color: '#FFD700', fontWeight: 'bold' }}>
              💰 我的金币: {gold}
            </div>
          </div>

          {/* 材料列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
            {/* 木头 */}
            <div style={{
              background: 'rgba(139, 69, 19, 0.3)',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid rgba(139, 69, 19, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '20px' }}>
                  🪵 木头
                </div>
                <div style={{ fontSize: '16px', color: '#FFD700' }}>
                  5 金币/个 | 拥有: {inventory.wood}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => buyMaterial('wood', 1)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                    border: '2px solid #2d6a2d',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  买1个 (5金币)
                </button>
                <button
                  onClick={() => buyMaterial('wood', 10)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                    border: '2px solid #2d6a2d',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  买10个 (50金币)
                </button>
              </div>
            </div>

            {/* 石头 */}
            <div style={{
              background: 'rgba(128, 128, 128, 0.3)',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid rgba(128, 128, 128, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '20px' }}>
                  🪨 石头
                </div>
                <div style={{ fontSize: '16px', color: '#FFD700' }}>
                  8 金币/个 | 拥有: {inventory.stone}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => buyMaterial('stone', 1)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                    border: '2px solid #2d6a2d',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  买1个 (8金币)
                </button>
                <button
                  onClick={() => buyMaterial('stone', 10)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                    border: '2px solid #2d6a2d',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  买10个 (80金币)
                </button>
              </div>
            </div>

            {/* 泥土 */}
            <div style={{
              background: 'rgba(139, 105, 20, 0.3)',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid rgba(139, 105, 20, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '20px' }}>
                  🟫 泥土
                </div>
                <div style={{ fontSize: '16px', color: '#FFD700' }}>
                  3 金币/个 | 拥有: {inventory.dirt}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => buyMaterial('dirt', 1)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                    border: '2px solid #2d6a2d',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  买1个 (3金币)
                </button>
                <button
                  onClick={() => buyMaterial('dirt', 10)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                    border: '2px solid #2d6a2d',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  买10个 (30金币)
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setShowShop(false)}
              style={{
                padding: '10px 30px',
                background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                color: '#8B4513',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              关闭 (U)
            </button>
          </div>

          <div style={{ marginTop: '15px', fontSize: '12px', color: '#90EE90', textAlign: 'center' }}>
            💡 提示：按F进入建造模式放置方块 | 砍树获得木材
          </div>
        </div>
      )}
    </div>
  )
}

export default function Test3DGame() {
  return <FarmScene3D />
}
