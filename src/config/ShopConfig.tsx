/**
 * 商店配置文件
 * 定义所有可购买和可出售的商品
 */

// ==================== 可购买商品 ====================

export interface BuyableItem {
  id: string
  name: string
  icon: string
  category: 'materials' | 'tools' | 'machines' | 'animals' | 'decorations' | 'special' | 'trees'
  price: number
  description: string
  stackSize?: number // 堆叠数量
}

/**
 * 可购买商品列表
 */
export const BUYABLE_ITEMS: BuyableItem[] = [
  // ========== 建筑材料 ==========
  {
    id: 'material_wood',
    name: '木头',
    icon: '🪵',
    category: 'materials',
    price: 5,
    description: '基础建筑材料'
  },
  {
    id: 'material_stone',
    name: '石头',
    icon: '🪨',
    category: 'materials',
    price: 8,
    description: '坚固的建筑材料'
  },
  {
    id: 'material_dirt',
    name: '泥土',
    icon: '🟫',
    category: 'materials',
    price: 3,
    description: '用于填地和建造'
  },
  {
    id: 'material_glass',
    name: '玻璃',
    icon: '🪟',
    category: 'materials',
    price: 15,
    description: '透明的建筑材料'
  },
  {
    id: 'material_door',
    name: '木门',
    icon: '🚪',
    category: 'materials',
    price: 20,
    description: '房屋门'
  },
  {
    id: 'material_planks',
    name: '木板',
    icon: '📏',
    category: 'materials',
    price: 6,
    description: '加工过的木材'
  },

  // ========== 工具 ==========
  {
    id: 'tool_hoe',
    name: '锄头',
    icon: '🔨',
    category: 'tools',
    price: 10,
    description: '用于开垦土地'
  },
  {
    id: 'tool_watering_can',
    name: '水壶',
    icon: '💧',
    category: 'tools',
    price: 15,
    description: '用于给作物浇水'
  },
  {
    id: 'tool_sickle',
    name: '镰刀',
    icon: '🔪',
    category: 'tools',
    price: 12,
    description: '用于收割作物'
  },
  {
    id: 'tool_pickaxe_wood',
    name: '木镐',
    icon: '⛏️',
    category: 'tools',
    price: 20,
    description: '用于挖掘石头和矿石'
  },
  {
    id: 'tool_axe_wood',
    name: '木斧',
    icon: '🪓',
    category: 'tools',
    price: 15,
    description: '用于砍伐树木'
  },

  // ========== 机器设备（核心！） ==========
  {
    id: 'machine_oven',
    name: '烤箱',
    icon: '🔥',
    category: 'machines',
    price: 200,
    description: '烘焙类食物加工：面包、烤肉等'
  },
  {
    id: 'machine_boiler',
    name: '锅炉',
    icon: '🍲',
    category: 'machines',
    price: 250,
    description: '煮汤、制作奶酪、果酱'
  },
  {
    id: 'machine_juicer',
    name: '榨汁机',
    icon: '🧃',
    category: 'machines',
    price: 300,
    description: '水果 → 果汁'
  },
  {
    id: 'machine_grinder',
    name: '研磨机',
    icon: '⚙️',
    category: 'machines',
    price: 350,
    description: '小麦 → 面粉'
  },
  {
    id: 'machine_mixer',
    name: '搅拌机',
    icon: '🥣',
    category: 'machines',
    price: 400,
    description: '制作蛋糕、饼干'
  },

  // ========== 动物用品 ==========
  {
    id: 'animal_chicken',
    name: '小鸡',
    icon: '🐔',
    category: 'animals',
    price: 50,
    description: '5游戏天长大，产蛋'
  },
  {
    id: 'animal_cow',
    name: '小牛',
    icon: '🐄',
    category: 'animals',
    price: 100,
    description: '10游戏天长大，产奶'
  },
  {
    id: 'animal_sheep',
    name: '小羊',
    icon: '🐑',
    category: 'animals',
    price: 80,
    description: '8游戏天长大，产毛'
  },
  {
    id: 'animal_pig',
    name: '小猪',
    icon: '🐷',
    category: 'animals',
    price: 70,
    description: '7游戏天长大，出售猪肉'
  },
  {
    id: 'animal_feed',
    name: '动物饲料',
    icon: '🌾',
    category: 'animals',
    price: 2,
    description: '喂养动物',
    stackSize: 10
  },
  {
    id: 'animal_hay',
    name: '干草',
    icon: '🌿',
    category: 'animals',
    price: 1,
    description: '动物食物',
    stackSize: 10
  },
  {
    id: 'facility_chicken_coop',
    name: '鸡舍',
    icon: '🏠',
    category: 'animals',
    price: 150,
    description: '最多养5只鸡'
  },
  {
    id: 'facility_barn',
    name: '牛棚',
    icon: '🏚️',
    category: 'animals',
    price: 200,
    description: '最多养3头牛'
  },

  // ========== 装饰物品 ==========
  {
    id: 'decor_table',
    name: '桌子',
    icon: '🪑',
    category: 'decorations',
    price: 20,
    description: '家具装饰'
  },
  {
    id: 'decor_chair',
    name: '椅子',
    icon: '💺',
    category: 'decorations',
    price: 15,
    description: '可以坐的椅子'
  },
  {
    id: 'decor_bed',
    name: '床',
    icon: '🛏️',
    category: 'decorations',
    price: 50,
    description: '睡觉恢复体力'
  },
  {
    id: 'decor_flowerpot',
    name: '花盆',
    icon: '🪴',
    category: 'decorations',
    price: 10,
    description: '种植装饰花卉'
  },
  {
    id: 'decor_painting',
    name: '画',
    icon: '🖼️',
    category: 'decorations',
    price: 25,
    description: '墙面装饰'
  },

  // ========== 特殊物品 ==========
  {
    id: 'special_fertilizer',
    name: '肥料',
    icon: '💩',
    category: 'special',
    price: 10,
    description: '加速作物生长50%',
    stackSize: 5
  },
  {
    id: 'special_expansion',
    name: '扩建许可证',
    icon: '📜',
    category: 'special',
    price: 500,
    description: '扩大农场土地面积'
  },

  // ========== 树苗 ==========
  {
    id: 'apple',
    name: '苹果树苗',
    icon: '🍎',
    category: 'trees',
    price: 30,
    description: '20游戏天成熟，每5天收获8个'
  },
  {
    id: 'orange',
    name: '橙子树苗',
    icon: '🍊',
    category: 'trees',
    price: 35,
    description: '25游戏天成熟，每6天收获10个'
  },
  {
    id: 'peach',
    name: '桃树苗',
    icon: '🍑',
    category: 'trees',
    price: 40,
    description: '22游戏天成熟，每5天收获6个'
  },
  {
    id: 'cherry',
    name: '樱桃树苗',
    icon: '🍒',
    category: 'trees',
    price: 50,
    description: '18游戏天成熟，每4天收获5个'
  },
  {
    id: 'pear',
    name: '梨树苗',
    icon: '🍐',
    category: 'trees',
    price: 38,
    description: '24游戏天成熟，每6天收获9个'
  }
]

// ==================== 可出售商品 ====================

export interface SellableItem {
  id: string
  name: string
  icon: string
  category: 'crops' | 'processed_food' | 'animal_products' | 'minerals' | 'fruits'
  price: number // 收购价
  description: string
}

/**
 * 可出售商品列表（玩家卖给商店）
 */
export const SELLABLE_ITEMS: SellableItem[] = [
  // ========== 农产品 ==========
  {
    id: 'crop_carrot',
    name: '胡萝卜',
    icon: '🥕',
    category: 'crops',
    price: 10,
    description: '新鲜收获的胡萝卜'
  },
  {
    id: 'crop_wheat',
    name: '小麦',
    icon: '🌾',
    category: 'crops',
    price: 8,
    description: '金黄的小麦'
  },
  {
    id: 'crop_potato',
    name: '土豆',
    icon: '🥔',
    category: 'crops',
    price: 15,
    description: '大个土豆'
  },
  {
    id: 'crop_tomato',
    name: '番茄',
    icon: '🍅',
    category: 'crops',
    price: 12,
    description: '红彤彤的番茄'
  },
  {
    id: 'crop_pumpkin',
    name: '南瓜',
    icon: '🎃',
    category: 'crops',
    price: 150,
    description: '超大的南瓜！'
  },

  // ========== 加工食品（高价值！） ==========
  {
    id: 'food_bread',
    name: '面包',
    icon: '🍞',
    category: 'processed_food',
    price: 30,
    description: '用烤箱烘焙的面包'
  },
  {
    id: 'food_cake',
    name: '蛋糕',
    icon: '🍰',
    category: 'processed_food',
    price: 50,
    description: '用搅拌机制作的蛋糕'
  },
  {
    id: 'food_soup',
    name: '汤品',
    icon: '🍲',
    category: 'processed_food',
    price: 40,
    description: '用锅炉煮的汤'
  },
  {
    id: 'food_juice',
    name: '果汁',
    icon: '🧃',
    category: 'processed_food',
    price: 25,
    description: '用榨汁机制作的果汁'
  },
  {
    id: 'food_cheese',
    name: '奶酪',
    icon: '🧀',
    category: 'processed_food',
    price: 40,
    description: '用牛奶制作的奶酪'
  },
  {
    id: 'food_pizza',
    name: '披萨',
    icon: '🍕',
    category: 'processed_food',
    price: 60,
    description: '高级料理！'
  },
  {
    id: 'food_flour',
    name: '面粉',
    icon: '🌾',
    category: 'processed_food',
    price: 15,
    description: '用研磨机研磨的面粉'
  },

  // ========== 动物产品 ==========
  {
    id: 'animal_egg',
    name: '鸡蛋',
    icon: '🥚',
    category: 'animal_products',
    price: 5,
    description: '新鲜鸡蛋'
  },
  {
    id: 'animal_milk',
    name: '牛奶',
    icon: '🥛',
    category: 'animal_products',
    price: 8,
    description: '新鲜牛奶'
  },
  {
    id: 'animal_wool',
    name: '羊毛',
    icon: '🧶',
    category: 'animal_products',
    price: 10,
    description: '柔软的羊毛'
  },
  {
    id: 'animal_meat',
    name: '猪肉',
    icon: '🥓',
    category: 'animal_products',
    price: 50,
    description: '优质猪肉'
  },

  // ========== 水果 ==========
  {
    id: 'fruit_apple',
    name: '苹果',
    icon: '🍎',
    category: 'fruits',
    price: 5,
    description: '新鲜的苹果'
  },
  {
    id: 'fruit_orange',
    name: '橙子',
    icon: '🍊',
    category: 'fruits',
    price: 6,
    description: '甜美的橙子'
  },
  {
    id: 'fruit_peach',
    name: '桃子',
    icon: '🍑',
    category: 'fruits',
    price: 8,
    description: '多汁的桃子'
  },
  {
    id: 'fruit_cherry',
    name: '樱桃',
    icon: '🍒',
    category: 'fruits',
    price: 12,
    description: '昂贵的樱桃'
  },
  {
    id: 'fruit_pear',
    name: '梨',
    icon: '🍐',
    category: 'fruits',
    price: 7,
    description: '清甜的梨'
  },

  // ========== 矿物资源 ==========
  {
    id: 'mineral_stone',
    name: '石头',
    icon: '🪨',
    category: 'minerals',
    price: 3,
    description: '普通石头'
  },
  {
    id: 'mineral_coal',
    name: '煤炭',
    icon: '⚫',
    category: 'minerals',
    price: 5,
    description: '燃料'
  },
  {
    id: 'mineral_iron',
    name: '铁矿石',
    icon: '🔩',
    category: 'minerals',
    price: 10,
    description: '铁矿石'
  },
  {
    id: 'mineral_gold',
    name: '金矿石',
    icon: '📀',
    category: 'minerals',
    price: 20,
    description: '金矿石'
  },
  {
    id: 'mineral_diamond',
    name: '钻石',
    icon: '💎',
    category: 'minerals',
    price: 100,
    description: '稀有的钻石！'
  }
]

// ==================== 分类配置 ====================

/**
 * 购买分类配置
 */
export const BUY_CATEGORIES = [
  { id: 'materials', name: '🏠 建筑材料', color: '#DEB887' },
  { id: 'tools', name: '🔨 工具', color: '#A0522D' },
  { id: 'machines', name: '⚙️ 机器设备', color: '#4682B4' },
  { id: 'animals', name: '🐄 动物用品', color: '#FFB6C1' },
  { id: 'decorations', name: '🎨 装饰物品', color: '#DDA0DD' },
  { id: 'trees', name: '🌳 树苗', color: '#228B22' },
  { id: 'special', name: '⭐ 特殊物品', color: '#FFD700' }
]

/**
 * 出售分类配置
 */
export const SELL_CATEGORIES = [
  { id: 'crops', name: '🥕 农产品', color: '#FFA500' },
  { id: 'processed_food', name: '🍞 加工食品', color: '#D2691E' },
  { id: 'animal_products', name: '🥛 动物产品', color: '#FFB6C1' },
  { id: 'fruits', name: '🍎 水果', color: '#FF6347' },
  { id: 'minerals', name: '⛏️ 矿物资源', color: '#808080' }
]

/**
 * 根据分类获取可购买商品
 */
export function getBuyableItemsByCategory(category: string): BuyableItem[] {
  return BUYABLE_ITEMS.filter(item => item.category === category)
}

/**
 * 根据分类获取可出售商品
 */
export function getSellableItemsByCategory(category: string): SellableItem[] {
  return SELLABLE_ITEMS.filter(item => item.category === category)
}
