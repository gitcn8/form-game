import { useState } from 'react'

interface HouseProps {
  position: [number, number, number]
}

/**
 * 房子（方块风格）
 */
export function House({ position }: HouseProps) {
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

interface TreeProps {
  position: [number, number, number]
  onChop: () => void
}

/**
 * 树木（方块风格）
 * 可点击砍伐，5秒后重生
 */
export function Tree({ position, onChop }: TreeProps) {
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

/**
 * 大型草地地面
 */
export function Ground() {
  return (
    <>
      {/* 大型草地地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#7CFC00" />
      </mesh>

      {/* 路径 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
    </>
  )
}
