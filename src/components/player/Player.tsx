import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

interface PlayerProps {
  position: [number, number, number]
  rotation: number
  visible: boolean
  isMoving: boolean
  colors: {
    head: string
    body: string
    limbs: string
  }
}

/**
 * 火柴盒人玩家模型（方块风格）
 * 支持自定义颜色和四肢摆动动画
 */
export function Player({ position, rotation, visible, isMoving, colors }: PlayerProps) {
  const leftArmRotation = useRef(0)
  const rightArmRotation = useRef(0)
  const leftLegRotation = useRef(0)
  const rightLegRotation = useRef(0)

  // 更新四肢摆动动画
  useFrame(() => {
    if (isMoving) {
      const time = performance.now() / 1000
      const swingSpeed = 10 // 摆动速度
      const swingAmount = 0.5 // 摆动幅度（弧度）

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
