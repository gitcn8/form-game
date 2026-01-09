// 材料颜色定义
export const materialColors = {
  wood: '#8B4513',    // 棕色
  stone: '#808080',   // 灰色
  dirt: '#8B6914',    // 褐色
  grass: '#7CFC00',   // 草绿色
  coal_ore: '#2C2C2C', // 煤矿（黑色）
  iron_ore: '#A0522D', // 铁矿（棕红色）
  gold_ore: '#FFD700', // 金矿（金色）
  diamond_ore: '#00CED1', // 钻石（青蓝色）
  bedrock: '#1A1A1A',  // 基岩（深黑色）
  door: '#8B4513',    // 门（棕色）
  glass: '#ADD8E6',   // 玻璃（浅蓝色，半透明）
  planks: '#DEB887'   // 木板（浅棕色）
}

// 方块类型定义
export interface BlockType {
  id: string
  name: string
  color: string
  hardness: number  // 挖掘所需时间（秒）
  tool: 'pickaxe' | 'shovel' | 'axe' | 'hoe' | null
  drops: string | null
  minLevel: number  // 最小Y层
  maxLevel: number  // 最大Y层
}

export const BLOCK_TYPES: Record<string, BlockType> = {
  GRASS: {
    id: 'grass',
    name: '草方块',
    color: materialColors.grass,
    hardness: 1,
    tool: 'shovel',
    drops: 'dirt',
    minLevel: 0,
    maxLevel: 0
  },
  DIRT: {
    id: 'dirt',
    name: '泥土',
    color: materialColors.dirt,
    hardness: 1,
    tool: 'shovel',
    drops: 'dirt',
    minLevel: -1,
    maxLevel: -1
  },
  STONE: {
    id: 'stone',
    name: '石头',
    color: materialColors.stone,
    hardness: 3,
    tool: 'pickaxe',
    drops: 'stone',
    minLevel: -2,
    maxLevel: -10
  },
  COAL_ORE: {
    id: 'coal_ore',
    name: '煤矿',
    color: materialColors.coal_ore,
    hardness: 3,
    tool: 'pickaxe',
    drops: 'coal',
    minLevel: -4,
    maxLevel: -10
  },
  IRON_ORE: {
    id: 'iron_ore',
    name: '铁矿',
    color: materialColors.iron_ore,
    hardness: 4,
    tool: 'pickaxe',
    drops: 'iron_ore',
    minLevel: -6,
    maxLevel: -10
  },
  GOLD_ORE: {
    id: 'gold_ore',
    name: '金矿',
    color: materialColors.gold_ore,
    hardness: 5,
    tool: 'pickaxe',
    drops: 'gold_ore',
    minLevel: -8,
    maxLevel: -10
  },
  DIAMOND_ORE: {
    id: 'diamond_ore',
    name: '钻石矿',
    color: materialColors.diamond_ore,
    hardness: 6,
    tool: 'pickaxe',
    drops: 'diamond',
    minLevel: -10,
    maxLevel: -10
  },
  BEDROCK: {
    id: 'bedrock',
    name: '基岩',
    color: materialColors.bedrock,
    hardness: Infinity,
    tool: null,
    drops: null,
    minLevel: -10,
    maxLevel: -10
  },
  WOOD: {
    id: 'wood',
    name: '木头',
    color: materialColors.wood,
    hardness: 2,
    tool: 'axe',
    drops: 'wood',
    minLevel: 0,
    maxLevel: 10
  }
}

// 矿石生成概率
export function generateBlockAt(_x: number, y: number, _z: number): string {
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

// 物品堆叠上限
export const STACK_SIZES = {
  // 方块
  dirt: 64,
  stone: 64,
  wood: 64,
  grass: 64,

  // 矿石
  coal: 64,
  iron_ore: 64,
  gold_ore: 64,
  diamond: 64,

  // 作物
  carrot: 64,

  // 工具（不堆叠）
  tool: 1
}
