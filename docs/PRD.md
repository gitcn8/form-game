# 🌾 农场主小游戏 - 产品需求文档 (PRD)

**项目名称**：农场主小游戏
**文档版本**：v1.1
**创建日期**：2026-01-01
**最后更新**：2026-01-01
**更新内容**：采用浇水加速生长机制（方案2）
**预计周期**：1个月（完整Demo）

---

## 目录

1. [产品概述](#1-产品概述)
2. [核心玩法](#2-核心玩法)
3. [功能范围](#3-功能范围)
4. [游戏系统](#4-游戏系统)
5. [操作方式](#5-操作方式)
6. [UI设计](#6-ui设计)
7. [音频系统](#7-音频系统)
8. [技术架构](#8-技术架构)
9. [数据库设计](#9-数据库设计)
10. [开发计划](#10-开发计划)
11. [成功指标](#11-成功指标)

---

## 1. 产品概述

### 1.1 项目定位

**游戏类型**：模拟经营 + 任务驱动的农场游戏
**目标平台**：网页（响应式，支持桌面和移动端浏览器）
**视觉风格**：卡通风/矢量风
**美术资源**：AI生成素材
**商业模式**：免费游戏 + 可选内购（后期扩展）

### 1.2 目标用户

- **主要用户**：18-35岁，喜欢休闲模拟经营游戏
- **游戏偏好**：星露谷物语、动森类、农场经营类游戏
- **使用场景**：碎片时间（10-30分钟/次）
- **设备**：办公电脑（午休）、家中电脑、手机/平板

### 1.3 核心价值

- **轻松休闲**：压力小的种田体验
- **任务驱动**：明确的目标和进度感
- **跨设备同步**：随时随地在任何设备继续游戏
- **社交互动**：与NPC交流，建立好感度

---

## 2. 核心玩法

### 2.1 游戏目标

**任务驱动系统**：玩家通过完成NPC发布的任务来推进游戏进度，解锁新作物、新区域和新功能

### 2.2 核心循环

```
接受任务 → 耕种/养殖 → 收获农产品 → 出售赚钱/完成任务 → 解锁新内容 → 更多任务
```

### 2.3 游戏流程

**新手阶段（第1-3天）**：
- 学习基础操作（移动、耕地、播种、浇水）
- 完成新手引导任务
- 种植基础作物（萝卜、土豆）

**成长阶段（第4-14天）**：
- 解锁更多作物（草莓、南瓜）
- 解锁动物养殖（鸡、牛）
- 完成NPC任务，赚取金币

**成熟阶段（第15天+）**：
- 种植长期作物（果树）
- 扩充农场规模
- 完成高级任务，解锁特殊内容

---

## 3. 功能范围

### 3.1 第一版核心功能

#### 3.1.1 完整的耕种系统

**土地管理**：
- 土地状态：荒地 → 耕地 → 播种 → 生长中 → 成熟
- 土地属性：干燥/湿润（浇水后保持湿润24小时）
- 土地数量：初始6-16块可耕地

**种植流程**：
```
1. 选择锄头工具 → 点击荒地 → 变成耕地
2. 选择种子 → 点击耕地 → 播种完成
3. 选择水壶 → 点击耕地 → 土地变湿润
4. 等待作物生长（按天数计算）
5. 作物成熟 → 选择镰刀 → 点击收获 → 获得农产品
```

**作物类型**：

| 作物类型 | 代表作物 | 生长周期 | 特点 |
|---------|---------|---------|------|
| **基础作物** | 萝卜、土豆 | 3-4天 | 便宜、快速回报 |
| **经济作物** | 草莓、南瓜 | 1天/8天 | 高价值、每天收获/长期投资 |
| **长期作物** | 苹果树、橘子树 | 季节性 | 一次种植、持续收获 |
| **特殊作物** | 鲜花、草药 | 5-7天 | 用于送礼、恢复体力 |

**生长机制**（浇水加速系统）：
- 每种作物有基础生长天数和浇水后生长天数
- 每天游戏结束时（睡觉）结算生长进度
- 浇水加速生长：当天浇水则减少更多剩余天数
- 生长示例：萝卜基础3.5天，浇水后2.5天成熟（快30%）

**玩家体验示例**：
```
第1天：播种萝卜 → 浇水 → "还需2天"
第2天：浇水 → "还需1天"
第3天：浇水 → "✨已成熟！"（提前半天）
```

#### 3.1.2 基础动物养殖

**动物类型**：
- **鸡**：
  - 购买价格：100金币
  - 产品：鸡蛋（每天1个）
  - 售价：15金币/个
  - 需求：每天喂养（饲料成本5金币）

- **牛**：
  - 购买价格：500金币
  - 产品：牛奶（每天1瓶）
  - 售价：50金币/瓶
  - 需求：每天喂养（饲料成本20金币）

**养殖流程**：
```
1. 在商店购买动物幼崽
2. 放置到动物棚
3. 每天喂养（自动扣除饲料费用）
4. 收集产品（点击动物）
5. 产品可出售或完成任务
```

#### 3.1.3 NPC交互系统

**主要NPC**：

| NPC | 角色 | 功能 |
|-----|------|------|
| **老农夫汤姆** | 引导者 | 发布新手任务、教学 |
| **商人玛丽** | 商店老板 | 购买种子、出售农产品 |
| **村长艾伦** | 任务发布 | 发布主要剧情任务 |
| **花店女孩莉莉** | 社交 | 喜欢收到鲜花，解锁特殊种子 |

**交互内容**：
- 对话系统：每个NPC有对话树
- 任务系统：接受任务、完成条件、领取奖励
- 好感度系统：送礼增加好感度，解锁新内容

**好感度机制**：
- 好感度范围：0-100
- 好感度提升：送喜欢的礼物（+5-10）、完成任务（+10-20）
- 好感度奖励：
  - 20分：解锁特殊对话
  - 50分：解锁新种子/动物
  - 80分：解锁特殊任务
  - 100分：解锁隐藏内容

#### 3.1.4 商店系统

**商店功能**：
- 购买种子、动物幼崽
- 出售农产品
- 显示价格波动（每天随机±20%）

**物品清单**：

| 类别 | 物品 | 购买价格 | 出售价格 |
|-----|------|---------|---------|
| 种子 | 萝卜种子 | 10金币 | - |
| 种子 | 土豆种子 | 15金币 | - |
| 种子 | 草莓种子 | 50金币 | - |
| 种子 | 南瓜种子 | 30金币 | - |
| 种子 | 苹果树苗 | 200金币 | - |
| 动物 | 小鸡 | 100金币 | - |
| 动物 | 小牛 | 500金币 | - |
| 产品 | 萝卜 | - | 25金币 |
| 产品 | 土豆 | - | 35金币 |
| 产品 | 草莓 | - | 80金币 |
| 产品 | 南瓜 | - | 100金币 |
| 产品 | 鸡蛋 | - | 15金币 |
| 产品 | 牛奶 | - | 50金币 |

### 3.2 第二版功能（后续扩展）

- 成就系统（收获100个作物、赚够1000金币等）
- 图鉴系统（作物图鉴、动物图鉴）
- 天气系统（晴天、雨天影响浇水需求）
- 节日活动（特殊节日、限定作物）
- 多人互动（访问好友农场）

---

## 4. 游戏系统

### 4.1 时间系统

**时间流逝**：
- 1个游戏日 = 现实3-5分钟（可设置调整）
- 游戏内24小时制（6:00 - 22:00 可活动，22:00后强制睡觉）

**季节系统**：
- 1个季节 = 28个游戏日
- 4个季节：春、夏、秋、冬
- 不同季节有不同作物（春季：萝卜、草莓；秋季：南瓜、土豆）

**昼夜循环**：
- 视觉效果：早晨、中午、黄昏、夜晚
- 影响因素：某些作物只在白天生长
- 夜晚：玩家视野变小，UI变暗

**时间功能**：
- 作物生长：按天数计算，每天睡觉时结算（浇水加速）
- 动物产品每天刷新
- 商店价格每天变化

**作物生长结算**：
- 玩家睡觉结束当天时触发结算
- 检查每块土地的作物是否浇水
- 浇水作物减少更多天数（加速生长）
- 更新生长阶段，达到0天则成熟

### 4.2 存档系统

**自动存档**：
- 触发时机：
  - 每天游戏结束（睡觉时）
  - 重大操作后（收获作物、完成任务）
  - 每5分钟自动保存

**存档内容**：
- 玩家数据：金币、体力、等级
- 农场数据：每块土地状态、作物生长进度
- 背包数据：物品数量
- 任务数据：当前任务进度
- NPC数据：好感度、已解锁内容
- 世界数据：当前天数、季节

**存档位**：
- 3个存档位（可手动切换）
- 云端存储（自动同步到所有设备）
- 显示存档信息：天数、金币、游戏时间

### 4.3 经济系统

**金币来源**：
- 出售农产品
- 完成任务奖励
- NPC好感度奖励

**金币消耗**：
- 购买种子
- 购买动物
- 购买饲料
- 送礼给NPC

**经济平衡**：
- 初期：种子便宜，快速回收成本
- 中期：投资高价作物，扩大生产
- 后期：种植经济作物，追求高利润

**价格波动**：
- 每天随机波动±20%
- 特殊事件影响价格（节日涨价、丰收跌价）

### 4.4 体力系统

**体力值**：
- 初始体力：100点
- 消耗体力：
  - 耕地：-2点
  - 播种：-1点
  - 浇水：-1点
  - 收获：-2点
  - 喂养动物：-3点

**恢复体力**：
- 睡觉（每天结束）：恢复到100
- 吃食物（草药等）：恢复20-50点

**体力耗尽**：
- 强制结束当天
- 无法继续操作

---

## 5. 操作方式

### 5.1 桌面端操作

**键盘控制**：
- `W/A/S/D` 或 `方向键`：移动角色
- `空格键`：交互（确认、对话）
- `1-6` 数字键：快速切换工具
- `E` 键：打开背包
- `Q` 键：打开任务
- `ESC` 键：打开设置

**鼠标操作**：
- 左键点击地面：移动到目标位置
- 左键点击物体：交互
- 右键：取消当前操作
- 滚轮：缩放地图（可选）

### 5.2 移动端操作

**触屏控制**：
- 左下角：虚拟摇杆（移动）
- 右下角：交互按钮（确认）
- 右侧工具栏：工具切换按钮
- 点击屏幕：移动和交互

**手势操作**：
- 单指点击：移动/交互
- 双指缩放：缩放地图（可选）

### 5.3 操作适配

**响应式设计**：
```
检测设备类型：
- 桌面端 → 显示键盘提示、隐藏虚拟摇杆
- 移动端 → 显示虚拟摇杆、隐藏键盘提示
- 自动适配屏幕尺寸
```

---

## 6. UI设计

### 6.1 界面风格

**设计原则**：
- 卡通风格，圆角设计
- 色彩明亮、饱和度适中
- 图标简洁易懂
- 弹窗式菜单（不遮挡游戏画面）

### 6.2 核心界面

#### 6.2.1 HUD（固定显示）

**HUD布局**：
```
┌──────────────────────────────────────┐
│ 金币: 💰 1000  体力: ⚡ 80/100       │  ← 顶部栏
│                                      │
│                                      │
│                                      │  ← 游戏画面
│            [Phaser游戏层]             │
│                                      │
│                                      │
│ [工具栏: 锄头💱 种子🌱 水壶💧 镰刀⛏️]  │  ← 底部栏
└──────────────────────────────────────┘
```

**HUD元素**：
- 金币显示（左上角）
- 体力条（左上角）
- 时间/季节显示（右上角）
- 当前工具（底部/右侧）
- 任务提示（顶部，可关闭）

#### 6.2.2 弹窗界面

**商店界面**：
```
┌────────────── 商店 ──────────────┐
│                                   │
│  🌱 购买           💰 出售        │
│                                   │
│  ┌─────────┐  ┌─────────┐        │
│  │萝卜种子 │  │  土豆种子│        │
│  │  10金币 │  │  15金币 │        │
│  │ [购买-] │  │ [购买-] │        │
│  └─────────┘  └─────────┘        │
│                                   │
│  当前金币: 💰 1000                │
│                    [关闭]         │
└───────────────────────────────────┘
```

**背包界面**：
```
┌────────────── 背包 ──────────────┐
│                                   │
│  物品          数量       售价    │
│  ─────────────────────────────    │
│  🥕 萝卜        x10       25金币  │
│  🥔 土豆        x5        35金币  │
│  🍓 草莓        x3        80金币  │
│  🥚 鸡蛋        x8        15金币  │
│                                   │
│  [出售选定]     [关闭]           │
└───────────────────────────────────┘
```

**任务界面**：
```
┌────────────── 任务 ──────────────┐
│                                   │
│  进行中任务                       │
│  ─────────────────────────────    │
│  📋 新手农夫（1/3）               │
│     种植5个萝卜                   │
│     奖励: 100金币                 │
│                                   │
│  可用任务                         │
│  ─────────────────────────────    │
│  📋 第一次收获                    │
│     收获10个作物                  │
│     奖励: 200金币 + 草莓种子      │
│                                   │
│  [关闭]                           │
└───────────────────────────────────┘
```

**设置界面**：
```
┌────────────── 设置 ──────────────┐
│                                   │
│  🔊 音量                          │
│  ├─ 背景音乐  ████████░░ 80%     │
│  └─ 音效      ██████████ 100%    │
│                                   │
│  ⚙️ 游戏设置                      │
│  ├─ 游戏速度: [正常 ▼]            │
│  ├─ 自动存档: [开启]              │
│  └─ 语言: [简体中文 ▼]           │
│                                   │
│  💾 存档管理                      │
│  ├─ 存档1: 第5天 💰500            │
│  ├─ 存档2: 第12天 💰1200 [当前]   │
│  └─ 存档3: 空                     │
│                                   │
│  [退出登录]      [关闭]           │
└───────────────────────────────────┘
```

#### 6.2.3 登录/注册界面

**登录界面**：
```
┌───────────────────────────────────┐
│                                   │
│       🌾 农场主小游戏              │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  邮箱                       │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  密码                       │  │
│  └─────────────────────────────┘  │
│                                   │
│        [登录]    [注册]           │
│                                   │
│  忘记密码？                        │
└───────────────────────────────────┘
```

### 6.3 移动端适配

**响应式布局**：
```
桌面端 (>768px):
- 弹窗宽度: 600px
- HUD: 固定顶部和底部
- 工具栏: 横向排列

移动端 (<768px):
- 弹窗宽度: 90% 屏幕
- HUD: 紧凑布局
- 工具栏: 竖向排列
- 虚拟摇杆: 固定左下角
```

---

## 7. 音频系统

### 7.1 背景音乐（BGM）

**音乐列表**：

| 场景 | 音乐风格 | 时长 | 循环 |
|-----|---------|------|------|
| **游戏主界面** | 轻松田园风 | 2:30 | 是 |
| **农场白天** | 愉快明亮 | 3:00 | 是 |
| **农场夜晚** | 安静舒缓 | 2:00 | 是 |
| **商店** | 热闹商业 | 1:45 | 是 |
| **任务完成** | 欢快庆祝 | 0:30 | 否 |

**音乐特性**：
- 格式：MP3 / OGG
- 音质：128 kbps（平衡大小和质量）
- 音量：可调节（0-100%）

### 7.2 音效（SFX）

**操作音效**：

| 操作 | 音效描述 |
|-----|---------|
| 耕地 | 锄头入土声 "沙沙" |
| 播种 | 种子落地声 "啵" |
| 浇水 | 水流声 "哗啦" |
| 收获 | 采摘声 "清脆响声" |
| 购买 | 金币声 "叮" |
| 出售 | 交易声 "收银声" |
| 任务完成 | 胜利音效 "欢呼" |
| 错误操作 | 警告声 "咚" |

**环境音效**：
- 鸟叫声（白天）
- 蟋蟀声（夜晚）
- 动物叫声（鸡叫、牛叫）

**音效特性**：
- 格式：WAV / OGG（短音效）
- 时长：0.5-2秒
- 可独立调节音量

### 7.3 音频控制

**设置选项**：
- 背景音乐：开/关 + 音量调节
- 音效：开/关 + 音量调节
- 静音模式（一键关闭所有声音）

**优化**：
- 音频预加载（减少加载时间）
- 音频压缩（减小文件大小）
- 移动端自动降低音质（节省流量）

---

## 8. 技术架构

### 8.1 技术栈

#### 8.1.1 前端技术

| 技术 | 版本 | 用途 |
|-----|------|------|
| **React** | 18 | UI框架 |
| **Phaser** | 3.60+ | 游戏引擎 |
| **TypeScript** | 5.0+ | 类型安全 |
| **Vite** | 5.0+ | 构建工具 |
| **Zustand** | 4.0+ | 状态管理 |
| **Ant Design** | 5.0+ | UI组件库 |
| **TailwindCSS** | 3.0+ | 样式框架 |
| **React Router** | 6.0+ | 路由管理 |

#### 8.1.2 后端技术（Supabase）

| 技术 | 用途 |
|-----|------|
| **Supabase Auth** | 用户认证（注册/登录） |
| **PostgreSQL** | 云数据库 |
| **Supabase RESTful API** | 数据接口 |
| **Supabase Realtime** | 实时同步 |
| **Row Level Security** | 数据安全 |
| **Supabase Storage** | 文件存储（可选） |

#### 8.1.3 部署平台

| 平台 | 用途 | 费用 |
|-----|------|------|
| **Vercel** | 前端托管 | 免费 |
| **Supabase Cloud** | 后端托管 | 免费（500MB） |

### 8.2 系统架构

```
┌─────────────────────────────────────────┐
│         前端（用户浏览器）                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     React UI 组件层              │   │
│  │  - 登录界面                      │   │
│  │  - HUD（金币、体力）              │   │
│  │  - 弹窗（商店、背包、任务）       │   │
│  └─────────────────────────────────┘   │
│              ↕ (Zustand)                │
│  ┌─────────────────────────────────┐   │
│  │    状态管理层                    │   │
│  │  - Auth Store (用户状态)         │   │
│  │  - Game Store (游戏状态)         │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │    Phaser 游戏层                 │   │
│  │  - MainScene (主场景)            │   │
│  │  - Player (角色控制)             │   │
│  │  - FarmSystem (农场系统)         │   │
│  │  - TimeSystem (时间系统)         │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │    Supabase 客户端               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↕ HTTPS
┌─────────────────────────────────────────┐
│      后端（Supabase 云端）               │
├─────────────────────────────────────────┤
│  - 用户认证 (Auth)                       │
│  - PostgreSQL 数据库                     │
│  - RESTful API                          │
│  - 实时同步 (Realtime)                   │
│  - 数据安全 (RLS)                        │
└─────────────────────────────────────────┘
```

### 8.3 项目结构

```
form-game/
├── src/
│   ├── components/              # React UI组件
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── game/
│   │   │   ├── PhaserGame.tsx       # Phaser容器组件
│   │   │   ├── HUD.tsx              # 游戏HUD
│   │   │   ├── StoreModal.tsx       # 商店弹窗
│   │   │   ├── InventoryModal.tsx   # 背包弹窗
│   │   │   ├── QuestModal.tsx       # 任务弹窗
│   │   │   ├── SettingsModal.tsx    # 设置弹窗
│   │   │   └── VirtualJoystick.tsx  # 虚拟摇杆（移动端）
│   │   └── common/
│   │       ├── Layout.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── game/                    # Phaser游戏逻辑
│   │   ├── scenes/
│   │   │   ├── MainScene.ts          # 主游戏场景
│   │   │   ├── BootScene.ts          # 启动场景（加载资源）
│   │   │   └── UIScene.ts            # UI场景
│   │   ├── entities/
│   │   │   ├── Player.ts             # 玩家角色
│   │   │   ├── Crop.ts               # 作物
│   │   │   ├── Animal.ts             # 动物
│   │   │   └── FarmPlot.ts           # 农场土地
│   │   ├── systems/
│   │   │   ├── FarmSystem.ts         # 农场系统
│   │   │   ├── TimeSystem.ts         # 时间系统
│   │   │   ├── EconomySystem.ts      # 经济系统
│   │   │   └── QuestSystem.ts        # 任务系统
│   │   └── config/
│   │       ├── gameConfig.ts         # 游戏配置
│   │       └── cropData.ts           # 作物数据
│   │
│   ├── hooks/                   # 自定义Hooks
│   │   ├── useAuth.ts              # 认证相关
│   │   ├── useGameSave.ts          # 存档管理
│   │   ├── useGameState.ts         # 游戏状态
│   │   └── useResponsive.ts        # 响应式检测
│   │
│   ├── store/                   # Zustand状态管理
│   │   ├── authStore.ts
│   │   └── gameStore.ts
│   │
│   ├── lib/                     # 工具库
│   │   ├── supabase.ts             # Supabase客户端
│   │   ├── types.ts                # TypeScript类型定义
│   │   └── utils.ts                # 工具函数
│   │
│   ├── pages/                   # 页面组件
│   │   ├── Home.tsx                # 首页
│   │   ├── Login.tsx               # 登录页
│   │   ├── Register.tsx            # 注册页
│   │   └── Game.tsx                # 游戏主页面
│   │
│   ├── styles/                  # 样式文件
│   │   ├── globals.css
│   │   └── game.css
│   │
│   ├── assets/                  # 静态资源
│   │   ├── images/
│   │   ├── audio/
│   │   └── sprites/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── public/                      # 公共资源
│   ├── favicon.ico
│   └── index.html
│
├── supabase/                    # Supabase配置
│   ├── migrations/              # 数据库迁移
│   │   └── 001_initial_schema.sql
│   └── seed.sql                 # 初始数据
│
├── .env.example                 # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### 8.4 数据流架构

**状态管理流程**：

```
用户操作
  ↓
React UI 组件 / Phaser 事件
  ↓
Zustand Store (更新状态)
  ↓
触发副作用
  ↓
Supabase API 调用
  ↓
更新数据库
  ↓
返回结果
  ↓
更新 Store
  ↓
UI/游戏层自动响应更新
```

**示例：种植作物**

```typescript
// 1. 玩家点击土地（Phaser事件）
onClick(plot) {
  // 2. 更新游戏状态
  gameStore.plantSeed(plot.id, 'carrot')

  // 3. 触发保存
  useGameSave.getState().saveGameState(getState())
}

// 4. 自动保存到Supabase
// 5. 数据库更新
// 6. UI自动显示种子已种植
```

### 8.5 性能优化

**前端优化**：
- React.memo：组件记忆化
- 虚拟列表：背包物品过多时
- 懒加载：弹窗组件按需加载
- 代码分割：Vite自动分割

**游戏层优化**：
- 对象池：作物、动画复用
- 精灵图：减少HTTP请求
- 碰撞检测优化：只检测附近对象
- 渲染优化：只更新可视区域

**API优化**：
- 防抖：频繁操作延迟保存（3秒）
- 批量操作：一次API调用更新多个数据
- 缓存：本地缓存常用数据（作物价格等）

---

## 9. 数据库设计

### 9.1 核心数据表

#### 9.1.1 用户表（Supabase Auth 自动生成）

```sql
-- auth.users (Supabase内置表)
-- 字段:
-- - id: UUID (用户唯一标识)
-- - email: TEXT (邮箱)
-- - encrypted_password: TEXT (加密密码)
-- - created_at: TIMESTAMPTZ
-- - last_sign_in_at: TIMESTAMPTZ
```

#### 9.1.2 游戏存档表

```sql
CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  save_name TEXT DEFAULT '主存档',
  game_state JSONB NOT NULL,           -- 完整游戏状态
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true       -- 是否为当前使用的存档
);

-- 索引
CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_game_saves_is_active ON game_saves(is_active);

-- RLS策略
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的存档"
ON game_saves FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的存档"
ON game_saves FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的存档"
ON game_saves FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的存档"
ON game_saves FOR DELETE
USING (auth.uid() = user_id);
```

#### 9.1.3 玩家统计表

```sql
CREATE TABLE player_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_days INTEGER DEFAULT 0,           -- 总游戏天数
  total_earnings INTEGER DEFAULT 0,       -- 总收入
  crops_harvested INTEGER DEFAULT 0,      -- 收获作物数
  animals_owned INTEGER DEFAULT 0,        -- 拥有动物数
  quests_completed INTEGER DEFAULT 0,     -- 完成任务数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS策略
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的统计"
ON player_stats FOR ALL
USING (auth.uid() = user_id);
```

#### 9.1.4 排行榜表（后期扩展）

```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,                 -- 'wealth', 'harvest', 'quests'
  score INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_leaderboards_category ON leaderboards(category);
CREATE INDEX idx_leaderboards_score ON leaderboards(score DESC);

-- RLS策略
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可以查看排行榜"
ON leaderboards FOR SELECT
USING (true);

CREATE POLICY "用户只能创建自己的记录"
ON leaderboards FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 9.2 数据结构定义

#### 9.2.1 游戏状态结构

```typescript
// lib/types.ts

interface GameState {
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

// 物品
interface InventoryItem {
  id: string;
  type: 'seed' | 'crop' | 'product' | 'tool';
  itemId: string;              // 物品ID（对应cropData等）
  quantity: number;
  quality?: number;            // 品质（1-3星，可选）
}

// 土地
interface FarmPlot {
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

// 动物
interface Animal {
  id: string;
  type: 'chicken' | 'cow';
  name: string;
  age: number;                 // 年龄（天）
  happiness: number;           // 快乐值 (0-100)
  lastFed: string;             // 上次喂养日期
  productReady: boolean;       // 产品是否可收集
}

// 任务
interface Quest {
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

interface QuestObjective {
  type: string;
  target: string;              // 目标（如'carrot'）
  current: number;
  required: number;
}

// 季节
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

// 天气
type Weather = 'sunny' | 'rainy' | 'cloudy';
```

#### 9.2.2 作物数据配置

```typescript
// game/config/cropData.ts

interface CropData {
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
  regrowthFastDays?: number;   // 再生浇水后天数
  energyCost: number;          // 收获体力消耗
  description: string;
}

export const CROP_DATA: Record<string, CropData> = {
  // 基础作物
  carrot: {
    id: 'carrot',
    name: '萝卜',
    type: 'basic',
    seedPrice: 10,
    sellPrice: 25,
    baseDays: 3.5,             // 不浇水3.5天
    fastDays: 2.5,             // 浇水2.5天（快29%）
    growthStages: 4,
    seasons: ['spring', 'autumn'],
    energyCost: 2,
    description: '快速生长的基础作物'
  },
  potato: {
    id: 'potato',
    name: '土豆',
    type: 'basic',
    seedPrice: 15,
    sellPrice: 35,
    baseDays: 4.5,             // 不浇水4.5天
    fastDays: 3.5,             // 浇水3.5天（快22%）
    growthStages: 4,
    seasons: ['spring'],
    energyCost: 2,
    description: '口感丰富的根茎作物'
  },

  // 经济作物
  strawberry: {
    id: 'strawberry',
    name: '草莓',
    type: 'economic',
    seedPrice: 50,
    sellPrice: 80,
    baseDays: 5,               // 初次生长5天
    fastDays: 4,               // 浇水4天（快25%）
    growthStages: 4,
    seasons: ['spring'],
    regrowthDays: 1.5,         // 再生期1.5天
    regrowthFastDays: 1,       // 浇水后1天
    energyCost: 2,
    description: '每天都能收获的经济作物'
  },
  pumpkin: {
    id: 'pumpkin',
    name: '南瓜',
    type: 'economic',
    seedPrice: 30,
    sellPrice: 100,
    baseDays: 10,              // 不浇水10天
    fastDays: 7,               // 浇水7天（快30%）
    growthStages: 5,
    seasons: ['autumn'],
    energyCost: 3,
    description: '高价值的秋季作物'
  },

  // 长期作物
  apple_tree: {
    id: 'apple_tree',
    name: '苹果树',
    type: 'longterm',
    seedPrice: 200,
    sellPrice: 50,
    baseDays: 28,              // 不浇水28天
    fastDays: 21,              // 浇水21天（快25%）
    growthStages: 5,
    seasons: ['spring', 'summer'],
    regrowthDays: 10,
    regrowthFastDays: 7,
    energyCost: 1,
    description: '持续产出的果树'
  },

  // 特殊作物
  tulip: {
    id: 'tulip',
    name: '郁金香',
    type: 'special',
    seedPrice: 20,
    sellPrice: 40,
    baseDays: 6,
    fastDays: 5,               // 浇水加速不明显（花需要慢慢养）
    growthStages: 4,
    seasons: ['spring'],
    energyCost: 1,
    description: '美丽的鲜花，适合送礼'
  },
  herb: {
    id: 'herb',
    name: '草药',
    type: 'special',
    seedPrice: 30,
    sellPrice: 20,
    baseDays: 5,
    fastDays: 4,
    growthStages: 3,
    seasons: ['spring', 'summer', 'autumn'],
    energyCost: 1,
    description: '食用可恢复20点体力'
  }
};
```

**生长机制实现示例**：

```typescript
// 每天结算逻辑（玩家睡觉时）
function endDay() {
  gameStore.farm.plots.forEach(plot => {
    if (plot.crop && !plot.crop.isMature) {
      const cropData = CROP_DATA[plot.crop.type];

      // 计算今天减少的天数
      const daysPassed = plot.crop.isWateredToday
        ? cropData.fastDays / cropData.baseDays  // 浇水了，按快天数计算
        : 1.0;                                    // 没浇水，固定1天

      plot.crop.daysUntilMature -= daysPassed;

      // 更新生长阶段
      const progress = 1 - (plot.crop.daysUntilMature / cropData.baseDays);
      plot.crop.growthStage = Math.floor(
        progress * cropData.growthStages
      );

      // 判断成熟
      if (plot.crop.daysUntilMature <= 0) {
        plot.crop.isMature = true;
        plot.crop.daysUntilMature = 0;
      }

      // 重置浇水状态
      plot.crop.isWateredToday = false;
      plot.isWatered = false;
    }
  });

  // 游戏天数+1
  gameStore.world.day++;
}
```

**UI显示示例**：

```typescript
// 作物信息显示
function CropTooltip({ crop }) {
  const cropData = CROP_DATA[crop.type];
  const displayDays = Math.ceil(crop.daysUntilMature);

  return (
    <div className="tooltip">
      <h3>{cropData.name}</h3>
      <p>状态：{
        crop.isMature
          ? '✨ 已成熟，可收获'
          : `🌱 生长中（还需 ${displayDays} 天）`
      }</p>
      {crop.isWateredToday && !crop.isMature && (
        <p className="success">💧 今日已浇水（加速中）</p>
      )}
      <p className="info">
        基础：{cropData.baseDays}天 | 浇水：{cropData.fastDays}天
      </p>
    </div>
  );
}
```

---

## 10. 开发计划

### 10.1 开发阶段

#### 阶段1：基础框架（第1周）

**目标**：搭建项目基础，实现可运行的原型

**任务清单**：
- [x] 初始化项目（Vite + React + TypeScript）
- [ ] 配置开发环境（ESLint、Prettier）
- [ ] 集成 Supabase（认证、数据库）
- [ ] 创建数据库表结构
- [ ] 实现登录/注册界面
- [ ] 搭建 React Router（路由配置）
- [ ] 创建 Phaser 游戏容器组件
- [ ] 实现基本的游戏场景（空场景）
- [ ] 实现 Zustand 状态管理（authStore、gameStore）
- [ ] 实现响应式布局（检测桌面/移动端）

**产出**：
- 可运行的项目骨架
- 用户可以注册/登录
- 游戏页面正常显示

---

#### 阶段2：游戏基础（第2周）

**目标**：实现玩家控制和基础地图

**任务清单**：
- [ ] 加载游戏素材（角色、土地、背景）
- [ ] 实现角色移动（键盘 + 鼠标）
- [ ] 创建基础地图（6-16块土地）
- [ ] 实现土地状态切换（荒地 → 耕地）
- [ ] 实现工具切换系统
- [ ] 实现基础交互系统（点击土地）
- [ ] 移动端虚拟摇杆
- [ ] HUD 界面（金币、体力、时间）
- [ ] 时间系统（游戏内时间流逝）

**产出**：
- 玩家可以控制角色移动
- 可以使用工具耕地
- 基础UI正常显示

---

#### 阶段3：耕种系统（第3周）

**目标**：实现完整的耕种循环

**任务清单**：
- [ ] 作物配置数据（cropData）
- [ ] 播种系统（选择种子 → 种植）
- [ ] 浇水系统（土地状态变化）
- [ ] 作物生长逻辑（天数计算）
- [ ] 作物生长动画（多个阶段）
- [ ] 收获系统（获得农产品）
- [ ] 背包系统（存储物品）
- [ ] 存档系统（自动保存）
- [ ] 云存档同步（Supabase）

**产出**：
- 玩家可以完成种地 → 浇水 → 收获的完整流程
- 作物数据正确保存和加载

---

#### 阶段4：经济系统（第4周）

**目标**：实现商店和交易

**任务清单**：
- [ ] 商店界面（Ant Design 组件）
- [ ] 购买种子功能
- [ ] 出售农产品功能
- [ ] 价格波动系统（每天随机变化）
- [ ] 金币系统（收支平衡）
- [ ] 商店界面响应式适配

**产出**：
- 玩家可以购买种子、出售作物
- 完整的经济循环

---

#### 阶段5：任务和NPC（第5周）

**目标**：实现任务系统和NPC

**任务清单**：
- [ ] NPC 角色设计（老汤姆、玛丽、艾伦）
- [ ] NPC 对话系统
- [ ] 任务配置数据
- [ ] 任务发布系统
- [ ] 任务进度跟踪
- [ ] 任务完成奖励
- [ ] 任务界面（弹窗）
- [ ] 好感度系统（基础）

**产出**：
- 3-5个可完成的任务
- NPC交互功能

---

#### 阶段6：动物养殖（第6周）

**目标**：实现基础动物系统

**任务清单**：
- [ ] 动物数据配置
- [ ] 购买动物功能
- [ ] 动物喂养系统
- [ ] 动物产品收集
- [ ] 动物动画（基础）
- [ ] 动物状态管理（快乐值）

**产出**：
- 可以养鸡、牛
- 收集鸡蛋、牛奶

---

#### 阶段7：打磨和优化（第7周）

**目标**：完善细节，提升体验

**任务清单**：
- [ ] 音效和背景音乐
- [ ] 粒子效果（浇水、收获）
- [ ] UI 动画（弹窗、按钮）
- [ ] 加载动画（Loading）
- [ ] 错误处理（网络错误、存档失败）
- [ ] 移动端适配优化
- [ ] 性能优化（帧率、内存）
- [ ] 代码重构和注释

**产出**：
- 完整的游戏体验
- 性能流畅

---

#### 阶段8：测试和修复（第8周）

**目标**：发现并修复bug

**任务清单**：
- [ ] 功能测试（所有功能）
- [ ] 兼容性测试（浏览器、设备）
- [ ] 性能测试（加载时间、帧率）
- [ ] 用户体验测试
- [ ] Bug 修复
- [ ] 数据库备份和恢复测试
- [ ] 安全测试（RLS策略）

**产出**：
- 稳定可玩的版本

---

### 10.2 里程碑

| 里程碑 | 完成时间 | 标志 |
|-------|---------|------|
| **M1: 可玩原型** | 第2周末 | 角色能移动、耕地 |
| **M2: 种田循环** | 第3周末 | 能完成种地→收获 |
| **M3: 经济系统** | 第4周末 | 商店和金币系统 |
| **M4: 任务系统** | 第5周末 | 能完成NPC任务 |
| **M5: 动物系统** | 第6周末 | 能养殖动物 |
| **M6: 完整Demo** | 第7周末 | 所有核心功能 |
| **M7: 发布版本** | 第8周末 | 可对外发布 |

---

### 10.3 风险和应对

| 风险 | 影响 | 应对措施 |
|-----|------|---------|
| **Phaser学习曲线** | 开发进度延迟 | 提前学习Phaser官方教程 |
| **素材制作困难** | 游戏画面简陋 | 使用简单色块占位，逐步替换 |
| **Supabase集成问题** | 功能无法实现 | 先本地存储，后期集成云存档 |
| **性能问题** | 游戏卡顿 | 限制同屏对象数量，优化渲染 |
| **时间估算不足** | 无法按期完成 | 优先实现核心功能，次要功能后置 |

---

## 11. 成功指标

### 11.1 功能完整性

**必须实现（MVP）**：
- ✅ 用户可以注册/登录
- ✅ 完整的耕种循环（耕地→播种→浇水→收获）
- ✅ 至少3种作物
- ✅ 商店系统（购买种子、出售作物）
- ✅ 任务系统（至少3个可完成任务）
- ✅ 云存档同步（多设备）
- ✅ 桌面端和移动端均可运行

**期望实现**：
- ⭐ 动物养殖（鸡、牛）
- ⭐ 5+种作物
- ⭐ NPC好感度系统
- ⭐ 背包系统
- ⭐ 音效和背景音乐

### 11.2 性能指标

**技术指标**：
- 首次加载时间 < 5秒
- 游戏帧率 ≥ 30 FPS（移动端）、≥ 60 FPS（桌面端）
- 内存占用 < 200MB
- API 响应时间 < 500ms

**兼容性**：
- 桌面端：Chrome、Firefox、Safari、Edge（最新版）
- 移动端：iOS Safari、Android Chrome
- 屏幕尺寸：320px - 4K

### 11.3 用户体验指标

**可用性**：
- 新手5分钟内理解基本操作
- 完整游戏会话10-30分钟
- 操作反馈及时（< 100ms）
- 错误提示友好

**稳定性**：
- 游戏崩溃率 < 1%
- 存档成功率 > 99%
- 网络错误恢复能力

### 11.4 数据验证

**游戏平衡性**：
- 新玩家3天内能赚够500金币
- 完成新手任务需要10-15分钟
- 作物价格合理（能回本并有利润）

**经济系统**：
- 不会出现金币无限刷bug
- 价格波动不影响游戏体验

---

## 附录

### A. 参考资料

**技术文档**：
- [React 官方文档](https://react.dev)
- [Phaser 3 官方文档](https://photonstorm.github.io/phaser3-docs/)
- [Supabase 官方文档](https://supabase.com/docs)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [Ant Design 文档](https://ant.design/)

**学习资源**：
- Phaser 3 示例项目
- React 游戏开发教程
- Supabase 认证指南

### B. 游戏设计文档

**后续完善内容**：
- 详细对话脚本
- 任务列表和剧情
- NPC 角色设定
- 游戏数值平衡表
- 美术素材清单

### C. 更新日志

| 版本 | 日期 | 修改内容 |
|-----|------|---------|
| v1.2 | 2026-01-01 | 添加AI角色定制系统（方案A：模板定制，预留方案B：AI生成） |
| v1.1 | 2026-01-01 | 更新作物生长机制：采用浇水加速方案（缩短天数） |
| v1.0 | 2026-01-01 | 初始版本，完成PRD框架 |

### D. AI角色定制系统（补充功能）

**功能概述**：
允许玩家自定义游戏主角角色外观，提升游戏个性化和沉浸感。

#### D.1 方案A：模板定制系统（已实现✅）

**核心功能**：
- 预设角色模板（10+种）
- 颜色选择器
- 配饰系统
- 实时预览
- 本地保存

**角色模板**：
```
1. 基础模板
   - 男孩/女孩
   - 儿童/成人
   - 老人

2. 身体特征
   - 发型（10种）
   - 脸型（5种）
   - 体型（3种）

3. 服装选项
   - 日常装
   - 农场装（Lolita裙/工装裤）
   - 节日服装
   - 特殊装扮

4. 配饰系统
   - 帽子（遮阳帽/草帽/发箍）
   - 眼镜
   - 背包/工具包
   - 首饰
```

**自定义选项**：
- 颜色选择器（头发、衣服、配饰）
- 实时3D/2D预览
- 混搭组合
- 保存方案（可保存3套装扮）

**UI界面**：
```
┌───────────── 角色定制 ─────────────┐
│                                     │
│  ┌──────────┐    ┌──────────┐     │
│  │          │    │  预览区  │     │
│  │ 模板选择 │    │          │     │
│  │          │    │  [角色]  │     │
│  ├──────────┤    │          │     │
│  │          │    └──────────┘     │
│  │ 颜色选择 │                     │
│  │          │    ┌──────────┐     │
│  ├──────────┤    │ 配饰列表 │     │
│  │          │    │          │     │
│  │ 配饰选择 │    │ 帽子👒   │     │
│  │          │    │ 眼镜👓   │     │
│  └──────────┘    │ 道具🎒   │     │
│                 └──────────┘     │
│                                     │
│  [保存] [重置] [应用]              │
└─────────────────────────────────────┘
```

**数据结构**：
```typescript
interface CharacterCustomization {
  templateId: string          // 模板ID
  hairColor: string           // 头发颜色
  skinColor: string           // 肤色
  clothes: {
    top: string              // 上衣
    bottom: string           // 下装
    shoes: string            // 鞋子
  }
  accessories: string[]       // 配饰列表
  customColors: {            // 自定义颜色
    [key: string]: string
  }
}
```

#### D.2 方案B：AI生成系统（预留接口🔮）

**功能描述**：
通过AI图片生成技术，根据玩家输入的文字描述生成独一无二的角色形象。

**技术方案**：

1. **AI服务选择**：
   - OpenAI DALL-E 3
   - Stable Diffusion
   - Midjourney API

2. **API集成架构**：
```typescript
interface AICharacterGeneration {
  // 用户输入
  prompt: string              // "穿粉色Lolita裙的女孩，戴遮阳帽"
  style: 'q版' | '写实' | '像素'  // 风格选择

  // AI生成
  generateImage(): Promise<Blob>

  // 应用到游戏
  applyCharacter(image: Blob): void
}
```

3. **费用说明**：
   - DALL-E 3: $0.04/张（约¥0.3）
   - Stable Diffusion: ¥0.1-0.5/张
   - 或自建服务（需显卡，免费但成本高）

4. **UI界面**：
```
┌─────────── AI角色生成 ───────────┐
│                                    │
│  描述你想要的角色：                 │
│  ┌────────────────────────────┐  │
│  │ 穿粉色Lolita裙的女孩，戴遮 │  │
│  │ 阳阳帽，可爱的农场主风格   │  │
│  └────────────────────────────┘  │
│                                    │
│  风格选择：                         │
│  ⚪ Q版  ⚪ 写实  ⚪ 像素          │
│                                    │
│  [✨ 生成角色]  💰 ¥0.3/次         │
│                                    │
│  ┌──────────┐  ┌──────────┐       │
│  │  预览    │  │  原角色  │       │
│  │ [AI图片] │  │ [当前]   │       │
│  └──────────┘  └──────────┘       │
│                                    │
│  [应用] [重新生成] [保存]          │
└────────────────────────────────────┘
```

**安全措施**：
- 内容审核（防止不当内容）
- 生成次数限制（防止滥用）
- 保存到个人数据库
- 支持导出为PNG

**实现路线**：
1. ✅ 方案A（模板定制）- 立即可用，免费
2. 🔲 方案B（AI生成）- 预留接口，后续接入

**技术预留**：
```typescript
// 在 CharacterCustomization 中预留
interface CharacterCustomization {
  // ... 现有字段

  // AI生成预留字段
  aiGenerated?: boolean
  aiPrompt?: string
  aiImageUrl?: string
  aiImageBlob?: Blob
}

// 预留AI服务接口
class AICharacterService {
  async generate(prompt: string): Promise<string> {
    // TODO: 接入AI API
    throw new Error('AI生成功能待接入')
  }
}
```

#### D.3 实现优先级

**阶段1**（当前）：
- ✅ 基础模板系统
- ✅ 颜色选择器
- ✅ 配饰系统
- ✅ 保存/加载

**阶段2**（未来）：
- 🔲 更多模板
- 🔲 动画效果
- 🔲 AI生成接口

**阶段3**（可选）：
- 🔲 3D角色
- 🔲 角色进化系统
- 🔲 社交分享

---

**文档状态**：✅ 已完成，等待确认

**下一步**：开始项目初始化，搭建基础框架
