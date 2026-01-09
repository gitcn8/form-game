import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlacedMachine } from '../../config/MachineConfig'
import { MACHINE_CONFIGS } from '../../config/MachineConfig'

interface PlacedMachineProps {
  machine: PlacedMachine
  isSelected?: boolean
  onClick?: () => void
}

/**
 * 放置的机器3D渲染组件
 */
export function PlacedMachineMesh({ machine, isSelected = false, onClick }: PlacedMachineProps) {
  const meshRef = useRef<THREE.Group>(null)
  const config = MACHINE_CONFIGS[machine.machineType]

  // 机器旋转动画（可选）
  useFrame((state, delta) => {
    if (meshRef.current && machine.processing) {
      // 加工时缓慢旋转
      meshRef.current.rotation.y += delta * 0.2
    } else if (meshRef.current) {
      // 静止时面向玩家
      meshRef.current.rotation.y = 0
    }
  })

  const [x, y, z] = machine.position
  const [width, height, depth] = config.size

  // 计算机器中心位置（向上偏移高度的一半，使底部贴地）
  const centerY = y + height / 2

  // 根据机器类型设置颜色
  const getMachineColor = () => {
    switch (machine.machineType) {
      case 'machine_oven': return '#FF4500' // 橙红色
      case 'machine_boiler': return '#4169E1' // 蓝色
      case 'machine_juicer': return '#32CD32' // 绿色
      case 'machine_grinder': return '#708090' // 灰色
      case 'machine_mixer': return '#FF69B4' // 粉色
      default: return '#808080'
    }
  }

  const machineColor = getMachineColor()

  return (
    <group
      ref={meshRef}
      position={[x, centerY, z]}
      onClick={(e) => {
        console.log('🔧 [PlacedMachine] onClick triggered')
        console.log('🔧 [PlacedMachine] pointerLockElement before:', document.pointerLockElement)

        // 立即释放指针锁定，让鼠标可以点击UI
        if (document.pointerLockElement) {
          document.exitPointerLock()
          console.log('🔧 [PlacedMachine] exitPointerLock called')
        }

        e.stopPropagation()
        console.log('🔧 [PlacedMachine] stopPropagation called')

        onClick?.()
        console.log('🔧 [PlacedMachine] onClick callback executed')
      }}
    >
      {/* 机器主体 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isSelected ? '#FFD700' : machineColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* 门 - 前面突出的面板 */}
      <mesh position={[0, 0, depth / 2 + 0.02]}>
        <boxGeometry args={[width * 0.9, height * 0.8, 0.05]} />
        <meshStandardMaterial
          color={isSelected ? '#FFD700' : machineColor}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* 门把手 - 横向圆柱 */}
      <mesh position={[0, 0, depth / 2 + 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, width * 0.3, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 顶部控制面板 */}
      <mesh position={[0, height / 2 - 0.02, 0]}>
        <boxGeometry args={[width * 0.6, 0.04, depth * 0.4]} />
        <meshStandardMaterial color="#2F4F4F" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 控制旋钮/按钮 - 3个小按钮 */}
      <mesh position={[-width * 0.15, height / 2 + 0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
        <meshStandardMaterial color="#1C1C1C" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, height / 2 + 0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
        <meshStandardMaterial color="#1C1C1C" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[width * 0.15, height / 2 + 0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
        <meshStandardMaterial color="#1C1C1C" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 加工进度指示器 */}
      {machine.processing && (
        <mesh position={[0, height / 2 + 0.2, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#00FF00"
            emissive="#00FF00"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  )
}
