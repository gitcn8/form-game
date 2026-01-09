import { useRef } from 'react'

interface PlacedFacilityProps {
  facilityType: 'facility_chicken_coop' | 'facility_barn'
  position: [number, number, number]
  rotation?: number
}

/**
 * 设施组件（鸡舍、牛棚）
 * 类似PlacedBlock，但是更大更复杂的建筑
 */
export function PlacedFacility({ facilityType, position, rotation = 0 }: PlacedFacilityProps) {
  const groupRef = useRef<THREE.Group>(null)

  const [x, y, z] = position

  // 设施配置
  const facilityConfigs = {
    facility_chicken_coop: {
      name: '鸡舍',
      icon: '🏠',
      color: '#8B4513', // 棕色
      size: [4, 3, 4] as [number, number, number], // 宽、高、深
      wallColor: '#A0522D',
      roofColor: '#8B0000'
    },
    facility_barn: {
      name: '牛棚',
      icon: '🏡',
      color: '#A0522D', // 棕色
      size: [6, 4, 5] as [number, number, number],
      wallColor: '#CD853F',
      roofColor: '#8B4513'
    }
  }

  const config = facilityConfigs[facilityType]
  const [width, height, depth] = config.size

  return (
    <group ref={groupRef} position={[x, y + height / 2, z]} rotation={[0, rotation, 0]}>
      {/* 地基 */}
      <mesh position={[0, -height / 2, 0]} receiveShadow>
        <boxGeometry args={[width + 0.5, 0.2, depth + 0.5]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>

      {/* 墙壁 - 使用4个面围成一个房子 */}
      {/* 前墙（带门） */}
      <mesh position={[0, 0, depth / 2]} receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color={config.wallColor} />
      </mesh>

      {/* 后墙 */}
      <mesh position={[0, 0, -depth / 2]} receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color={config.wallColor} />
      </mesh>

      {/* 左墙 */}
      <mesh position={[-width / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, height, depth]} />
        <meshStandardMaterial color={config.wallColor} />
      </mesh>

      {/* 右墙 */}
      <mesh position={[width / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, height, depth]} />
        <meshStandardMaterial color={config.wallColor} />
      </mesh>

      {/* 屋顶 */}
      <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
        <coneGeometry args={[Math.max(width, depth) * 0.7, height * 0.5, 4]} />
        <meshStandardMaterial color={config.roofColor} />
      </mesh>

      {/* 门 */}
      <mesh position={[0, -height / 4, depth / 2 + 0.15]}>
        <boxGeometry args={[1.5, height * 0.6, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  )
}
