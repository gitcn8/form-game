# 🎮 我的世界农场 3D - 设计文档

**项目名称**：我的世界农场 3D (Minecraft-style Farm 3D)
**文档版本**：v2.0
**创建日期**：2026-01-04
**技术栈**：React + Three.js + React Three Fiber
**最后更新**：2026-01-04

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [已实现功能](#2-已实现功能)
3. [待实现功能](#3-待实现功能)
4. [技术架构](#4-技术架构)
5. [组件拆分设计](#5-组件拆分设计)
6. [数据结构设计](#6-数据结构设计)
7. [操作指南](#7-操作指南)
8. [开发路线图](#8-开发路线图)

---

## 1. 项目概述

### 1.1 项目定位

**游戏类型**：3D 第一人称农场 + 挖矿模拟游戏
**技术风格**：Minecraft 风格（方块体素）
**目标平台**：Web 浏览器（桌面优先）
**视觉风格**：方块化 3D 世界

### 1.2 核心玩法

```
耕种循环：开垦土地 → 播种 → 浇水 → 收获 → 出售 → 购买材料
挖矿循环：向下挖掘 → 发现矿石 → 收集资源 → 建造房屋
建造循环：购买/收集材料 → 方块建造 → 设计房屋
```

### 1.3 与原 PRD 的区别

| 维度 | 原 PRD (2D) | 当前实现 (3D) |
|------|------------|--------------|
| **视角** | 2D 俯视 | 第一人称/第三人称 |
| **技术** | Phaser 3 | Three.js + React Three Fiber |
| **移动** | 鼠标点击 | WASD + 鼠标 |
| **世界** | 固定场景 | 开放 3D 世界 |
| **建造** | 无 | 方块建造系统 |
| **挖矿** | 无 | 地下挖掘系统 |

---

## 2. 已实现功能

### ✅ 基础系统

#### 2.1.1 玩家控制系统
- [x] **第一人称视角**：PointerLockControls 鼠标控制视角
- [x] **第三人称视角**：V键切换，看到玩家模型
- [x] **WASD 移动**：流畅移动，带阻尼效果
- [x] **方向键移动**：支持上下左右箭头键
- [x] **边界限制**：限制在 50x50 区域内

#### 2.1.2 玩家模型
- [x] **火柴盒人设计**：方块化角色
- [x] **自定义颜色**：C键打开颜色面板
  - 头部颜色
  - 身体颜色
  - 四肢颜色
- [x] **四肢摆动动画**：移动时前后摆动
- [x] **头部晃动**：步行时相机上下晃动
- [x] **脚步声**：Web Audio API 生成脚步音效

### ✅ 农场系统

#### 2.2.1 农田管理
- [x] **动态地块系统**：全图任意位置可开垦
- [x] **地块对齐**：1x1 网格对齐（简化计算）
- [x] **地块状态**：
  - empty（未开垦，草绿色）
  - tilled（已开垦，深棕色）
  - watered（已浇水，深褐色）
  - planted（已种植）
  - ready（可收获）
- [x] **3D 作物**：胡萝卜作物
  - 小苗阶段（2片叶子）
  - 成熟阶段（橙色萝卜 + 绿叶）
  - 每块地 4 根胡萝卜
  - 10秒成熟（测试用）

#### 2.2.2 工具系统
- [x] **工具切换**：数字键 1-4
  - 1：锄头（开垦）
  - 2：水壶（浇水）
  - 3：种子（播种）
  - 4：镰刀（收获）
- [x] **HUD 显示**：当前工具、提示信息

### ✅ 物品系统

#### 2.3.1 掉落物品
- [x] **3D 物品模型**：掉落在地上的胡萝卜
- [x] **自动拾取**：靠近 1.5 单位自动捡起
- [x] **收获掉落**：每块地掉落 4 根胡萝卜

#### 2.3.2 背包系统（简化版）
- [x] **B键打开背包**：查看物品
- [x] **胡萝卜存储**：显示数量
- [x] **出售功能**：
  - 出售 1 个
  - 全部出售
  - 单价：10 金币
- [x] **丢掉功能**：将物品丢回地面
- [x] **金币系统**：初始 50 金币

### ✅ 建造系统

#### 2.4.1 方块建造
- [x] **F键切换建造模式**
- [x] **材料选择**：数字键 5-7
  - 5：木头
  - 6：石头
  - 7：泥土
- [x] **方块预览**：半透明预览方块跟随视线
- [x] **左键放置**：对齐到 1x1 网格
- [x] **点击移除**：点击已放置方块拆除
- [x] **材料检查**：材料不足时提示
- [x] **初始房屋**：38 个木头的简陋房屋（3x3x3）
  - 位置：出生点附近
  - 地板、墙壁、屋顶完整

#### 2.4.2 商店系统
- [x] **U键打开商店**
- [x] **材料购买**：
  - 木头：5 金币/个
  - 石头：8 金币/个
  - 泥土：3 金币/个
- [x] **购买选项**：买 1 个 / 买 10 个
- [x] **金币检查**：不足时提示
- [x] **库存显示**：当前拥有数量

### ✅ 环境系统

#### 2.5.1 场景元素
- [x] **大型草地**：100x100 绿色地面
- [x] **路径**：土色道路
- [x] **房屋**：3 个预设房屋
  - 位置：[13,0,0], [-13,0,0], [13,0,-13]
- [x] **树木**：11 棵树，可砍伐
- [x] **天空盒**：Sky 组件（蓝天白云）

#### 2.5.2 树木砍伐
- [x] **点击砍伐**：获得 3-5 个木材
- [x] **树木重生**：5 秒后重新出现

### ✅ UI 系统

#### 2.6.1 界面设计
- [x] **准心**：屏幕中央圆形准心
- [x] **顶部 HUD**：显示消息、当前工具、建造模式
- [x] **底部工具栏**：工具快捷切换（1-4）
- [x] **视角指示器**：显示当前视角（第一/第三人称）
- [x] **引导面板**：ESC 键打开，显示操作说明
- [x] **颜色面板**：C键打开，自定义玩家颜色
- [x] **背包界面**：B键打开，查看/出售/丢弃物品
- [x] **商店界面**：U键打开，购买材料

#### 2.6.2 交互优化
- [x] **暂停菜单**：打开面板时自动解锁鼠标
- [x] **多面板管理**：ESC 关闭面板优先级
- [x] **悬停提示**：方块悬停时高亮

---

## 3. 待实现功能

### 🔲 挖矿系统（优先级：⭐⭐⭐⭐⭐）

#### 3.1.1 世界方块系统
- [ ] **地下层生成**：
  - y=-1 到 y=-10（10层地下）
  - y=-10 为基岩层（不可破坏）
  - 矿石随机分布
  - 动态生成（玩家周围区域）

- [ ] **矿石类型**：
  | 矿石 | 颜色 | 分布层 | 稀有度 | 用途 |
  |------|------|--------|--------|------|
  | 泥土 | #8B6914 | y=-1 | 常见 | 建造 |
  | 石头 | #808080 | y=-2 到 -3 | 常见 | 建造 |
  | 煤矿 | #2C2C2C | y=-4 到 -5 | 较常见 | 燃料 |
  | 铁矿 | #A0522D | y=-6 到 -7 | 中等 | 工具 |
  | 金矿 | #FFD700 | y=-8 到 -9 | 稀有 | 贸易 |
  | 钻石 | #00CED1 | y=-10 | 极稀有 | 终极目标 |

#### 3.1.2 挖掘机制
- [ ] **右键长按挖掘**：按住右键挖掘方块
- [ ] **挖掘时间**：
  - 泥土：1 秒
  - 石头：2 秒
  - 煤矿：3 秒
  - 铁矿：4 秒
  - 金矿：5 秒
  - 钻石：8 秒
  - 基岩：不可挖掘
- [ ] **工具影响**：
  - 镐子：挖掘石头/矿石
  - 铁锹：挖掘泥土
  - 徒手：挖掘速度 50%
- [ ] **挖掘进度条**：屏幕中央显示进度

#### 3.1.3 方块掉落
- [ ] **掉落物系统**：
  - 石头掉落：石头
  - 煤矿掉落：煤炭
  - 铁矿掉落：铁矿石
  - 金矿掉落：金矿石
  - 钻石掉落：钻石
- [ ] **自动拾取**：靠近自动捡起
- [ ] **经验值系统**（可选）：挖矿获得经验

### 🔲 完整背包系统（优先级：⭐⭐⭐⭐）

#### 3.2.1 物品堆叠
- [ ] **堆叠上限**：
  | 物品类型 | 堆叠上限 |
  |---------|---------|
  | 方块（木头、石头、泥土） | 64 |
  | 矿石（煤、铁、金、钻石） | 64 |
  | 作物（胡萝卜） | 64 |
  | 工具 | 1（不可堆叠） |

#### 3.2.2 快捷栏系统
- [ ] **8 个快捷槽位**：数字键 1-8
- [ ] **快捷栏 UI**：
  - 底部横向排列
  - 高亮选中槽位
  - 显示物品图标和数量
- [ ] **物品使用**：
  - 左键：选中
  - 右键：使用

#### 3.2.3 背包主界面
- [ ] **28 个槽位**：4 行 7 列
- [ ] **物品分类**：
  - 方块
  - 矿石
  - 作物
  - 工具
- [ ] **拖拽移动**：鼠标拖拽物品
- [ ] **Shift 点击**：快速移动到背包

### 🔲 工具系统（优先级：⭐⭐⭐）

#### 3.3.1 工具类型
- [ ] **镐子（Pickaxe）**：
  - 用途：挖掘石头、矿石
  - 材质：木制、石制、铁制、钻石
  - 耐久度：木(60)、石(130)、铁(250)、钻石(1560)
  - 效率：影响挖掘速度

- [ ] **铁锹（Shovel）**：
  - 用途：挖掘泥土、沙子、 gravel
  - 材质：木制、石制、铁制、钻石
  - 耐久度：同上
  - 效率：影响挖掘速度

- [ ] **斧头（Axe）**：
  - 用途：砍树（已实现，需添加耐久度）
  - 材质：木制、石制、铁制、钻石
  - 耐久度：同上

#### 3.3.2 工具耐久度
- [ ] **耐久度系统**：
  - 每次使用消耗 1 点耐久度
  - 耐久度归零时工具消失
  - HUD 显示当前工具耐久度
- [ ] **工具效率**：
  - 木制：1.0x（基准）
  - 石制：0.7x（快 30%）
  - 铁制：0.5x（快 50%）
  - 钻石：0.3x（快 70%）

#### 3.3.3 工具制作（可选）
- [ ] **工作台**：2x2 制作网格
- [ ] **制作配方**：
  - 木制镐子：3 木头 + 2 木棍
  - 石制镐子：3 石头 + 2 木棍
  - 铁制镐子：3 铁锭 + 2 木棍
  - 木棍：2 木头（竖向）

### 🔲 性能优化（优先级：⭐⭐⭐）

#### 3.4.1 方块渲染优化
- [ ] **视锥剔除**：只渲染视野内的方块
- [ ] **方块合并**：合并相同材质的方块
- [ ] **LOD 系统**：远距离降低细节

#### 3.4.2 世界生成优化
- [ ] **区块系统**：16x16x16 区块
- [ ] **动态加载**：玩家周围 3x3 区块
- [ ] **区块缓存**：已生成区块缓存

---

## 4. 技术架构

### 4.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18 | UI 框架 |
| **TypeScript** | 5.0+ | 类型安全 |
| **Three.js** | r150+ | 3D 渲染引擎 |
| **React Three Fiber** | 8.x | React 渲染器 |
| **@react-three/drei** | 最新 | 辅助组件（PointerLockControls、Sky） |
| **Vite** | 5.x | 构建工具 |
| **Web Audio API** | - | 音效生成 |

### 4.2 当前文件结构

```
form-game/
├── src/
│   ├── components/
│   │   └── game/          (待扩展)
│   ├── pages/
│   │   └── Test3DGame.tsx  (主游戏文件，1800+ 行)
│   ├── store/
│   │   └── gameStore.ts   (游戏状态)
│   └── main.tsx
├── docs/
│   ├── PRD.md             (原 2D 游戏设计)
│   ├── DEVELOPMENT.md     (开发流程)
│   ├── README.md          (项目说明)
│   └── 3D_GAME_DESIGN.md  (本文档)
└── package.json
```

### 4.3 问题与改进方向

**当前问题**：
- ❌ 所有代码集中在一个文件（1800+ 行）
- ❌ 组件职责不清
- ❌ 难以维护和扩展
- ❌ 性能优化困难

**改进方案**：
- ✅ 按功能拆分组件
- ✅ 清晰的职责划分
- ✅ 易于测试和优化
- ✅ 支持快速迭代

---

## 5. 组件拆分设计

### 5.1 新文件结构

```
src/
├── components/
│   ├── world/                    # 世界组件
│   │   ├── BlockTypes.ts         # 方块类型定义
│   │   ├── WorldBlock.tsx        # 世界方块组件
│   │   ├── FarmPlot.tsx          # 农田组件
│   │   └── Environment.tsx       # 环境（房屋、树木）
│   ├── player/                   # 玩家组件
│   │   ├── Player.tsx            # 玩家模型
│   │   └── FirstPersonController.tsx  # 控制器
│   ├── mining/                   # 挖矿系统
│   │   ├── OreGenerator.ts       # 矿石生成
│   │   ├── MiningSystem.tsx      # 挖矿系统
│   │   └── MiningProgressBar.tsx # 进度条UI
│   ├── inventory/                # 背包系统
│   │   ├── ItemStack.tsx         # 物品堆载数据结构
│   │   ├── Hotbar.tsx            # 快捷栏
│   │   └── Inventory.tsx         # 背包界面
│   ├── building/                 # 建造系统
│   │   ├── BlockPreview.tsx      # 方块预览
│   │   └── BuildingSystem.tsx    # 建造逻辑
│   └── ui/                       # UI 组件
│       ├── Shop.tsx              # 商店
│       ├── ColorPanel.tsx        # 颜色面板
│       └── PauseMenu.tsx         # 暂停菜单
├── pages/
│   └── Test3DGame.tsx            # 主场景（组装组件）
└── store/
    └── gameStore.ts              # 游戏状态
```

### 5.2 组件职责清单

#### 5.2.1 World 组件

**BlockTypes.ts**
```typescript
// 导出内容：
- materialColors: 颜色定义
- BLOCK_TYPES: 方块类型配置
- STACK_SIZES: 物品堆叠上限
- generateBlockAt(x, y, z): 矿石生成函数
```

**WorldBlock.tsx**
```typescript
// Props:
- position: [x, y, z]
- blockType: string
- onClick: 点击事件
- hovered: 悬停状态

// 功能：
- 显示不同颜色的方块
- 悬停高亮效果
- 点击触发挖掘
```

**FarmPlot.tsx**
```typescript
// Props:
- position, state, onClick
- 显示3D作物
- 颜色状态切换
```

**Environment.tsx**
```typescript
// 包含：
- House 组件
- Tree 组件（支持砍伐）
- 地面、路径
```

#### 5.2.2 Player 组件

**Player.tsx**
```typescript
// Props:
- position, rotation, visible, isMoving, colors

// 功能：
- 火柴盒人模型
- 四肢摆动动画
```

**FirstPersonController.tsx**
```typescript
// Props:
- onLockChange, cameraMode
- onPlayerPositionChange
- onPlayerRotationChange
- onMovingChange

// 功能：
- WASD/方向键移动
- 鼠标视角控制
- 头部晃动
- 脚步声播放
```

#### 5.2.3 Mining 组件

**OreGenerator.ts**
```typescript
// 导出函数：
- generateChunkBlocks(chunkX, chunkZ): 生成区块方块
- getBlockAt(x, y, z): 获取指定位置的方块类型
- shouldGenerateBlock(x, y, z): 判断是否需要生成方块
```

**MiningSystem.tsx**
```typescript
// Props:
- playerPosition
- worldBlocks: 世界方块Map
- onBlockMined: 挖掘完成回调
- onProgressChange: 进度变化回调

// 功能：
- 右键长按检测
- 挖掘进度计算
- 挖掘时间计算（基于工具）
```

**MiningProgressBar.tsx**
```typescript
// Props:
- progress: 0-100
- targetBlock: 方块类型
- isVisible: boolean

// 功能：
- 屏幕中央进度条
- 百分比显示
- 方块名称显示
```

#### 5.2.4 Inventory 组件

**ItemStack.tsx**
```typescript
// 接口定义：
interface ItemStack {
  id: string
  itemType: 'block' | 'tool' | 'item' | 'crop'
  blockType?: 'wood' | 'stone' | 'coal'...
  toolType?: 'pickaxe' | 'shovel'...
  material?: 'wood' | 'stone' | 'iron'...
  count: number
  maxStack: number
  durability?: number
  maxDurability?: number
}

// 导出工具函数：
- canStack(item1, item2)
- mergeStacks(stack1, stack2)
- splitStack(stack, count)
```

**Hotbar.tsx**
```typescript
// Props:
- slots: ItemStack[8]
- selectedSlot: number
- onSlotSelect
- onSlotUse

// 功能：
- 渲染8个快捷栏槽位
- 数字键1-8切换
- 显示物品图标和数量
```

**Inventory.tsx**
```typescript
// Props:
- inventory: InventoryData
- isVisible
- onClose
- onMoveItem
- onUseItem
- onDropItem

// 功能：
- 快捷栏区域（8槽）
- 背包主区域（28槽）
- 拖拽移动物品
- 右键使用/左键选择
- 金币显示
```

#### 5.2.5 Building 组件

**BlockPreview.tsx**
```typescript
// Props:
- buildMode, selectedMaterial
- placedBlocks
- maxDistance

// 功能：
- 半透明预览方块
- 跟随玩家视线
- 检测碰撞
```

**BuildingSystem.tsx**
```typescript
// Props:
- buildMode
- selectedMaterial
- placedBlocks
- onPlaceBlock
- onRemoveBlock

// 功能：
- 方块放置逻辑
- 方块移除逻辑
- 材料检查
```

#### 5.2.6 UI 组件

**Shop.tsx**
```typescript
// 商店界面（已实现，待迁移）
```

**ColorPanel.tsx**
```typescript
// 颜色设置面板（已实现，待迁移）
```

**PauseMenu.tsx**
```typescript
// 暂停菜单（已实现，待迁移）
```

---

## 6. 数据结构设计

### 6.1 方块数据

```typescript
interface BlockData {
  id: string           // 'x,y,z'
  type: string         // 'STONE', 'COAL_ORE'...
  position: [number, number, number]
}
```

### 6.2 背包数据

```typescript
interface InventoryData {
  hotbar: ItemStack[8]        // 快捷栏
  items: ItemStack[28]        // 背包主区域
  gold: number
}

interface ItemStack {
  id: string
  type: 'block' | 'tool' | 'item' | 'crop'
  itemType: string           // 'wood', 'coal_ore'...
  count: number
  maxStack: number
  durability?: number
  maxDurability?: number
}
```

### 6.3 工具数据

```typescript
interface Tool {
  id: string
  type: 'pickaxe' | 'shovel' | 'axe' | 'hoe'
  material: 'wood' | 'stone' | 'iron' | 'diamond'
  durability: number
  maxDurability: number
  efficiency: number
}
```

### 6.4 世界数据

```typescript
interface WorldData {
  blocks: Map<string, BlockData>
  plots: Map<string, PlotData>
  placedBlocks: PlacedBlock[]
  droppedItems: DroppedItem[]
}
```

---

## 7. 操作指南

### 7.1 当前操作方式

| 按键 | 功能 |
|------|------|
| **W/A/S/D** | 移动角色 |
| **方向键** | 移动角色 |
| **鼠标** | 控制视角（第一人称） |
| **1-4** | 切换农场工具（锄头、水壶、种子、镰刀） |
| **5-7** | 切换建造材料（木头、石头、泥土） |
| **F** | 切换建造模式 |
| **V** | 切换第一/第三人称视角 |
| **C** | 打开颜色设置面板 |
| **B** | 打开背包 |
| **U** | 打开商店 |
| **ESC** | 暂停菜单 / 关闭面板 |
| **左键点击** | 操作（耕地/放置方块） |
| **点击树木** | 砍伐获得木材 |

### 7.2 未来操作方式

| 按键 | 功能 |
|------|------|
| **右键长按** | 挖掘方块（挖矿系统） |
| **1-8** | 快捷栏切换（背包系统） |
| **E** | 打开背包（或保持B键） |

---

## 8. 开发路线图

### Phase 1: 组件拆分（2-3小时）

**目标**：将现有代码拆分成独立组件

- [ ] 创建目录结构
- [ ] 拆分 BlockTypes.ts
- [ ] 拆分 WorldBlock.tsx
- [ ] 拆分 FarmPlot.tsx
- [ ] 拆分 Player.tsx
- [ ] 拆分 FirstPersonController.tsx
- [ ] 拆分 Environment.tsx
- [ ] 拆分 BuildingSystem 相关
- [ ] 拆分 UI 组件
- [ ] 更新主场景导入

**产出**：
- 清晰的组件结构
- 每个组件职责单一
- 便于后续开发

### Phase 2: 挖矿系统（3-4小时）

- [ ] 创建 OreGenerator.ts
- [ ] 实现矿石生成算法
- [ ] 创建 WorldBlock 组件
- [ ] 创建 MiningSystem.tsx
- [ ] 实现右键长按挖掘
- [ ] 创建 MiningProgressBar.tsx
- [ ] 集成到主场景

**产出**：
- 可以向下挖掘
- 发现矿石
- 获得资源

### Phase 3: 背包系统（4-5小时）

- [ ] 创建 ItemStack.tsx
- [ ] 定义物品数据结构
- [ ] 创建 Hotbar.tsx
- [ ] 重构 Inventory.tsx
- [ ] 实现物品堆叠逻辑
- [ ] 实现拖拽移动（可选）
- [ ] 集成到主场景

**产出**：
- 快捷栏系统
- 完整背包界面
- 物品堆叠

### Phase 4: 工具系统（2-3小时）

- [ ] 定义工具数据结构
- [ ] 实现工具耐久度
- [ ] 实现工具效率系统
- [ ] 添加工具制作（可选）
- [ ] 集成到挖掘系统

**产出**：
- 镐子挖掘更快
- 铁锹挖土更快
- 工具有耐久度

### Phase 5: 优化与测试（1-2小时）

- [ ] 性能优化（方块渲染）
- [ ] UI 动画
- [ ] 音效完善
- [ ] 测试所有功能

**产出**：
- 流畅的游戏体验
- 完整的功能闭环

---

## 9. 成功指标

### 9.1 功能完整性

**必须实现（MVP）**：
- ✅ 第一人称/第三人称切换
- ✅ 农场系统（开垦、播种、浇水、收获）
- ✅ 建造系统（方块放置、移除）
- ⭐ 挖矿系统（地下层、矿石）
- ⭐ 背包系统（堆叠、快捷栏）
- ⭐ 工具系统（耐久度、效率）

**期望实现**：
- ⭐⭐ 工具制作系统
- ⭐⭐ 更多矿石类型
- ⭐⭐ 多人联机（远期）

### 9.2 性能指标

**技术指标**：
- 加载时间 < 3秒
- 游戏帧率 ≥ 60 FPS（桌面端）
- 内存占用 < 500MB
- 方块渲染数量 ≥ 10000（周围）

### 9.3 用户体验指标

**可用性**：
- 新手5分钟内理解基本操作
- 操作反馈及时（< 100ms）
- 错误提示友好

**稳定性**：
- 游戏崩溃率 < 1%
- 存档成功率 > 99%

---

## 10. 更新日志

| 版本 | 日期 | 修改内容 |
|-----|------|---------|
| v2.0 | 2026-01-04 | 创建3D版本设计文档，记录已实现和待实现功能 |
| v1.0 | 2026-01-01 | 原2D版本PRD |

---

**文档状态**：✅ 已完成，准备开始组件拆分

**下一步**：Phase 1 - 组件拆分
