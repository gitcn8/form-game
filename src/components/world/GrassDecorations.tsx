import { useMemo } from 'react'
import * as THREE from 'three'

interface GrassDecoration {
  position: [number, number, number]
  scale: number
  rotation: number
  type: 'grass' | 'flower'
}

/**
 * 草地装饰组件
 * 在地表随机生成草和花朵，增加世界生机
 * 只在第一次渲染时生成，之后使用缓存
 */
export function GrassDecorations() {
  // 生成固定的随机装饰（使用种子保证每次加载都一样）
  const decorations = useMemo((): GrassDecoration[] => {
    const decorations: GrassDecoration[] = []
    const areaSize = 50 // 生成范围：-25 到 25
    const decorationCount = 300 // 装饰数量

    // 简单的伪随机数生成器（使用固定种子）
    let seed = 12345
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    for (let i = 0; i < decorationCount; i++) {
      const x = (random() * areaSize) - areaSize / 2
      const z = (random() * areaSize) - areaSize / 2

      // 留出中心区域（玩家出生点）
      if (Math.abs(x) < 5 && Math.abs(z) < 5) continue

      // 80% 草，20% 花
      const type = random() > 0.8 ? 'flower' : 'grass'

      decorations.push({
        position: [x, 0.1, z], // 略高于地面
        scale: 0.5 + random() * 0.5, // 0.5-1.0 缩放
        rotation: random() * Math.PI * 2, // 随机旋转
        type
      })
    }

    console.log(`✨ 生成了 ${decorations.length} 个草地装饰`)
    return decorations
  }, [])

  return (
    <group>
      {decorations.map((decoration, index) => (
        <GrassBlade
          key={index}
          position={decoration.position}
          scale={decoration.scale}
          rotation={decoration.rotation}
          type={decoration.type}
        />
      ))}
    </group>
  )
}

/**
 * 单个草/花组件
 */
interface GrassBladeProps {
  position: [number, number, number]
  scale: number
  rotation: number
  type: 'grass' | 'flower'
}

function GrassBlade({ position, scale, rotation, type }: GrassBladeProps) {
  return (
    <mesh position={position} scale={scale} rotation={[0, rotation, 0]}>
      {type === 'grass' ? (
        <>
          {/* 草叶片 - 使用多个平面交叉 */}
          <mesh geometry={grassBladeGeometry}>
            <meshStandardMaterial
              color="#4CAF50"
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh geometry={grassBladeGeometry} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial
              color="#66BB6A"
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
        </>
      ) : (
        <>
          {/* 花朵 */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color={getRandomFlowerColor(rotation)}
              emissive={getRandomFlowerColor(rotation)}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* 花茎 */}
          <mesh position={[0, 0.15, 0]} scale={[0.02, 0.3, 0.02]}>
            <cylinderGeometry args={[1, 1, 1, 4]} />
            <meshStandardMaterial color="#4CAF50" />
          </mesh>
        </>
      )}
    </mesh>
  )
}

// 草叶几何体（复用以提升性能）
const grassBladeGeometry = new THREE.PlaneGeometry(0.15, 0.6)

/**
 * 根据旋转值（作为随机种子）获取花朵颜色
 */
function getRandomFlowerColor(seed: number): string {
  const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8ED4', '#FFFFFF', '#FFA07A']
  const index = Math.floor(Math.abs(seed) * colors.length) % colors.length
  return colors[index]
}
