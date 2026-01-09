import { BLOCK_TYPES, generateBlockAt } from '../world/BlockTypes'

/**
 * 区块矿石生成器
 * 为每个区块生成地下方块（y=-1 到 y=-10）
 */

export interface ChunkBlockData {
  position: [number, number, number]
  blockType: string
  key: string // "x,y,z"
}

/**
 * 生成指定区块的地下方块
 * @param chunkX - 区块 X 坐标
 * @param chunkZ - 区块 Z 坐标
 * @param chunkSize - 区块大小（默认 16）
 * @returns 该区块的所有地下方块
 */
export function generateChunkBlocks(
  chunkX: number,
  chunkZ: number,
  chunkSize: number = 16
): ChunkBlockData[] {
  const blocks: ChunkBlockData[] = []

  // 遍历区块的 X 和 Z 坐标
  for (let localX = 0; localX < chunkSize; localX++) {
    for (let localZ = 0; localZ < chunkSize; localZ++) {
      const worldX = chunkX * chunkSize + localX
      const worldZ = chunkZ * chunkSize + localZ

      // 生成地表层（逻辑层 y=0）和地下层（逻辑层 y=-1 到 y=-10）
      for (let logicalY = 0; logicalY >= -10; logicalY--) {
        // 使用 BlockTypes 的生成函数
        const blockType = generateBlockAt(worldX, logicalY, worldZ)

        // 计算渲染位置：方块中心位置
        // 地表方块（logicalY=0）的中心在 y=-0.5（顶部在地面上）
        // 地下方块（logicalY<0）的中心在 logicalY - 0.5
        const renderY = logicalY - 0.5
        const blockKey = `${worldX},${logicalY},${worldZ}`

        blocks.push({
          position: [worldX, renderY, worldZ],
          blockType,
          key: blockKey
        })
      }
    }
  }

  return blocks
}

/**
 * 获取指定位置的方块类型
 * @param worldX - 世界 X 坐标
 * @param worldY - 世界 Y 坐标
 * @param worldZ - 世界 Z 坐标
 * @returns 方块类型
 */
export function getBlockAt(worldX: number, worldY: number, worldZ: number): string {
  // 地面层（y=0）
  if (worldY === 0) {
    return 'GRASS'
  }

  // 地下层（y<0）
  if (worldY < 0 && worldY >= -10) {
    return generateBlockAt(worldX, worldY, worldZ)
  }

  // 空气（其他地方）
  return 'AIR'
}

/**
 * 判断指定位置是否应该生成方块
 * @param worldX - 世界 X 坐标
 * @param worldY - 世界 Y 坐标
 * @param worldZ - 世界 Z 坐标
 * @returns 是否生成方块
 */
export function shouldGenerateBlock(worldX: number, worldY: number, worldZ: number): boolean {
  // 只在地面和地下生成方块
  return worldY <= 0 && worldY >= -10
}

/**
 * 计算挖掘指定方块所需的时间（秒）
 * @param blockType - 方块类型
 * @param toolType - 工具类型（null 表示徒手）
 * @returns 挖掘时间（秒）
 */
export function getMiningTime(blockType: string, toolType: 'pickaxe' | 'shovel' | 'axe' | 'hoe' | null = null): number {
  const block = BLOCK_TYPES[blockType]
  if (!block) return 1

  let baseTime = block.hardness

  // 工具效率
  if (toolType === block.tool) {
    // 正确工具：速度 1x
    return baseTime
  } else if (toolType !== null) {
    // 错误工具：速度 0.5x（时间翻倍）
    return baseTime * 2
  } else {
    // 徒手：速度 0.5x
    return baseTime * 2
  }
}

/**
 * 获取方块掉落的物品类型
 * @param blockType - 方块类型
 * @returns 掉落物品类型，null 表示不掉落
 */
export function getBlockDrop(blockType: string): string | null {
  const block = BLOCK_TYPES[blockType]
  return block ? block.drops : null
}
