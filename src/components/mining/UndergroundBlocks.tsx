import { useMemo } from 'react'
import { WorldBlock } from '../world/WorldBlock'
import { generateChunkBlocks, ChunkBlockData, getBlockDrop } from './OreGenerator'

interface UndergroundBlocksProps {
  playerPosition: [number, number, number]
  minedBlocks: Set<string> // 已挖掘的方块
  onBlockMined: (position: [number, number, number], blockType: string, dropItem: string | null) => void
  targetBlock: string | null  // 当前瞄准的方块key
}

/**
 * 地下方块渲染组件
 * 只渲染玩家周围的地下方块（优化性能）
 * 为了性能考虑，只渲染浅层地下方块（y=-1 到 y=-3）
 * 同时在玩家周围生成一些地表可挖掘的石头和泥土
 */
export function UndergroundBlocks({ playerPosition, minedBlocks, onBlockMined, targetBlock }: UndergroundBlocksProps) {
  // 计算玩家周围的区块
  const renderDistance = 1 // 渲染距离（区块数）- 优化性能：从2减少到1（5x5→3x3区块）
  const chunkSize = 16

  const chunks = useMemo(() => {
    const playerChunkX = Math.floor(playerPosition[0] / chunkSize)
    const playerChunkZ = Math.floor(playerPosition[2] / chunkSize)

    const chunkList: { chunkX: number; chunkZ: number }[] = []

    for (let offsetX = -renderDistance; offsetX <= renderDistance; offsetX++) {
      for (let offsetZ = -renderDistance; offsetZ <= renderDistance; offsetZ++) {
        chunkList.push({
          chunkX: playerChunkX + offsetX,
          chunkZ: playerChunkZ + offsetZ
        })
      }
    }

    return chunkList
  }, [playerPosition, renderDistance, chunkSize])

  // 生成所有区块的方块（只生成地表层以提升性能）
  const allBlocks = useMemo(() => {
    // 1. 收集所有区块的方块（只生成地表层 y=0）
    const allChunkBlocks: ChunkBlockData[] = []

    for (const chunk of chunks) {
      const chunkBlocks = generateChunkBlocks(chunk.chunkX, chunk.chunkZ, chunkSize)

      // 性能优化：只保留地表层（y=0），大幅减少方块数量
      const surfaceBlocks = chunkBlocks.filter((block) => {
        const logicalY = parseInt(block.key.split(',')[1])
        return logicalY === 0  // 只要地表层
      })

      allChunkBlocks.push(...surfaceBlocks)
    }

    // 2. 全局排序：按距离玩家排序，优先渲染玩家附近的方块
    const sortedBlocks = allChunkBlocks.sort((a, b) => {
      const distA = Math.sqrt(
        Math.pow(a.position[0] - playerPosition[0], 2) +
        Math.pow(a.position[2] - playerPosition[2], 2)
      )
      const distB = Math.sqrt(
        Math.pow(b.position[0] - playerPosition[0], 2) +
        Math.pow(b.position[2] - playerPosition[2], 2)
      )
      return distA - distB
    })

    // 3. 保留所有地表方块（数量已经很少了，无需限制）
    return sortedBlocks
  }, [chunks, chunkSize, playerPosition])

  const renderBlocks = allBlocks

  return (
    <group>
      {renderBlocks
        .filter((block) => !minedBlocks.has(block.key)) // 过滤已挖掘的方块
        .map((block) => (
          <WorldBlock
            key={block.key}
            position={block.position}
            blockType={block.blockType}
            isTargeted={block.key === targetBlock}  // 被瞄准时颜色变深
          />
        ))}
    </group>
  )
}
