import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { getTerrainGenerator } from './TerrainGenerator'
import { Tree } from './Environment'

/**
 * 区块系统
 * 将世界划分为 16x16 的区块，动态加载玩家周围的区块
 */

const CHUNK_SIZE = 16 // 区块大小（方块数）
const RENDER_DISTANCE = 3 // 渲染距离（区块数）

export interface ChunkData {
  chunkX: number
  chunkZ: number
  blocks: Map<string, { type: string; position: [number, number, number] }>
  trees: Array<{ id: string; position: [number, number, number]; biome: string }>
  groundColor: string
}

export interface ChunkSystemProps {
  playerPosition: [number, number, number]
  onChunkLoaded?: (chunkData: ChunkData) => void
}

/**
 * 使用区块系统 Hook
 */
export function useChunkSystem(playerPosition: [number, number, number]) {
  const [chunks, setChunks] = useState<Map<string, ChunkData>>(new Map())
  const terrainGenerator = useRef(getTerrainGenerator())

  useEffect(() => {
    const [playerX, , playerZ] = playerPosition

    // 计算玩家所在的区块坐标
    const playerChunkX = Math.floor(playerX / CHUNK_SIZE)
    const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE)

    // 生成玩家周围的区块
    const newChunks = new Map<string, ChunkData>()
    const chunksToKeep = new Set<string>()

    for (let offsetX = -RENDER_DISTANCE; offsetX <= RENDER_DISTANCE; offsetX++) {
      for (let offsetZ = -RENDER_DISTANCE; offsetZ <= RENDER_DISTANCE; offsetZ++) {
        const chunkX = playerChunkX + offsetX
        const chunkZ = playerChunkZ + offsetZ
        const chunkKey = `${chunkX},${chunkZ}`

        chunksToKeep.add(chunkKey)

        // 如果区块已存在，直接使用
        if (chunks.has(chunkKey)) {
          newChunks.set(chunkKey, chunks.get(chunkKey)!)
          continue
        }

        // 生成新区块
        const chunkData = generateChunk(chunkX, chunkZ)
        newChunks.set(chunkKey, chunkData)
      }
    }

    setChunks(newChunks)
  }, [playerPosition])

  /**
   * 生成单个区块
   */
  function generateChunk(chunkX: number, chunkZ: number): ChunkData {
    const blocks = new Map()
    const trees: Array<{ id: string; position: [number, number, number]; biome: string }> = []
    let groundColor = '#7CFC00'

    // 遍历区块内的每个位置
    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      for (let localZ = 0; localZ < CHUNK_SIZE; localZ++) {
        const worldX = chunkX * CHUNK_SIZE + localX
        const worldZ = chunkZ * CHUNK_SIZE + localZ

        // 获取地形数据
        const height = terrainGenerator.current.getHeight(worldX, worldZ)
        const biome = terrainGenerator.current.getBiomeType(worldX, worldZ)
        groundColor = terrainGenerator.current.getGroundColor(worldX, worldZ)

        // 生成地面方块（在 y=0）
        const blockKey = `${worldX},0,${worldZ}`
        blocks.set(blockKey, {
          type: biome,
          position: [worldX, 0, worldZ]
        })

        // 生成树木
        if (terrainGenerator.current.shouldGenerateTree(worldX, worldZ)) {
          const treeKey = `tree_${worldX}_${worldZ}`
          trees.push({
            id: treeKey,
            position: [worldX, 0, worldZ],
            biome
          })
        }
      }
    }

    return {
      chunkX,
      chunkZ,
      blocks,
      trees,
      groundColor
    }
  }

  return { chunks, terrainGenerator: terrainGenerator.current }
}

/**
 * 无限地面组件
 * 动态生成玩家周围的地面
 */
export function InfiniteGround({ playerPosition }: { playerPosition: [number, number, number] }) {
  const { chunks } = useChunkSystem(playerPosition)

  return (
    <group>
      {Array.from(chunks.entries()).map(([chunkKey, chunkData]) => {
        // 渲染区块地面（使用大型 Plane 优化性能）
        // 放在 y=-0.5，作为地表方块（y=0）的底部支撑
        const worldX = chunkData.chunkX * CHUNK_SIZE
        const worldZ = chunkData.chunkZ * CHUNK_SIZE

        return (
          <mesh
            key={chunkKey}
            position={[worldX + CHUNK_SIZE / 2, -0.5, worldZ + CHUNK_SIZE / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[CHUNK_SIZE, CHUNK_SIZE]} />
            <meshStandardMaterial color={chunkData.groundColor} />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * 无限树木组件
 * 动态生成玩家周围的树木
 */
export function InfiniteTrees({ playerPosition, onChop }: { playerPosition: [number, number, number]; onChop: () => void }) {
  const { chunks } = useChunkSystem(playerPosition)

  return (
    <group>
      {Array.from(chunks.entries()).map(([chunkKey, chunkData]) => {
        return chunkData.trees.map((tree) => (
          <Tree key={`${chunkKey}_${tree.id}`} position={tree.position} onChop={onChop} />
        ))
      })}
    </group>
  )
}
