// ============================================================
// 游戏状态类型定义
// 来源：docs/PRD.md 第9.2节
// ============================================================

// ------------------------------------------------------------
// 1. 游戏状态
// ------------------------------------------------------------
export interface GameState {
  // 玩家数据
  player: {
    id: string;                // 用户ID
    name: string;              // 玩家名称
    gold: number;              // 金币
    energy: number;            // 当前体力
    maxEnergy: number;         // 最大体力
    level: number;             // 等级
    experience: number;        // 经验值
  };

  // 背包数据
  inventory: {
    items: InventoryItem[];    // 物品列表
    capacity: number;          // 背包容量
  };

  // 农场数据
  farm: {
    plots: FarmPlot[];         // 土地列表
    animals: Animal[];         // 动物列表
  };

  // 世界数据
  world: {
    day: number;               // 当前天数
    season: Season;            // 季节
    time: number;              // 当前时间 (0-24)
    weather: Weather;          // 天气
  };

  // 任务数据
  quests: {
    active: Quest[];           // 进行中的任务
    completed: string[];       // 已完成的任务ID
  };

  // NPC关系
  relationships: {
    [npcId: string]: {
      heartLevel: number;      // 好感度等级 (0-10)
      points: number;          // 好感度点数 (0-100)
      lastGiftDate: string;    // 上次送礼日期
    };
  };

  // 解锁内容
  unlocked: {
    crops: string[];           // 已解锁作物
    animals: string[];         // 已解锁动物
    areas: string[];           // 已解锁区域
  };

  // 元数据
  metadata: {
    saveId: string;            // 存档ID
    saveName: string;          // 存档名称
    playTime: number;          // 游戏时长（秒）
    lastSaved: string;         // 上次保存时间
  };
}

// ------------------------------------------------------------
// 2. 物品
// ------------------------------------------------------------
export interface InventoryItem {
  id: string;
  type: 'seed' | 'crop' | 'product' | 'tool';
  itemId: string;              // 物品ID（对应cropData等）
  quantity: number;
  quality?: number;            // 品质（1-3星，可选）
}

// ------------------------------------------------------------
// 3. 土地
// ------------------------------------------------------------
export interface FarmPlot {
  id: string;
  position: { x: number; y: number };
  state: 'wild' | 'tilled' | 'planted' | 'watered';
  crop?: {
    type: string;              // 作物类型（'carrot', 'potato'等）
    daysUntilMature: number;   // 剩余天数（带小数，如2.5）
    growthStage: number;       // 当前生长阶段 (0-4)
    isMature: boolean;         // 是否成熟
    isWateredToday: boolean;   // 今天是否浇水
    plantedDay: number;        // 种植的日期
  };
}

// ------------------------------------------------------------
// 4. 动物
// ------------------------------------------------------------
export interface Animal {
  id: string;
  type: 'chicken' | 'cow';
  name: string;
  age: number;                 // 年龄（天）
  happiness: number;           // 快乐值 (0-100)
  lastFed: string;             // 上次喂养日期
  productReady: boolean;       // 产品是否可收集
}

// ------------------------------------------------------------
// 5. 任务
// ------------------------------------------------------------
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'harvest' | 'plant' | 'earn' | 'social';
  objectives: QuestObjective[];
  rewards: {
    gold?: number;
    items?: { itemId: string; quantity: number }[];
    unlocks?: string[];        // 解锁内容
  };
  status: 'active' | 'completed';
  progress: number;            // 进度 (0-100)
  startDate: string;
}

export interface QuestObjective {
  type: string;
  target: string;              // 目标（如'carrot'）
  current: number;
  required: number;
}

// ------------------------------------------------------------
// 6. 类型定义
// ------------------------------------------------------------
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'sunny' | 'rainy' | 'cloudy';

// ------------------------------------------------------------
// 7. 作物数据
// ------------------------------------------------------------
export interface CropData {
  id: string;
  name: string;
  type: 'basic' | 'economic' | 'longterm' | 'special';
  seedPrice: number;
  sellPrice: number;
  baseDays: number;            // 基础生长天数（不浇水）
  fastDays: number;            // 浇水后的生长天数
  growthStages: number;        // 生长阶段数
  seasons: Season[];           // 可种植季节
  regrowthDays?: number;       // 再生基础天数（草莓等）
  regrowthFastDays?: number;   // 再生浇水天数
  energyCost: number;          // 收获体力消耗
  description: string;
}

// ------------------------------------------------------------
// 8. 用户认证相关
// ------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Session {
  access_token: string;
  user: User;
}
