import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { PlacedAnimal as PlacedAnimalType, ANIMAL_CONFIGS, getGrowthProgress } from './AnimalConfig'

interface PlacedAnimalProps {
  animal: PlacedAnimalType
  onRightClick?: (animal: PlacedAnimalType) => void
  onClick?: (animal: PlacedAnimalType) => void  // 新增：左键点击（喂养）
  onUpdate?: (animal: PlacedAnimalType) => void  // 用于更新动物状态
}

/**
 * 火柴盒动物组件
 * 类似玩家的火柴盒人设计：头 + 身体 + 四肢
 * 根据动物类型调整比例和特征
 * 支持自主移动和多种动画效果
 */
export function PlacedAnimal({ animal, onRightClick, onClick, onUpdate }: PlacedAnimalProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<[number, number, number]>([...animal.position])
  const [currentRotation, setCurrentRotation] = useState(animal.rotation)

  const config = ANIMAL_CONFIGS[animal.animalId]
  const stageConfig = config.growthStages[animal.growthStage]
  const growthProgress = getGrowthProgress(animal)

  // 身体尺寸（配置值已经是真实尺寸，应用较小的渲染系数）
  const bodyWidth = stageConfig.size[0] * 0.8
  const bodyHeight = stageConfig.size[1] * 0.7
  const bodyDepth = stageConfig.size[2] * 0.8

  // 头部尺寸
  const headSize = stageConfig.size[0] * 0.35

  // 腿部尺寸
  const legWidth = stageConfig.size[0] * 0.1
  const legHeight = stageConfig.size[1] * 0.35
  const legDepth = stageConfig.size[2] * 0.1

  // 计算动物总高度（从脚底到头顶）
  const totalHeight = legHeight + bodyHeight + headSize

  // 根据生长阶段调整移动速度（幼崽最慢）
  const speedMultiplier = useMemo(() => {
    if (animal.growthStage === 'baby') return 0.5
    if (animal.growthStage === 'growing') return 0.75
    return 1.0
  }, [animal.growthStage])

  // 动物颜色配置
  const getAnimalColors = () => {
    const colors: Record<string, { body: string; head: string; legs: string }> = {
      chicken: {
        body: animal.growthStage === 'baby' ? '#FFF59D' : '#FF9800',
        head: animal.growthStage === 'baby' ? '#FFEB3B' : '#FF6F00',
        legs: '#FF9800'
      },
      pig: {
        body: animal.growthStage === 'baby' ? '#FFCCBC' : '#FF8A65',
        head: animal.growthStage === 'baby' ? '#FFAB91' : '#FF5722',
        legs: '#FF8A65'
      },
      cow: {
        body: animal.growthStage === 'baby' ? '#D7CCC8' : '#8D6E63',
        head: animal.growthStage === 'baby' ? '#FFFFFF' : '#5D4037',
        legs: '#8D6E63'
      },
      sheep: {
        body: animal.growthStage === 'baby' ? '#F5F5F5' : '#E0E0E0',
        head: animal.growthStage === 'baby' ? '#FFFFFF' : '#BDBDBD',
        legs: '#9E9E9E'
      }
    }
    return colors[animal.animalId] || { body: '#FFFFFF', head: '#FFFFFF', legs: '#CCCCCC' }
  }

  const colors = getAnimalColors()

  // 同步位置和旋转状态
  useEffect(() => {
    setCurrentPosition([...animal.position])
    setCurrentRotation(animal.rotation)
  }, [animal.position, animal.rotation])

  // 平滑移动和动画
  useFrame((state, delta) => {
    if (!groupRef.current) return

    const currentTime = Date.now()

    // 检查是否在休息期
    const isResting = animal.restUntil && currentTime < animal.restUntil

    // 移动逻辑
    if (animal.isMoving && animal.targetPosition && !isResting) {
      const target = animal.targetPosition
      const speed = config.movement.speed * speedMultiplier

      // 计算到目标的距离和方向
      const dx = target[0] - currentPosition[0]
      const dz = target[2] - currentPosition[2]
      const distance = Math.sqrt(dx * dx + dz * dz)

      // 如果距离很小，到达目标
      if (distance < 0.1) {
        setCurrentPosition([...target])
        // 通知父组件更新状态（到达目标）
        if (onUpdate) {
          onUpdate({
            ...animal,
            position: [...target],
            isMoving: false,
            targetPosition: undefined
          })
        }
      } else {
        // 平滑移动到目标位置
        const moveDist = speed * delta
        const ratio = Math.min(moveDist / distance, 1)

        const newX = currentPosition[0] + dx * ratio
        const newZ = currentPosition[2] + dz * ratio

        setCurrentPosition([newX, currentPosition[1], newZ])

        // 计算目标旋转角度（面向移动方向）
        const targetRotation = Math.atan2(dx, dz) * (180 / Math.PI)
        // 平滑旋转
        let rotationDiff = targetRotation - currentRotation
        // 标准化到 -180 到 180
        while (rotationDiff > 180) rotationDiff -= 360
        while (rotationDiff < -180) rotationDiff += 360
        const newRotation = currentRotation + rotationDiff * 0.1
        setCurrentRotation(newRotation)
      }
    }

    // 应用位置和旋转
    groupRef.current.position.set(currentPosition[0], currentPosition[1], currentPosition[2])
    groupRef.current.rotation.y = currentRotation * (Math.PI / 180)

    // 动画效果
    const isMoving = animal.isMoving && !isResting

    // 呼吸动画（身体轻微起伏）
    const breathOffset = Math.sin(state.clock.elapsedTime * 2) * 0.02
    groupRef.current.position.y += breathOffset

    // 行走动画（身体起伏）
    let walkBob = 0
    if (isMoving) {
      walkBob = Math.sin(state.clock.elapsedTime * 10) * 0.03
      groupRef.current.position.y += walkBob
    }

    // 幼崽的跳跃动画（优先级高）
    if (animal.growthStage === 'baby' && !isMoving) {
      const jump = Math.sin(state.clock.elapsedTime * 5) > 0.5 ? 0.05 : 0
      groupRef.current.position.y += jump
    }
  })

  // 点击处理
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation()

    // 左键点击 - 喂养
    if (e.button === 0 && onClick) {
      onClick(animal)
    }

    // 右键点击 - 击杀
    if (e.button === 2 && onRightClick) {
      onRightClick(animal)
    }
  }

  const [width, height, depth] = stageConfig.size

  // 左前腿和右前腿的动画引用
  const leftFrontLegRef = useRef<THREE.Mesh>(null)
  const rightFrontLegRef = useRef<THREE.Mesh>(null)
  const leftBackLegRef = useRef<THREE.Mesh>(null)
  const rightBackLegRef = useRef<THREE.Mesh>(null)

  // 腿部动画
  useFrame((state) => {
    const isMoving = animal.isMoving && (!animal.restUntil || Date.now() >= animal.restUntil)
    const legSwingSpeed = 8
    const legSwingAmount = 0.3

    if (isMoving) {
      const time = state.clock.elapsedTime
      // 对角线同步：左前+右后，右前+左后
      if (leftFrontLegRef.current) {
        leftFrontLegRef.current.rotation.x = Math.sin(time * legSwingSpeed) * legSwingAmount
      }
      if (rightBackLegRef.current) {
        rightBackLegRef.current.rotation.x = Math.sin(time * legSwingSpeed) * legSwingAmount
      }
      if (rightFrontLegRef.current) {
        rightFrontLegRef.current.rotation.x = Math.sin(time * legSwingSpeed + Math.PI) * legSwingAmount
      }
      if (leftBackLegRef.current) {
        leftBackLegRef.current.rotation.x = Math.sin(time * legSwingSpeed + Math.PI) * legSwingAmount
      }
    } else {
      // 静止时腿部复位
      [leftFrontLegRef, rightFrontLegRef, leftBackLegRef, rightBackLegRef].forEach(ref => {
        if (ref.current) {
          ref.current.rotation.x = 0
        }
      })
    }
  })

  // 根据动物类型渲染不同的身体形状
  const renderBody = () => {
    if (animal.animalId === 'chicken') {
      // 鸡：椭圆形身体（使用球体几何体 + 缩放）
      return (
        <mesh position={[0, 0, 0]} scale={[1, 0.8, 0.7]} castShadow>
          <sphereGeometry args={[bodyWidth, 16, 16]} />
          <meshStandardMaterial
            color={isHovered ? '#FFD54F' : colors.body}
            roughness={0.7}
          />
        </mesh>
      )
    } else if (animal.animalId === 'sheep' && animal.growthStage === 'adult') {
      // 羊：非常圆润的身体（毛茸茸）
      return (
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[bodyWidth * 0.9, 16, 16]} />
          <meshStandardMaterial
            color={isHovered ? '#FFD54F' : colors.body}
            roughness={1.0}
          />
        </mesh>
      )
    } else {
      // 其他动物使用默认的长方体
      return (
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[bodyWidth, bodyHeight, bodyDepth]} />
          <meshStandardMaterial
            color={isHovered ? '#FFD54F' : colors.body}
            roughness={0.7}
          />
        </mesh>
      )
    }
  }

  // 根据动物类型渲染不同的腿部
  const renderLegs = () => {
    let legConfig = { width: legWidth, height: legHeight, depth: legDepth, positions: [[-bodyWidth * 0.3, bodyDepth * 0.3], [bodyWidth * 0.3, bodyDepth * 0.3], [-bodyWidth * 0.3, -bodyDepth * 0.3], [bodyWidth * 0.3, -bodyDepth * 0.3]] }

    if (animal.animalId === 'chicken') {
      // 鸡：细长的腿
      legConfig = {
        width: legWidth * 0.5,
        height: legHeight * 1.3,
        depth: legDepth * 0.5,
        positions: [[-bodyWidth * 0.2, bodyDepth * 0.3], [bodyWidth * 0.2, bodyDepth * 0.3], [-bodyWidth * 0.2, -bodyDepth * 0.3], [bodyWidth * 0.2, -bodyDepth * 0.3]]
      }
    } else if (animal.animalId === 'pig') {
      // 猪：短粗的腿
      legConfig = {
        width: legWidth * 1.5,
        height: legHeight * 0.6,
        depth: legDepth * 1.5,
        positions: [[-bodyWidth * 0.35, bodyDepth * 0.35], [bodyWidth * 0.35, bodyDepth * 0.35], [-bodyWidth * 0.35, -bodyDepth * 0.35], [bodyWidth * 0.35, -bodyDepth * 0.35]]
      }
    } else if (animal.animalId === 'cow') {
      // 牛：粗壮的腿
      legConfig = {
        width: legWidth * 1.8,
        height: legHeight * 1.1,
        depth: legDepth * 1.8,
        positions: [[-bodyWidth * 0.35, bodyDepth * 0.35], [bodyWidth * 0.35, bodyDepth * 0.35], [-bodyWidth * 0.35, -bodyDepth * 0.35], [bodyWidth * 0.35, -bodyDepth * 0.35]]
      }
    } else if (animal.animalId === 'sheep') {
      // 羊：细腿
      legConfig = {
        width: legWidth * 0.7,
        height: legHeight * 1.0,
        depth: legDepth * 0.7,
        positions: [[-bodyWidth * 0.25, bodyDepth * 0.3], [bodyWidth * 0.25, bodyDepth * 0.3], [-bodyWidth * 0.25, -bodyDepth * 0.3], [bodyWidth * 0.25, -bodyDepth * 0.3]]
      }
    }

    return legConfig.positions.map(([x, z], index) => (
      <mesh key={index} position={[x, -legConfig.height / 2, z]} castShadow>
        <boxGeometry args={[legConfig.width, legConfig.height, legConfig.depth]} />
        <meshStandardMaterial color={colors.legs} />
      </mesh>
    ))
  }

  return (
    <group
      ref={groupRef}
      position={[animal.position[0], animal.position[1] + legHeight, animal.position[2]]}
      rotation={[0, (animal.rotation * Math.PI) / 180, 0]}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
    >
      {/* === 四条腿 === */}
      {renderLegs()}

      {/* === 身体 === */}
      {renderBody()}

      {/* === 头部 === */}
      <mesh position={[0, bodyHeight / 2 + headSize / 2, bodyDepth * 0.4]} castShadow>
        <boxGeometry args={[headSize, headSize, headSize * 0.8]} />
        <meshStandardMaterial
          color={isHovered ? '#FFEB3B' : colors.head}
          roughness={0.6}
        />
      </mesh>

      {/* === 眼睛 === */}
      {(animal.growthStage === 'growing' || animal.growthStage === 'adult') && (
        <>
          <mesh position={[headSize * 0.2, bodyHeight / 2 + headSize / 2, bodyDepth * 0.4 + headSize * 0.4]}>
            <sphereGeometry args={[headSize * 0.12, 8, 8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-headSize * 0.2, bodyHeight / 2 + headSize / 2, bodyDepth * 0.4 + headSize * 0.4]}>
            <sphereGeometry args={[headSize * 0.12, 8, 8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </>
      )}

      {/* === 鸡的特殊特征 === */}
      {animal.animalId === 'chicken' && (animal.growthStage === 'growing' || animal.growthStage === 'adult') && (
        <>
          {/* 鸡冠 */}
          <mesh position={[0, bodyHeight / 2 + headSize * 0.8, bodyDepth * 0.4]}>
            <boxGeometry args={[headSize * 0.15, headSize * 0.25, headSize * 0.4]} />
            <meshStandardMaterial color="#F44336" />
          </mesh>
          {/* 嘴巴（喙） */}
          <mesh position={[0, bodyHeight / 2 + headSize * 0.3, bodyDepth * 0.4 + headSize * 0.5]}>
            <coneGeometry args={[headSize * 0.08, headSize * 0.2, 4]} />
            <meshStandardMaterial color="#FF9800" />
          </mesh>
          {/* 左翅膀 */}
          <mesh position={[-bodyWidth * 0.6, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[bodyWidth * 0.6, bodyHeight * 0.4, bodyDepth * 0.3]} />
            <meshStandardMaterial color="#FF9800" />
          </mesh>
          {/* 右翅膀 */}
          <mesh position={[bodyWidth * 0.6, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[bodyWidth * 0.6, bodyHeight * 0.4, bodyDepth * 0.3]} />
            <meshStandardMaterial color="#FF9800" />
          </mesh>
          {/* 尾巴 */}
          <mesh position={[0, bodyHeight * 0.3, -bodyDepth * 0.6]}>
            <boxGeometry args={[bodyWidth * 0.2, bodyHeight * 0.4, bodyDepth * 0.3]} />
            <meshStandardMaterial color="#FF6F00" />
          </mesh>
        </>
      )}

      {/* === 猪的特殊特征 === */}
      {animal.animalId === 'pig' && (animal.growthStage === 'growing' || animal.growthStage === 'adult') && (
        <>
          {/* 大鼻子 */}
          <mesh position={[0, bodyHeight / 2 + headSize * 0.25, bodyDepth * 0.4 + headSize * 0.5]}>
            <cylinderGeometry args={[headSize * 0.25, headSize * 0.2, headSize * 0.08, 12]} />
            <meshStandardMaterial color="#FFCCBC" />
          </mesh>
          {/* 鼻孔 */}
          <mesh position={[headSize * 0.1, bodyHeight / 2 + headSize * 0.25, bodyDepth * 0.4 + headSize * 0.55]}>
            <sphereGeometry args={[headSize * 0.04, 6, 6]} />
            <meshStandardMaterial color="#8D6E63" />
          </mesh>
          <mesh position={[-headSize * 0.1, bodyHeight / 2 + headSize * 0.25, bodyDepth * 0.4 + headSize * 0.55]}>
            <sphereGeometry args={[headSize * 0.04, 6, 6]} />
            <meshStandardMaterial color="#8D6E63" />
          </mesh>
          {/* 尖耳朵 */}
          <mesh position={[headSize * 0.4, bodyHeight / 2 + headSize * 0.6, bodyDepth * 0.4]} rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[headSize * 0.1, headSize * 0.15, 3]} />
            <meshStandardMaterial color="#FF8A65" />
          </mesh>
          <mesh position={[-headSize * 0.4, bodyHeight / 2 + headSize * 0.6, bodyDepth * 0.4]} rotation={[0, 0, -Math.PI / 4]}>
            <coneGeometry args={[headSize * 0.1, headSize * 0.15, 3]} />
            <meshStandardMaterial color="#FF8A65" />
          </mesh>
          {/* 卷尾巴 */}
          <mesh position={[0, bodyHeight * 0.5, -bodyDepth * 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[bodyWidth * 0.05, bodyWidth * 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#FF5722" />
          </mesh>
        </>
      )}

      {/* === 牛的特殊特征 === */}
      {animal.animalId === 'cow' && (animal.growthStage === 'growing' || animal.growthStage === 'adult') && (
        <>
          {/* 牛角 */}
          <mesh position={[headSize * 0.4, bodyHeight / 2 + headSize * 0.8, bodyDepth * 0.4]} rotation={[0, 0, Math.PI / 6]}>
            <coneGeometry args={[headSize * 0.06, headSize * 0.2, 4]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          <mesh position={[-headSize * 0.4, bodyHeight / 2 + headSize * 0.8, bodyDepth * 0.4]} rotation={[0, 0, -Math.PI / 6]}>
            <coneGeometry args={[headSize * 0.06, headSize * 0.2, 4]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* 大耳朵 */}
          <mesh position={[headSize * 0.35, bodyHeight / 2 + headSize * 0.5, bodyDepth * 0.4]} rotation={[0, 0, Math.PI / 3]}>
            <boxGeometry args={[headSize * 0.15, headSize * 0.25, headSize * 0.05]} />
            <meshStandardMaterial color="#8D6E63" />
          </mesh>
          <mesh position={[-headSize * 0.35, bodyHeight / 2 + headSize * 0.5, bodyDepth * 0.4]} rotation={[0, 0, -Math.PI / 3]}>
            <boxGeometry args={[headSize * 0.15, headSize * 0.25, headSize * 0.05]} />
            <meshStandardMaterial color="#8D6E63" />
          </mesh>
          {/* 身体斑点 */}
          <mesh position={[bodyWidth * 0.3, bodyHeight * 0.2, bodyDepth * 0.3]}>
            <sphereGeometry args={[bodyWidth * 0.2, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-bodyWidth * 0.2, bodyHeight * 0.3, -bodyDepth * 0.2]}>
            <sphereGeometry args={[bodyWidth * 0.15, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>
          {/* 乳房（仅成年） */}
          {animal.growthStage === 'adult' && (
            <mesh position={[0, -bodyHeight * 0.3, bodyDepth * 0.5]}>
              <cylinderGeometry args={[bodyWidth * 0.15, bodyWidth * 0.1, bodyHeight * 0.2, 8]} />
              <meshStandardMaterial color="#FFCCBC" />
            </mesh>
          )}
        </>
      )}

      {/* === 羊的特殊特征 === */}
      {animal.animalId === 'sheep' && (
        <>
          {/* 全身羊毛蓬松效果（多个球形凸起） */}
          {animal.growthStage === 'adult' ? (
            <>
              <mesh position={[bodyWidth * 0.3, bodyHeight * 0.3, bodyDepth * 0.4]}>
                <sphereGeometry args={[bodyWidth * 0.25, 8, 8]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[-bodyWidth * 0.25, bodyHeight * 0.2, bodyDepth * 0.3]}>
                <sphereGeometry args={[bodyWidth * 0.22, 8, 8]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[bodyWidth * 0.2, -bodyHeight * 0.1, -bodyDepth * 0.2]}>
                <sphereGeometry args={[bodyWidth * 0.18, 8, 8]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[-bodyWidth * 0.3, bodyHeight * 0.1, -bodyDepth * 0.3]}>
                <sphereGeometry args={[bodyWidth * 0.2, 8, 8]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[0, bodyHeight * 0.4, -bodyDepth * 0.4]}>
                <sphereGeometry args={[bodyWidth * 0.23, 8, 8]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[bodyWidth * 0.35, -bodyHeight * 0.2, bodyDepth * 0.1]}>
                <sphereGeometry args={[bodyWidth * 0.15, 8, 8]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
            </>
          ) : (
            // 幼崽和成长中阶段的羊毛较少
            <>
              <mesh position={[bodyWidth * 0.2, bodyHeight * 0.2, bodyDepth * 0.3]}>
                <sphereGeometry args={[bodyWidth * 0.15, 6, 6]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
              <mesh position={[-bodyWidth * 0.15, bodyHeight * 0.1, -bodyDepth * 0.2]}>
                <sphereGeometry args={[bodyWidth * 0.12, 6, 6]} />
                <meshStandardMaterial color="#F5F5F5" />
              </mesh>
            </>
          )}
          {/* 下垂的耳朵 */}
          <mesh position={[headSize * 0.3, bodyHeight / 2 + headSize * 0.3, bodyDepth * 0.4]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[headSize * 0.1, headSize * 0.2, headSize * 0.05]} />
            <meshStandardMaterial color="#BDBDBD" />
          </mesh>
          <mesh position={[-headSize * 0.3, bodyHeight / 2 + headSize * 0.3, bodyDepth * 0.4]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[headSize * 0.1, headSize * 0.2, headSize * 0.05]} />
            <meshStandardMaterial color="#BDBDBD" />
          </mesh>
        </>
      )}

      {/* 悬停时显示状态 */}
      {isHovered && (
        <Html
          position={[0, height + 0.5, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {config.emoji} {config.name} #{animal.id.slice(-4)}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>
              {animal.growthStage === 'adult' ? (
                <>
                  <div>阶段：成年 ✅</div>
                  <div>健康：{animal.health}/100</div>
                  <div>饥饿：{animal.hunger}/100</div>
                </>
              ) : (
                <>
                  <div>阶段：{
                    animal.growthStage === 'baby' ? '幼崽' : '成长中'
                  }</div>
                  <div>进度：{growthProgress.toFixed(0)}%</div>
                </>
              )}
            </div>
            {animal.hunger < 30 && (
              <div style={{ color: '#FF5252', marginTop: '4px', fontSize: '10px' }}>
                ⚠️ 饥饿！
              </div>
            )}
          </div>
        </Html>
      )}

      {/* 成年且可产出的动物显示图标 */}
      {animal.growthStage === 'adult' && config.product.type !== null && config.product.type !== 'meat' && (
        <Html position={[0, height + 0.3, 0]} center>
          <div style={{ fontSize: '16px' }}>✨</div>
        </Html>
      )}
    </group>
  )
}
