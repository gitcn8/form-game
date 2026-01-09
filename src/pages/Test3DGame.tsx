import { useState, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Html } from '@react-three/drei'

// World Components
import { FarmPlot } from '../components/world/FarmPlot'
import { DroppedItem } from '../components/world/DroppedItem'
import { GroundClickHandler } from '../components/world/GroundClickHandler'
import { InfiniteGround, InfiniteTrees } from '../components/world/ChunkSystem'
import { GrassDecorations } from '../components/world/GrassDecorations'

// Player Components
import { Player } from '../components/player/Player'
import { FirstPersonController } from '../components/player/FirstPersonController'

// Building Components
import { PlacedBlock } from '../components/building/PlacedBlock'
import { PlacedFacility } from '../components/building/PlacedFacility'
import { BuildPreview } from '../components/building/BuildPreview'

// Mining Components
import { UndergroundBlocks } from '../components/mining/UndergroundBlocks'
import { MiningSystem } from '../components/mining/MiningSystem'
import { MiningProgressBar } from '../components/mining/MiningProgressBar'

// UI Components
import { Shop } from '../components/ui/Shop'
import { Inventory } from '../components/ui/Inventory'
import { ColorPanel } from '../components/ui/ColorPanel'
import { PauseMenu } from '../components/ui/PauseMenu'
import { HUD } from '../components/ui/HUD'
import { MachinePanel } from '../components/ui/MachinePanel'
import { ShortcutHelp } from '../components/ui/ShortcutHelp'

// Inventory Components
import { Hotbar } from '../components/inventory/Hotbar'
import { InventoryPanel } from '../components/inventory/InventoryPanel'
import {
  ItemStack,
  createStack,
  createEmptyStack,
  isEmpty,
  canStack,
  mergeStacks,
  BlockType,
  CropType,
  ToolType,
  DecorationType,
  AnimalType,
  SpecialType,
  FacilityType,
  AnimalProductType,
  TreeType,
  ITEM_CONFIG
} from '../components/inventory/ItemStack'

// Farming Components
import { CROP_CONFIG, getCropConfig, isCropReady } from '../components/farming/CropConfig'
import { SeedType as FarmingSeedType, SEED_CONFIG, getSeedTypeByCrop, buySeedPack, calculateSeedCost, SEED_SHOP_ITEMS } from '../components/farming/SeedConfig'
import { TREE_CONFIG, getTreeConfig, isTreeReady, getTreeGrowthProgress } from '../components/farming/TreeConfig'

// Machine Components
import {
  MACHINE_CONFIGS,
  FOOD_ITEMS,
  getMachineConfig,
  getRecipe,
  canCraftRecipe,
  getProcessProgress,
  type PlacedMachine,
  type MachineType,
  type FoodRecipe,
  type FoodType
} from '../config/MachineConfig'

// Utils
import {
  consumeIngredients,
  hasEnoughIngredients,
  createFoodItem
} from '../utils/itemMatcher'
import { audioManager } from '../utils/AudioManager'

// Animal Components
import { PlacedAnimal as PlacedAnimalComponent } from '../components/animals/PlacedAnimal'
import { ANIMAL_CONFIGS, PlacedAnimal, shouldUpgradeGrowthStage, isAnimalHungry, canAnimalProduce } from '../components/animals/AnimalConfig'

// Machine Components
import { PlacedMachineMesh } from '../components/machines/PlacedMachine'

// 主场景
function FarmScene3D() {
  // 动态地块数据：用Map存储，key为位置字符串 "x,z"，value为地块状态
  const [plots, setPlots] = useState<Map<string, {
    state: string
    position: [number, number, number]
    cropType?: CropType  // 新增：作物类型
    plantTime?: number   // 新增：种植时间戳（毫秒）
    tilledTime?: number  // 新增：开垦时间戳（毫秒），用于耕地退化
  }>>(new Map())

  const [selectedSeed, setSelectedSeed] = useState<CropType>('carrot') // 当前选中的种子（默认）
  const [message, setMessage] = useState('点击开始 | 无限探索 | WASD移动 | 鼠标控制视角 | 按1-8切换工具/种子')
  const [isLocked, setIsLocked] = useState(false)

  // 物品系统
  const [droppedItems, setDroppedItems] = useState<Array<{ id: string; type: 'carrot' | 'dirt' | 'stone' | 'coal' | 'iron_ore' | 'gold_ore' | 'diamond' | 'egg' | 'milk' | 'wool' | 'meat' | 'apple' | 'orange' | 'peach' | 'cherry' | 'pear'; position: [number, number, number]; count: number }>>([])
  const [inventory, setInventory] = useState<{
    carrot: number
    wood: number
    stone: number
    dirt: number
    coal: number
    iron_ore: number
    gold_ore: number
    diamond: number
    // 新增建筑材料
    glass: number
    door: number
    planks: number
  }>({
    carrot: 0,
    wood: 0, // 初始木材已用于建房
    stone: 0,
    dirt: 0,
    coal: 0,
    iron_ore: 0,
    gold_ore: 0,
    diamond: 0,
    glass: 0,
    door: 0,
    planks: 0
  })
  const [gold, setGold] = useState(1000) // 初始金币（测试用）
  const [showInventory, setShowInventory] = useState(false)
  const [showShop, setShowShop] = useState(false) // 商店面板
  const [showShortcutHelp, setShowShortcutHelp] = useState(false) // 快捷键帮助

  // 作物解锁系统
  const [unlockedCrops, setUnlockedCrops] = useState<CropType[]>(['wheat']) // 已解锁的作物
  const [harvestedCrops, setHarvestedCrops] = useState<Set<CropType>>(new Set()) // 已收获过的作物

  // 机器与食物加工系统
  const [placedMachines, setPlacedMachines] = useState<Map<string, PlacedMachine>>(new Map()) // 放置的机器
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null) // 当前选中的机器ID
  const [showMachinePanel, setShowMachinePanel] = useState(false) // 机器面板显示状态
  const [machinePanelCooldown, setMachinePanelCooldown] = useState(false) // 面板关闭后的冷却时间

  // 装饰品系统
  const [placedDecorations, setPlacedDecorations] = useState<Map<string, {
    id: string
    decorationType: 'decor_table' | 'decor_chair' | 'decor_bed' | 'decor_cabinet' | 'decor_flowerpot' | 'decor_painting'
    position: [number, number, number]
  }>>(new Map()) // 放置的装饰品

  // 设施系统（鸡舍、牛棚）
  const [placedFacilities, setPlacedFacilities] = useState<Map<string, {
    id: string
    facilityType: 'facility_chicken_coop' | 'facility_barn'
    position: [number, number, number]
    rotation?: number
  }>>(new Map()) // 放置的设施

  // 体力系统
  const [stamina, setStamina] = useState(100) // 当前体力值（0-100）
  const [maxStamina] = useState(100) // 最大体力值
  const [satiety, setSatiety] = useState(100) // 饱食度（0-100）
  const [activeBuffs, setActiveBuffs] = useState<Array<{
    type: 'speed' | 'efficiency' | 'luck'
    value: number
    endTime: number
  }>>([]) // 当前激活的增益效果

  // 消耗体力的辅助函数
  const consumeStamina = (amount: number) => {
    setStamina((prev) => Math.max(0, prev - amount))
    if (stamina - amount <= 0) {
      setMessage('⚠️ 体力不足！请食用食物恢复体力')
    }
  }

  // 检查体力是否足够
  const hasEnoughStamina = (amount: number) => {
    return stamina >= amount
  }

  // 新背包系统
  const [inventorySlots, setInventorySlots] = useState<ItemStack[]>(() => {
    // 初始化64个背包槽位
    const slots: ItemStack[] = []

    // 槽位1-3：农场工具
    const tools: ToolType[] = ['hoe', 'watering_can', 'sickle']
    for (let i = 0; i < 3; i++) {
      const stack = createStack(tools[i], 1)
      if (stack) slots.push(stack)
      else slots.push(createEmptyStack())
    }

    // 槽位4：小麦种子 x20（开局只给小麦，成熟最快）
    // 注意：游戏设计中，作物可以直接作为种子种植
    const wheatSeedStack = createStack('wheat', 20)
    if (wheatSeedStack) slots.push(wheatSeedStack)
    else slots.push(createEmptyStack())

    // 槽位4-7：空槽位（后续通过收获解锁）
    for (let i = 4; i < 8; i++) {
      slots.push(createEmptyStack())
    }

    // 后56个槽位：空槽位
    for (let i = 8; i < 64; i++) {
      slots.push(createEmptyStack())
    }

    return slots
  })
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState(0) // 当前选中的背包槽位（0-63）
  const [hotbarOffset, setHotbarOffset] = useState(0) // 快捷栏窗口的起始位置

  // 快捷栏显示背包的连续10个槽位（滑动窗口）
  const hotbarSlots = useMemo(() => {
    // 确保选中槽位在可见窗口内
    if (selectedHotbarSlot < hotbarOffset) {
      setHotbarOffset(selectedHotbarSlot)
    } else if (selectedHotbarSlot >= hotbarOffset + 10) {
      setHotbarOffset(selectedHotbarSlot - 9)
    }

    // 确保窗口不超出背包范围（背包共64个槽位）
    const maxOffset = Math.max(0, inventorySlots.length - 10)
    const safeOffset = Math.min(Math.max(hotbarOffset, 0), maxOffset)
    if (safeOffset !== hotbarOffset) {
      setHotbarOffset(safeOffset)
    }

    return inventorySlots.slice(safeOffset, safeOffset + 10)
  }, [inventorySlots, hotbarOffset, selectedHotbarSlot])

  // 辅助函数：更新背包槽位（快捷栏是背包的一个窗口）
  const updateHotbarSlot = (index: number, newValue: ItemStack) => {
    setInventorySlots((prev) => {
      const newSlots = [...prev]
      newSlots[index] = newValue
      return newSlots
    })
  }

  // 作物解锁顺序（渐进式解锁）
  const CROP_UNLOCK_ORDER: CropType[] = [
    'wheat',   // 开局赠送
    'carrot',  // 首次收获小麦后解锁
    'potato',  // 首次收获胡萝卜后解锁
    'tomato',  // 首次收获土豆后解锁
    'pumpkin'  // 首次收获番茄后解锁
  ]

  // 解锁下一个作物的函数
  const unlockNextCrop = (currentCrop: CropType) => {
    const currentIndex = CROP_UNLOCK_ORDER.indexOf(currentCrop)
    const nextCrop = CROP_UNLOCK_ORDER[currentIndex + 1]

    if (nextCrop && !unlockedCrops.includes(nextCrop)) {
      // 解锁新作物
      setUnlockedCrops((prev) => [...prev, nextCrop])

      // 赠送该作物的种子10个
      // 注意：游戏设计中，作物可以直接作为种子种植
      const newSeedStack = createStack(nextCrop, 10)
      if (newSeedStack) {
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          // 找到第一个空的快捷栏槽位（槽位5-8）
          for (let i = 4; i < 8; i++) {
            if (isEmpty(newSlots[i])) {
              newSlots[i] = newSeedStack
              setMessage(`🎉 恭喜！解锁了新作物：${getCropConfig(nextCrop).name}！赠送种子 x10`)
              break
            }
          }
          return newSlots
        })
      }
    }
  }

  // 作物生长检查 - 每秒检查一次是否有作物成熟
  useEffect(() => {
    const growthCheckInterval = setInterval(() => {
      setPlots((prev) => {
        const updated = new Map(prev)
        let hasNewReady = false

        updated.forEach((plot, posKey) => {
          if (plot.state === 'planted' && plot.cropType && plot.plantTime) {
            // 检查是否成熟
            if (isCropReady(plot.plantTime, plot.cropType)) {
              plot.state = 'ready'
              updated.set(posKey, plot)
              hasNewReady = true
            }
          }
        })

        if (hasNewReady) {
          const cropTypes = Array.from(updated.values())
            .filter(p => p.state === 'ready' && p.cropType)
            .map(p => getCropConfig(p.cropType!).name)
          const uniqueCrops = [...new Set(cropTypes)]
          setMessage(`🎉 ${uniqueCrops.join('、')}成熟了！快来收获！`)
        }

        return updated
      })
    }, 1000) // 每秒检查一次

    return () => clearInterval(growthCheckInterval)
  }, [])

  // 耕地退化检查 - 每秒检查一次，超过60秒未操作的耕地恢复为草地
  useEffect(() => {
    const decayCheckInterval = setInterval(() => {
      const now = Date.now()
      const FARMLAND_DECAY_TIME = 60 * 1000 // 60秒（毫秒）

      setPlots((prev) => {
        const updated = new Map(prev)
        let hasDecayed = false
        const decayedBlocks: string[] = []

        updated.forEach((plot, posKey) => {
          // 只检查状态为 'tilled' 的耕地（已开垦但未播种、未浇水）
          if (plot.state === 'tilled' && plot.tilledTime) {
            const timeSinceTilled = now - plot.tilledTime

            // 如果超过60秒，恢复为草地
            if (timeSinceTilled > FARMLAND_DECAY_TIME) {
              plot.state = 'empty'
              plot.position[1] = 0 // 恢复到地面高度
              plot.tilledTime = undefined // 清除开垦时间
              updated.set(posKey, plot)

              // 记录需要从 minedBlocks 中移除的方块
              const [x, , z] = plot.position
              decayedBlocks.push(`${x},0,${z}`)
              hasDecayed = true
            }
          }
        })

        // 如果有耕地退化了，更新 minedBlocks
        if (hasDecayed) {
          setMinedBlocks((prev) => {
            const newSet = new Set(prev)
            decayedBlocks.forEach(blockKey => newSet.delete(blockKey))
            return newSet
          })
          setMessage('🌱 部分耕地因长期未使用已恢复为草地')
        }

        return updated
      })
    }, 1000) // 每秒检查一次

    return () => clearInterval(decayCheckInterval)
  }, [])

  // 机器加工进度检查 - 每秒检查一次机器加工进度
  useEffect(() => {
    const processCheckInterval = setInterval(() => {
      const now = Date.now()

      setPlacedMachines((prev) => {
        const updated = new Map(prev)
        let hasCompleted = false

        updated.forEach((machine, machineId) => {
          if (machine.processing && machine.processEndTime) {
            // 检查加工是否完成
            if (now >= machine.processEndTime!) {
              // 加工完成：停止加工状态，但保留recipeId以便显示"收取"按钮
              machine.processing = false
              machine.processStartTime = undefined
              machine.processEndTime = undefined
              // ❌ 不要清除 recipeId！收取时才清除
              // machine.recipeId = undefined
              updated.set(machineId, machine)
              hasCompleted = true
            }
          }
        })

        if (hasCompleted) {
          setMessage('✅ 食物加工完成！请打开机器面板收取')
        }

        return updated
      })
    }, 1000) // 每秒检查一次

    return () => clearInterval(processCheckInterval)
  }, [])

  // 增益效果管理 - 每秒检查一次增益效果是否过期
  useEffect(() => {
    const buffCheckInterval = setInterval(() => {
      const now = Date.now()

      setActiveBuffs((prev) => {
        // 过滤掉已过期的增益效果
        const active = prev.filter(buff => now < buff.endTime)

        // 如果有增益效果过期，通知玩家
        if (active.length < prev.length) {
          const expiredCount = prev.length - active.length
          if (expiredCount > 0) {
            setMessage(`⏰ ${expiredCount}个增益效果已过期`)
          }
        }

        return active
      })
    }, 1000) // 每秒检查一次

    return () => clearInterval(buffCheckInterval)
  }, [])

  // 体力自动恢复 - 每10秒恢复1点体力（当饱食度>0时）
  useEffect(() => {
    const staminaRegenInterval = setInterval(() => {
      setStamina((prev) => {
        // 只有当饱食度>0时才自动恢复体力
        if (satiety > 0 && prev < maxStamina) {
          return Math.min(maxStamina, prev + 1)
        }
        return prev
      })
    }, 10000) // 每10秒恢复1点

    return () => clearInterval(staminaRegenInterval)
  }, [satiety, maxStamina])

  // 挖矿系统
  const [minedBlocks, setMinedBlocks] = useState<Set<string>>(new Set()) // 已挖掘的方块
  const [miningProgress, setMiningProgress] = useState({ progress: 0, targetBlock: '', visible: false }) // 挖掘进度
  const [targetBlock, setTargetBlock] = useState<string | null>(null) // 当前瞄准的方块

  // 建造系统 - 初始包含简陋房屋
  const [selectedMaterial, setSelectedMaterial] = useState<'wood' | 'stone' | 'dirt'>('wood')
  const [placedBlocks, setPlacedBlocks] = useState<
    Array<{ id: string; type: 'wood' | 'stone' | 'dirt' | 'door' | 'glass' | 'planks'; position: [number, number, number] }>
  >([
    // 5x5 木屋（Minecraft风格）
    // 5x5 木屋（Minecraft风格）

    // 地基（5x5）
    { id: 'house_floor_0', type: 'planks', position: [-2, 0, 2] },
    { id: 'house_floor_1', type: 'planks', position: [-1, 0, 2] },
    { id: 'house_floor_2', type: 'planks', position: [0, 0, 2] },
    { id: 'house_floor_3', type: 'planks', position: [1, 0, 2] },
    { id: 'house_floor_4', type: 'planks', position: [2, 0, 2] },
    { id: 'house_floor_5', type: 'planks', position: [-2, 0, 3] },
    { id: 'house_floor_6', type: 'planks', position: [-1, 0, 3] },
    { id: 'house_floor_7', type: 'planks', position: [0, 0, 3] },
    { id: 'house_floor_8', type: 'planks', position: [1, 0, 3] },
    { id: 'house_floor_9', type: 'planks', position: [2, 0, 3] },
    { id: 'house_floor_10', type: 'planks', position: [-2, 0, 4] },
    { id: 'house_floor_11', type: 'planks', position: [-1, 0, 4] },
    { id: 'house_floor_12', type: 'planks', position: [0, 0, 4] },
    { id: 'house_floor_13', type: 'planks', position: [1, 0, 4] },
    { id: 'house_floor_14', type: 'planks', position: [2, 0, 4] },
    { id: 'house_floor_15', type: 'planks', position: [-2, 0, 5] },
    { id: 'house_floor_16', type: 'planks', position: [-1, 0, 5] },
    { id: 'house_floor_17', type: 'planks', position: [0, 0, 5] },
    { id: 'house_floor_18', type: 'planks', position: [1, 0, 5] },
    { id: 'house_floor_19', type: 'planks', position: [2, 0, 5] },
    { id: 'house_floor_20', type: 'planks', position: [-2, 0, 6] },
    { id: 'house_floor_21', type: 'planks', position: [-1, 0, 6] },
    { id: 'house_floor_22', type: 'planks', position: [0, 0, 6] },
    { id: 'house_floor_23', type: 'planks', position: [1, 0, 6] },
    { id: 'house_floor_24', type: 'planks', position: [2, 0, 6] },

    // 墙壁（3格高）
    // 后墙
    { id: 'house_wall_back_0', type: 'wood', position: [-2, 1, 2] },
    { id: 'house_wall_back_1', type: 'wood', position: [-1, 1, 2] },
    { id: 'house_wall_back_2', type: 'wood', position: [0, 1, 2] },
    { id: 'house_wall_back_3', type: 'wood', position: [1, 1, 2] },
    { id: 'house_wall_back_4', type: 'wood', position: [2, 1, 2] },
    { id: 'house_wall_back_5', type: 'wood', position: [-2, 2, 2] },
    { id: 'house_wall_back_6', type: 'wood', position: [-1, 2, 2] },
    { id: 'house_wall_back_7', type: 'wood', position: [0, 2, 2] },
    { id: 'house_wall_back_8', type: 'wood', position: [1, 2, 2] },
    { id: 'house_wall_back_9', type: 'wood', position: [2, 2, 2] },
    { id: 'house_wall_back_10', type: 'wood', position: [-2, 3, 2] },
    { id: 'house_wall_back_11', type: 'wood', position: [-1, 3, 2] },
    { id: 'house_wall_back_12', type: 'wood', position: [0, 3, 2] },
    { id: 'house_wall_back_13', type: 'wood', position: [1, 3, 2] },
    { id: 'house_wall_back_14', type: 'wood', position: [2, 3, 2] },

    // 前墙（带门和窗户）
    { id: 'house_wall_front_0', type: 'wood', position: [-2, 1, 6] },
    { id: 'house_wall_front_1', type: 'wood', position: [-1, 1, 6] },
    // [0, 1, 6] 是门的位置
    { id: 'house_wall_front_3', type: 'wood', position: [1, 1, 6] },
    { id: 'house_wall_front_4', type: 'wood', position: [2, 1, 6] },
    { id: 'house_wall_front_5', type: 'wood', position: [-2, 2, 6] },
    { id: 'house_wall_front_6', type: 'glass', position: [-1, 2, 6] }, // 左窗户
    // [0, 2, 6] 是门的上半部分
    { id: 'house_wall_front_8', type: 'glass', position: [1, 2, 6] }, // 右窗户
    { id: 'house_wall_front_9', type: 'wood', position: [2, 2, 6] },
    { id: 'house_wall_front_10', type: 'wood', position: [-2, 3, 6] },
    { id: 'house_wall_front_11', type: 'wood', position: [-1, 3, 6] },
    { id: 'house_wall_front_12', type: 'wood', position: [0, 3, 6] },
    { id: 'house_wall_front_13', type: 'wood', position: [1, 3, 6] },
    { id: 'house_wall_front_14', type: 'wood', position: [2, 3, 6] },

    // 门（双开门）
    { id: 'house_door_left', type: 'door', position: [-0.5, 1, 6] },
    { id: 'house_door_right', type: 'door', position: [0.5, 1, 6] },

    // 左墙（带窗户）
    { id: 'house_wall_left_0', type: 'wood', position: [-2, 1, 3] },
    { id: 'house_wall_left_1', type: 'wood', position: [-2, 1, 4] },
    { id: 'house_wall_left_2', type: 'wood', position: [-2, 1, 5] },
    { id: 'house_wall_left_3', type: 'glass', position: [-2, 2, 3] }, // 窗户
    { id: 'house_wall_left_4', type: 'wood', position: [-2, 2, 4] },
    { id: 'house_wall_left_5', type: 'wood', position: [-2, 2, 5] },
    { id: 'house_wall_left_6', type: 'wood', position: [-2, 3, 3] },
    { id: 'house_wall_left_7', type: 'wood', position: [-2, 3, 4] },
    { id: 'house_wall_left_8', type: 'wood', position: [-2, 3, 5] },

    // 右墙（带窗户）
    { id: 'house_wall_right_0', type: 'wood', position: [2, 1, 3] },
    { id: 'house_wall_right_1', type: 'wood', position: [2, 1, 4] },
    { id: 'house_wall_right_2', type: 'wood', position: [2, 1, 5] },
    { id: 'house_wall_right_3', type: 'glass', position: [2, 2, 4] }, // 窗户
    { id: 'house_wall_right_4', type: 'wood', position: [2, 2, 3] },
    { id: 'house_wall_right_5', type: 'wood', position: [2, 2, 5] },
    { id: 'house_wall_right_6', type: 'wood', position: [2, 3, 3] },
    { id: 'house_wall_right_7', type: 'wood', position: [2, 3, 4] },
    { id: 'house_wall_right_8', type: 'wood', position: [2, 3, 5] },

    // 屋顶（倾斜式）
    { id: 'house_roof_0', type: 'wood', position: [-2, 4, 2] },
    { id: 'house_roof_1', type: 'wood', position: [-1, 4, 2] },
    { id: 'house_roof_2', type: 'wood', position: [0, 4, 2] },
    { id: 'house_roof_3', type: 'wood', position: [1, 4, 2] },
    { id: 'house_roof_4', type: 'wood', position: [2, 4, 2] },

    { id: 'house_roof_5', type: 'wood', position: [-2, 4, 3] },
    { id: 'house_roof_6', type: 'wood', position: [-1, 4, 3] },
    { id: 'house_roof_7', type: 'wood', position: [0, 4, 3] },
    { id: 'house_roof_8', type: 'wood', position: [1, 4, 3] },
    { id: 'house_roof_9', type: 'wood', position: [2, 4, 3] },

    { id: 'house_roof_10', type: 'wood', position: [-2, 4, 4] },
    { id: 'house_roof_11', type: 'wood', position: [-1, 4, 4] },
    { id: 'house_roof_12', type: 'wood', position: [0, 4, 4] },
    { id: 'house_roof_13', type: 'wood', position: [1, 4, 4] },
    { id: 'house_roof_14', type: 'wood', position: [2, 4, 4] },

    { id: 'house_roof_15', type: 'wood', position: [-2, 4, 5] },
    { id: 'house_roof_16', type: 'wood', position: [-1, 4, 5] },
    { id: 'house_roof_17', type: 'wood', position: [0, 4, 5] },
    { id: 'house_roof_18', type: 'wood', position: [1, 4, 5] },
    { id: 'house_roof_19', type: 'wood', position: [2, 4, 5] },

    { id: 'house_roof_20', type: 'wood', position: [-2, 4, 6] },
    { id: 'house_roof_21', type: 'wood', position: [-1, 4, 6] },
    { id: 'house_roof_22', type: 'wood', position: [0, 4, 6] },
    { id: 'house_roof_23', type: 'wood', position: [1, 4, 6] },
    { id: 'house_roof_24', type: 'wood', position: [2, 4, 6] },

    // 屋顶尖（中心一排高一格）
    { id: 'house_roof_peak_0', type: 'wood', position: [-2, 5, 2] },
    { id: 'house_roof_peak_1', type: 'wood', position: [2, 5, 2] },
    { id: 'house_roof_peak_2', type: 'wood', position: [-2, 5, 6] },
    { id: 'house_roof_peak_3', type: 'wood', position: [2, 5, 6] }
  ])

  // 动物系统
  const [animals, setAnimals] = useState<PlacedAnimal[]>([]) // 已放置的动物
  const [placingAnimal, setPlacingAnimal] = useState<string | null>(null) // 当前正在放置的动物ID
  const [placingMachine, setPlacingMachine] = useState<MachineType | null>(null) // 当前正在放置的机器类型

  // 视角和玩家相关状态
  const [cameraMode, setCameraMode] = useState<'first' | 'third'>('first')
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 5])
  const [playerRotation, setPlayerRotation] = useState(0)
  const [isMoving, setIsMoving] = useState(false)

  // 用于音效系统的玩家位置引用（始终获取最新值）
  const playerPositionRef = useRef<[number, number, number]>([0, 0, 5])
  useEffect(() => {
    playerPositionRef.current = playerPosition
  }, [playerPosition])
  const [showColorPanel, setShowColorPanel] = useState(false)
  const [showPauseMenu, setShowPauseMenu] = useState(true) // 默认显示引导面板
  const [isFirstTime, setIsFirstTime] = useState(true) // 是否是首次进入游戏

  // 玩家颜色配置
  const [playerColors, setPlayerColors] = useState({
    head: '#ffcc99',
    body: '#4a90d9',
    limbs: '#2d5a8a'
  })

  /**
   * 快捷栏槽位选择
   * 根据槽位中的物品类型自动决定行为
   * - 工具：提示可以用于对应操作
   * - 种子：切换到该种子
   * - 方块：提示可以用于建造
   */
  const handleHotbarSlotSelect = (index: number) => {
    // 确保槽位索引在有效范围内（0-63）
    const safeIndex = Math.min(Math.max(index, 0), 63)
    setSelectedHotbarSlot(safeIndex) // 现在可以选择整个背包的任何槽位
    const stack = inventorySlots[safeIndex]

    if (isEmpty(stack)) {
      setMessage('❌ 该槽位为空')
      return
    }

    // 根据物品类型显示不同提示
    if (stack.itemType === 'tool' && stack.toolType) {
      const toolInfo: Record<string, { name: string; action: string }> = {
        hoe: { name: '锄头', action: '点击开垦土地' },
        watering_can: { name: '水壶', action: '点击浇水' },
        sickle: { name: '镰刀', action: '点击收获作物' },
        axe: { name: '斧头', action: '点击砍树' },
        pickaxe: { name: '镐', action: '点击挖掘' },
        shovel: { name: '铲子', action: '点击挖掘' }
      }
      const info = toolInfo[stack.toolType] || { name: stack.name, action: '使用' }
      setMessage(`✅ 切换到：${info.name}（${info.action}）`)
    } else if (stack.cropType) {
      setSelectedSeed(stack.cropType)
      const cropConfig = getCropConfig(stack.cropType)
      setMessage(`✅ 切换到种子：${cropConfig.name}（点击种植）`)
    } else if (stack.itemType === 'block') {
      setMessage(`✅ 切换到：${stack.name}（点击放置）`)
    } else if (stack.itemType === 'animal') {
      setMessage(`✅ 切换到：${stack.name}（点击放置）`)
    } else if (stack.itemType === 'machine') {
      setMessage(`✅ 切换到：${stack.name}（点击放置）`)
    } else if (stack.itemType === 'decoration') {
      setMessage(`✅ 切换到：${stack.name}（点击放置）`)
    } else {
      setMessage(`✅ 切换到：${stack.name}`)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl 键：切换鼠标锁定状态（用于点击快捷栏）
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        // 检查当前实际的锁定状态
        const actuallyLocked = !!document.pointerLockElement

        if (actuallyLocked || isLocked) {
          // 鼠标锁定时，解锁鼠标
          document.exitPointerLock()
          setIsLocked(false)
        } else if (!showColorPanel && !showInventory && !showShop && !showShortcutHelp && !showPauseMenu && !showMachinePanel) {
          // 鼠标解锁且没有面板打开时，重新锁定鼠标
          const canvas = document.querySelector('canvas')
          if (canvas) {
            canvas.requestPointerLock()
            setIsLocked(true)
          }
        }
        e.preventDefault()
        return
      }

      // 快捷栏数字键 1-9 和 0 - 支持10个槽位
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        const index = parseInt(e.code.replace('Digit', '')) - 1 // 转换为 0-8
        handleHotbarSlotSelect(index)
        e.preventDefault()
        return
      }
      if (e.code === 'Digit0') {
        handleHotbarSlotSelect(9) // 第10个槽位
        e.preventDefault()
        return
      }

      if (e.code === 'Slash') {
        // ? 键（需要按 Shift + /）
        if (!e.shiftKey) {
          setShowShortcutHelp((prev) => !prev)
          e.preventDefault()
        }
      } else if (e.code === 'KeyV') {
        // 视角切换
        setCameraMode((prev) => {
          const newMode = prev === 'first' ? 'third' : 'first'
          setMessage(newMode === 'first' ? '📷 切换到第一人称' : '📷 切换到第三人称')
          return newMode
        })
      } else if (e.code === 'KeyC') {
        // 打开/关闭颜色设置面板
        if (!showColorPanel) document.exitPointerLock() // 打开时退出指针锁定
        setShowColorPanel((prev) => !prev)
      } else if (e.code === 'KeyB') {
        // 打开/关闭背包
        if (!showInventory) document.exitPointerLock() // 打开时退出指针锁定
        setShowInventory((prev) => !prev)
      } else if (e.code === 'KeyU') {
        // 打开/关闭商店
        if (!showShop) document.exitPointerLock() // 打开时退出指针锁定
        setShowShop((prev) => !prev)
      } else if (e.code === 'KeyT') {
        // 测试：放置动物（临时）
        if (placingAnimal) {
          setPlacingAnimal(null)
          setMessage('❌ 取消放置动物')
        } else if (placingMachine) {
          setPlacingMachine(null)
          setMessage('❌ 取消放置机器')
        } else {
          setPlacingAnimal('pig') // 默认放置猪
          const config = ANIMAL_CONFIGS['pig']
          setMessage(`🐷 放置模式：${config.name}（左键放置，右键取消）`)
        }
      } else if (e.code === 'Escape') {
        // ESC 键：优先关闭面板，没有面板时才显示暂停菜单（需要按两次）
        if (showColorPanel || showInventory || showShop || showShortcutHelp || showMachinePanel || placingAnimal || placingMachine) {
          // 第一次 ESC：关闭所有面板和放置模式
          setShowColorPanel(false)
          setShowInventory(false)
          setShowShop(false)
          setShowShortcutHelp(false)
          setShowMachinePanel(false)
          setSelectedMachine(null)
          setPlacingAnimal(null)
          setPlacingMachine(null)
          setShowPauseMenu(false)  // 确保暂停菜单也关闭
        } else {
          // 第二次 ESC（没有面板时）：显示暂停菜单
          setShowPauseMenu(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLocked, showColorPanel, showInventory, showShop, showPauseMenu, showMachinePanel, cameraMode, hotbarSlots, selectedSeed, selectedHotbarSlot, showShortcutHelp])

  // 监听指针锁定状态变化，确保 isLocked 状态与实际同步
  useEffect(() => {
    const handlePointerLockChange = () => {
      const actuallyLocked = !!document.pointerLockElement
      setIsLocked(actuallyLocked)
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [])

  // 监听面板状态变化，自动解锁指针
  useEffect(() => {
    if (showColorPanel || showInventory || showShop || showShortcutHelp || showMachinePanel) {
      document.exitPointerLock()
    }
  }, [showColorPanel, showInventory, showShop, showShortcutHelp, showMachinePanel])

  // 自动拾取物品（检测玩家与掉落物品的距离）
  useEffect(() => {
    const pickupDistance = 1.5 // 自动拾取距离

    droppedItems.forEach((item) => {
      const dx = item.position[0] - playerPosition[0]
      const dz = item.position[2] - playerPosition[2]
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance < pickupDistance) {
        // 使用新的背包系统添加物品
        addItemToInventory(item.type, item.count)

        // 物品名称映射
        const itemNames: Record<string, string> = {
          carrot: '胡萝卜',
          dirt: '泥土',
          stone: '石头',
          coal: '煤矿',
          iron_ore: '铁矿',
          gold_ore: '金矿',
          diamond: '钻石',
          egg: '鸡蛋',
          milk: '牛奶',
          wool: '羊毛',
          meat: '肉类',
          apple: '苹果',
          orange: '橙子',
          peach: '桃子',
          cherry: '樱桃',
          pear: '梨'
        }

        const itemName = itemNames[item.type] || item.type
        setMessage(`✅ 自动捡起了 ${item.count} 个${itemName}`)

        // 从掉落列表中移除
        setDroppedItems((prev) => prev.filter((i) => i.id !== item.id))
      }
    })
  }, [playerPosition, droppedItems])

  // 丢掉物品
  const dropItem = (type: 'carrot', count: number) => {
    if (inventory[type] >= count) {
      setInventory((prev) => ({
        ...prev,
        [type]: prev[type] - count
      }))

      // 在玩家位置生成掉落物
      const newItem = {
        id: Date.now().toString(),
        type: 'carrot' as const,
        position: [playerPosition[0], 0, playerPosition[2]] as [number, number, number],
        count: count
      }

      setDroppedItems((prev) => [...prev, newItem])
      setMessage(`📤 丢掉了 ${count} 根胡萝卜`)
    }
  }

  // 树木砍伐处理
  const handleTreeChop = () => {
    const woodAmount = Math.floor(Math.random() * 3) + 3 // 3-5个木材
    setInventory((prev) => ({ ...prev, wood: prev.wood + woodAmount }))
    setMessage(`🪓 砍伐成功！获得 ${woodAmount} 个木材`)
  }

  // 处理方块挖掘
  const handleBlockMined = (position: [number, number, number], blockType: string, dropItem: string | null) => {
    const [x, y, z] = position
    const blockKey = `${x},${y},${z}`

    console.log('📦 Block mined:', { position, blockType, dropItem, blockKey })

    // 添加到已挖掘列表
    setMinedBlocks((prev) => new Set([...prev, blockKey]))

    // 处理掉落物品
    if (dropItem) {
      console.log('💎 Creating dropped item:', dropItem)

      // 在玩家前方创建掉落物品（稍微向上抛起）
      const dropPosition: [number, number, number] = [
        playerPosition[0],
        0.5, // 在地面上方
        playerPosition[2]
      ]

      const newItem = {
        id: `${dropItem}_${Date.now()}_${Math.random()}`,
        type: dropItem as any,
        position: dropPosition,
        count: 1
      }

      setDroppedItems((prev) => [...prev, newItem])

      console.log('✅ Dropped item created:', { type: dropItem, position: dropPosition })

      // 显示消息
      const itemNames: Record<string, string> = {
        dirt: '泥土',
        stone: '石头',
        coal: '煤矿',
        iron_ore: '铁矿',
        gold_ore: '金矿',
        diamond: '钻石'
      }

      const itemName = itemNames[dropItem] || dropItem
      setMessage(`⛏️ 挖掘获得 ${itemName}（已掉落在地上）`)
    }
  }

  // 放置方块
  const handlePlaceBlock = (position: [number, number, number]) => {
    const [x, y, z] = position

    // 检查材料数量
    if (inventory[selectedMaterial] <= 0) {
      setMessage('❌ 材料不足！')
      return
    }

    // 对齐到网格
    const alignedX = Math.round(x)
    const alignedY = Math.max(0, Math.round(y)) // 至少在地面上
    const alignedZ = Math.round(z)

    // 检查该位置是否已有方块
    const posKey = `${alignedX},${alignedY},${alignedZ}`
    if (placedBlocks.some((b) => b.id === posKey)) {
      setMessage('❌ 该位置已有方块！')
      return
    }

    // 扣除材料
    setInventory((prev) => ({ ...prev, [selectedMaterial]: prev[selectedMaterial] - 1 }))

    // 添加方块
    const newBlock = {
      id: posKey,
      type: selectedMaterial,
      position: [alignedX, alignedY, alignedZ] as [number, number, number]
    }

    setPlacedBlocks((prev) => [...prev, newBlock])
    setMessage(`✅ 放置了 ${selectedMaterial} 方块`)
  }

  // 放置设施（鸡舍、牛棚）
  const handlePlaceFacility = (position: [number, number, number], facilityType: 'facility_chicken_coop' | 'facility_barn') => {
    const [x, y, z] = position

    // 对齐到网格
    const alignedX = Math.round(x)
    const alignedY = 0 // 设施放在地面上
    const alignedZ = Math.round(z)

    // 检查该位置是否已有设施
    const posKey = `${alignedX},${alignedY},${alignedZ}`
    if (placedFacilities.has(posKey)) {
      setMessage('❌ 该位置已有设施！')
      return
    }

    // 添加设施
    const newFacility = {
      id: posKey,
      facilityType,
      position: [alignedX, alignedY, alignedZ] as [number, number, number],
      rotation: 0
    }

    setPlacedFacilities((prev) => new Map(prev).set(posKey, newFacility))

    const facilityNames = {
      facility_chicken_coop: '鸡舍',
      facility_barn: '牛棚'
    }
    setMessage(`✅ 放置了${facilityNames[facilityType]}`)
  }

  // 移除方块
  const handleRemoveBlock = (blockId: string) => {
    const block = placedBlocks.find((b) => b.id === blockId)
    if (!block) return

    // 检查是否是房屋的一部分（保护初始房屋）
    if (block.id.startsWith('house_')) {
      setMessage('⚠️ 不能拆除初始房屋！')
      return
    }

    // 返还材料
    setInventory((prev) => ({ ...prev, [block.type]: prev[block.type] + 1 }))

    // 移除方块
    setPlacedBlocks((prev) => prev.filter((b) => b.id !== blockId))
    setMessage(`✅ 拆除了 ${block.type} 方块`)
  }

  // ===== 动物系统 =====

  // 放置动物
  const handlePlaceAnimal = (position: [number, number, number], animalTypeOverride?: string) => {
    // 使用传入的动物类型，或使用当前正在放置的动物类型
    const animalType = animalTypeOverride || placingAnimal
    if (!animalType) return

    const config = ANIMAL_CONFIGS[animalType]
    const currentTime = Date.now()

    // 检查该位置是否被占用，如果有，自动偏移到附近空闲位置
    let finalPosition = [...position] as [number, number, number]
    if (isPositionOccupied(position[0], position[2])) {
      const emptyPosition = findNearestEmptyPosition(position[0], position[2])
      if (!emptyPosition) {
        setMessage('⚠️ 周围没有空闲位置')
        return
      }
      finalPosition = emptyPosition as [number, number, number]
    }

    // 创建新动物实例
    const newAnimal: PlacedAnimal = {
      id: `${animalType}_${currentTime}_${Math.random().toString(36).slice(2, 9)}`,
      animalId: animalType,
      position: finalPosition,
      rotation: Math.random() * 360, // 随机初始朝向
      birthTime: currentTime,
      growthStage: 'baby',
      lastFed: currentTime,
      lastProduct: currentTime,
      hunger: 0,
      happiness: 100,
      health: 100,
      lastHungerCheck: currentTime as any,  // 记录上次饥饿检查时间
      // 移动状态
      targetPosition: undefined,
      isMoving: false,
      lastMoveTime: currentTime,
      restUntil: currentTime + 2000, // 初始休息2秒
      // 声音状态
      lastSoundTime: currentTime,
      nextSoundTime: currentTime + 3000 // 3秒后才能开始叫
    }

    setAnimals((prev) => [...prev, newAnimal])
    setPlacingAnimal(null)
    setMessage(`✅ 放置了${config.name}幼崽`)

    // 播放放置音效
    setTimeout(() => {
      audioManager.playInteractionSound('place')
    }, 100)
  }

  // 检查位置是否被占用（包括机器、动物、装饰品等）
  const isPositionOccupied = (x: number, z: number, excludeId?: string): boolean => {
    // 检查机器
    const machineKey = `${Math.round(x)},${Math.round(z)}`
    if (placedMachines.has(machineKey)) {
      return true
    }

    // 检查动物（使用距离判断）
    for (const animal of animals) {
      if (excludeId && animal.id === excludeId) continue
      const dx = animal.position[0] - x
      const dz = animal.position[2] - z
      const distance = Math.sqrt(dx * dx + dz * dz)
      if (distance < 1.0) { // 1个单位内认为有碰撞
        return true
      }
    }

    // 检查装饰品
    for (const decoration of placedDecorations.values()) {
      if (excludeId && decoration.id === excludeId) continue
      const dx = decoration.position[0] - x
      const dz = decoration.position[2] - z
      const distance = Math.sqrt(dx * dx + dz * dz)
      if (distance < 1.0) {
        return true
      }
    }

    return false
  }

  // 查找最近的空闲位置
  const findNearestEmptyPosition = (startX: number, startZ: number, excludeId?: string): [number, number, number] | null => {
    // 螺旋式搜索：从小到大扩展搜索半径
    const maxRadius = 10 // 最大搜索半径
    const step = 0.5     // 搜索步长

    for (let radius = step; radius <= maxRadius; radius += step) {
      // 搜索当前圆周上的点
      const points = 8 * Math.ceil(radius) // 圆周上的点数随半径增加
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2
        const x = startX + Math.cos(angle) * radius
        const z = startZ + Math.sin(angle) * radius

        if (!isPositionOccupied(x, z, excludeId)) {
          return [x, 0, z]
        }
      }
    }

    // 如果周围都满了，返回null
    return null
  }

  // 放置机器
  const handlePlaceMachine = (position: [number, number, number], machineTypeOverride?: MachineType) => {
    // 使用传入的机器类型，或使用当前正在放置的机器类型
    const machineType = machineTypeOverride || placingMachine
    if (!machineType) return

    const config = getMachineConfig(machineType)

    // 将位置对齐到网格
    let alignedX = Math.round(position[0])
    let alignedZ = Math.round(position[2])

    // 检查该位置是否已有机器，如果有，自动偏移到附近空闲位置
    const machineKey = `${alignedX},${alignedZ}`
    if (placedMachines.has(machineKey) || isPositionOccupied(alignedX, alignedZ)) {
      // 查找最近的空闲位置
      const emptyPosition = findNearestEmptyPosition(alignedX, alignedZ)
      if (!emptyPosition) {
        setMessage('⚠️ 周围没有空闲位置')
        return
      }
      alignedX = Math.round(emptyPosition[0])
      alignedZ = Math.round(emptyPosition[2])
    }

    const posKey = `${alignedX},${alignedZ}`

    // 创建新机器实例
    const newMachine: PlacedMachine = {
      id: posKey,
      machineType: machineType,
      position: [alignedX, 0, alignedZ],
      processing: false
    }

    setPlacedMachines((prev) => new Map(prev).set(posKey, newMachine))
    setPlacingMachine(null)
    setMessage(`✅ 放置了${config.name}`)
  }

  // 收起机器
  const handleRemoveMachine = (machineId: string) => {
    const machine = placedMachines.get(machineId)
    if (!machine) return

    const config = getMachineConfig(machine.machineType)

    // 从机器列表中移除
    setPlacedMachines((prev) => {
      const updated = new Map(prev)
      updated.delete(machineId)
      return updated
    })

    // 返还到背包
    addItemToInventory(machine.machineType, 1)

    setMessage(`✅ 已收起${config.name}`)
  }

  // 开始机器加工
  const handleStartProcessing = (machineId: string, recipeId: string, count: number = 1) => {
    const machine = placedMachines.get(machineId)
    if (!machine) return

    const recipe = getRecipe(machine.machineType, recipeId)
    if (!recipe) return

    // 直接使用 inventorySlots（hotbarSlots 是它的前8个，不需要拼接）
    let fullInventory = [...inventorySlots]

    // 根据count数量，重复检查和扣除材料
    for (let i = 0; i < count; i++) {
      // 每次都检查材料是否足够
      if (!hasEnoughIngredients(fullInventory, recipe.ingredients)) {
        setMessage(`❌ 材料不足（已完成 ${i}/${count} 次）`)
        return
      }

      // 扣除材料
      fullInventory = consumeIngredients(fullInventory, recipe.ingredients)
    }

    // 更新整个背包（快捷栏会自动从前8个槽位派生）
    setInventorySlots(fullInventory)

    // 开始加工
    const now = Date.now()
    const processEndTime = now + recipe.processTime * 1000

    setPlacedMachines((prev) => {
      const updated = new Map(prev)
      const updatedMachine = { ...machine }
      updatedMachine.processing = true
      updatedMachine.recipeId = recipeId
      updatedMachine.processStartTime = now
      updatedMachine.processEndTime = processEndTime
      updatedMachine.processedCount = count  // 保存加工次数
      updated.set(machineId, updatedMachine)
      return updated
    })

    const totalCount = count * recipe.outputCount
    setMessage(`🔥 开始研磨 ${count} 次，需要 ${recipe.processTime} 秒，产出 ${totalCount} 个${recipe.name}`)
  }

  // 收取成品
  const handleCollectProduct = (machineId: string) => {
    const machine = placedMachines.get(machineId)
    if (!machine || !machine.recipeId) return

    const recipe = getRecipe(machine.machineType, machine.recipeId)
    if (!recipe) return

    // 获取加工次数，如果没有则默认为1
    const processedCount = machine.processedCount || 1
    const totalCount = processedCount * recipe.outputCount

    console.log('📦 收取成品 - processedCount:', processedCount, 'recipe.outputCount:', recipe.outputCount, 'total:', totalCount)
    console.log('📦 机器信息:', machine)

    // 添加成品到背包（使用总数量）
    addItemToInventory(recipe.output as any, totalCount)

    // 延迟检查背包状态
    setTimeout(() => {
      console.log('📦 延迟检查 - 当前背包槽数:', inventorySlots.length)
      const flourSlots = inventorySlots.filter((slot, idx) => {
        const hasFlour = (slot as any).foodType === 'flour'
        if (hasFlour) {
          console.log(`📦 槽位${idx}有面粉:`, slot)
        }
        return hasFlour
      })
      console.log('📦 背包中面粉槽数:', flourSlots.length)
    }, 100)

    // 清除加工状态
    setPlacedMachines((prev) => {
      const updated = new Map(prev)
      const updatedMachine = { ...machine }
      updatedMachine.processing = false
      updatedMachine.recipeId = undefined
      updatedMachine.processStartTime = undefined
      updatedMachine.processEndTime = undefined
      updatedMachine.processedCount = undefined
      updated.set(machineId, updatedMachine)
      return updated
    })

    const foodConfig = FOOD_ITEMS[recipe.output]
    setMessage(`✅ 获得了${foodConfig.icon} ${foodConfig.name} x${totalCount}`)
    setShowMachinePanel(false)
    setSelectedMachine(null)
    // 设置冷却期，防止立即重新打开
    setMachinePanelCooldown(true)
    setTimeout(() => {
      setMachinePanelCooldown(false)
    }, 500) // 500ms冷却时间
    // 重新获取指针锁定，恢复游戏控制
    const canvas = document.querySelector('canvas')
    if (canvas && !showInventory && !showShop && !showColorPanel && !showShortcutHelp) {
      canvas.requestPointerLock()
    }
  }

  // 收起动物
  const handleRemoveAnimal = (animal: PlacedAnimal) => {
    const config = ANIMAL_CONFIGS[animal.animalId]

    // 从动物列表中移除
    setAnimals((prev) => prev.filter((a) => a.id !== animal.id))

    // 返还到背包（保留状态）
    addItemToInventory(animal.animalId, 1)

    const stageText = animal.growthStage === 'baby' ? '幼崽' : animal.growthStage === 'growing' ? '成长中' : '成年'
    setMessage(`✅ 已收起${config.name}（${stageText}）`)
  }

  // 处理动物状态更新（从PlacedAnimal组件回调）
  const handleAnimalUpdate = (updatedAnimal: PlacedAnimal) => {
    setAnimals((prev) =>
      prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a))
    )
  }

  // 动物生长系统（定时器）
  useEffect(() => {
    const growthInterval = setInterval(() => {
      setAnimals((prev) => {
        let hasChanges = false
        const currentTime = Date.now()

        const updated = prev.map((animal) => {
          const config = ANIMAL_CONFIGS[animal.animalId]
          let newAnimal = { ...animal }

          // 1. 检查生长阶段升级
          if (shouldUpgradeGrowthStage(animal)) {
            if (animal.growthStage === 'baby') {
              newAnimal.growthStage = 'growing'
              setMessage(`🎉 ${config.name}长大了！`)
              hasChanges = true
            } else if (animal.growthStage === 'growing') {
              newAnimal.growthStage = 'adult'
              setMessage(`🎉 ${config.name}成年了！`)
              hasChanges = true
            }
          }

          // 2. 检查饥饿（简化逻辑：只在过去hungerRate时间没喂食时扣一次血）
          const timeSinceLastFed = currentTime - animal.lastFed

          // 初始化或获取上次饥饿检查时间（如果不存在，使用当前时间，避免一次性扣很多血）
          let lastHungerCheck = (animal as any).lastHungerCheck
          if (!lastHungerCheck || lastHungerCheck < animal.lastFed) {
            lastHungerCheck = animal.lastFed
            newAnimal.lastHungerCheck = lastHungerCheck as any
          }

          // 计算上次检查以来经过了多少个完整的饥饿周期
          const intervalsSinceLastCheck = Math.floor((currentTime - lastHungerCheck) / config.needs.hungerRate)

          // 调试输出
          if (config.name === '鸡' && intervalsSinceLastCheck > 0) {
            console.log(`🐔 鸡的健康检查:`, {
              timeSinceLastFed: Math.floor(timeSinceLastFed / 1000) + '秒',
              timeSinceHungerCheck: Math.floor((currentTime - lastHungerCheck) / 1000) + '秒',
              lastHungerCheck: lastHungerCheck === animal.lastFed ? '初始时间' : '上次检查',
              intervalsSinceLastCheck,
              currentHealth: animal.health,
              hungerRate_raw: config.needs.hungerRate,
              hungerRate_display: Math.floor(config.needs.hungerRate / 1000) + '秒',
              damage: intervalsSinceLastCheck * config.needs.hungerDamage,
              config_needs: config.needs
            })
          }

          // 如果有新的完整周期，扣血
          if (intervalsSinceLastCheck > 0 && timeSinceLastFed >= config.needs.hungerRate) {
            const totalDamage = intervalsSinceLastCheck * config.needs.hungerDamage
            newAnimal.health = Math.max(0, animal.health - totalDamage)
            newAnimal.hunger = Math.min(100, animal.hunger + intervalsSinceLastCheck * 10)
            newAnimal.lastHungerCheck = currentTime as any  // 更新检查时间

            if (newAnimal.health <= 0 && animal.health > 0) {
              // 动物饿死
              console.log(`💔 ${config.name}饿死了！存活时间: ${Math.floor(timeSinceLastFed / 1000)}秒`)
              setMessage(`💔 ${config.name}饿死了...`)
              hasChanges = true
            } else if (newAnimal.health < 30 && animal.health >= 30) {
              // 饥饿警告
              setMessage(`⚠️ ${config.name}非常饿了！`)

              // 播放警告音效（只在第一次警告时）
              if (animal.health >= 30) {
                audioManager.playInteractionSound('warning')
              }

              hasChanges = true
            }
          } else if (timeSinceLastFed >= config.needs.hungerRate) {
            // 已经饿了但还没到下一个扣血周期
            newAnimal.hunger = Math.min(100, 50 + Math.floor((timeSinceLastFed / config.needs.hungerRate) * 20))
          }

          // 3. 成年动物产出检查
          if (animal.growthStage === 'adult' && canAnimalProduce(animal)) {
            const product = config.product
            if (product.type && product.type !== 'meat') {
              // 掉落产品
              const droppedItem = {
                id: `product_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                type: product.type as any,
                position: [animal.position[0], 0, animal.position[2]] as [number, number, number],
                count: product.amount
              }

              setDroppedItems((prevItems) => [...prevItems, droppedItem])
              newAnimal.lastProduct = currentTime
              setMessage(`🎁 ${config.name}产出了${product.type === 'egg' ? '鸡蛋' : product.type === 'milk' ? '牛奶' : '羊毛'}！`)

              // 播放产出音效
              audioManager.playInteractionSound('product')

              hasChanges = true
            }
          }

          return newAnimal
        })

        // 移除死亡的动物
        const alive = updated.filter((a) => a.health > 0)

        return hasChanges || alive.length !== prev.length ? alive : prev
      })
    }, 1000) // 每秒检查一次

    return () => clearInterval(growthInterval)
  }, [])

  // 动物移动决策系统（每500ms检查一次是否需要移动）
  useEffect(() => {
    const moveDecisionInterval = setInterval(() => {
      const currentTime = Date.now()

      setAnimals((prev) => {
        let hasChanges = false

        const updated = prev.map((animal) => {
          const config = ANIMAL_CONFIGS[animal.animalId]
          let newAnimal = { ...animal }

          // 检查是否在休息期
          const isResting = animal.restUntil && currentTime < animal.restUntil

          // 如果正在移动，不需要决策
          if (animal.isMoving) {
            return newAnimal
          }

          // 如果在休息期，不需要决策
          if (isResting) {
            return newAnimal
          }

          // 检查是否应该做出新的移动决策
          const timeSinceLastMove = currentTime - (animal.lastMoveTime || currentTime)
          const shouldMakeDecision = timeSinceLastMove >= config.movement.moveIntervalMax

          if (shouldMakeDecision) {
            // 70% 概率移动，30% 概率休息
            const shouldMove = Math.random() < 0.7

            if (shouldMove) {
              // 决定移动，尝试找到一个未被占用的目标位置
              let foundValidTarget = false
              let attempts = 0
              const maxAttempts = 10 // 最多尝试10次

              while (!foundValidTarget && attempts < maxAttempts) {
                const angle = Math.random() * Math.PI * 2 // 随机方向
                const distance = 0.5 + Math.random() * (config.movement.moveDistance - 0.5) // 随机距离

                const targetX = animal.position[0] + Math.cos(angle) * distance
                const targetZ = animal.position[2] + Math.sin(angle) * distance

                // 检查目标位置是否被占用（排除自己）
                if (!isPositionOccupied(targetX, targetZ, animal.id)) {
                  newAnimal.targetPosition = [targetX, animal.position[1], targetZ]
                  newAnimal.isMoving = true
                  newAnimal.lastMoveTime = currentTime
                  foundValidTarget = true
                  hasChanges = true
                }

                attempts++
              }

              // 如果尝试多次都找不到有效位置，选择休息
              if (!foundValidTarget) {
                const restDuration = config.movement.restTimeMin +
                  Math.random() * (config.movement.restTimeMax - config.movement.restTimeMin)

                newAnimal.restUntil = currentTime + restDuration
                newAnimal.lastMoveTime = currentTime
                hasChanges = true
              }
            } else {
              // 决定休息
              const restDuration = config.movement.restTimeMin +
                Math.random() * (config.movement.restTimeMax - config.movement.restTimeMin)

              newAnimal.restUntil = currentTime + restDuration
              newAnimal.lastMoveTime = currentTime
              hasChanges = true
            }
          }

          return newAnimal
        })

        return hasChanges ? updated : prev
      })
    }, 500) // 每500毫秒检查一次

    return () => clearInterval(moveDecisionInterval)
  }, [])

  // 动物声音系统（每500ms检查一次是否需要叫）
  useEffect(() => {
    const soundInterval = setInterval(() => {
      const currentTime = Date.now()

      setAnimals((prev) => {
        let hasChanges = false

        const updated = prev.map((animal) => {
          const config = ANIMAL_CONFIGS[animal.animalId]
          let newAnimal = { ...animal }

          // 检查是否到了可以叫的时间
          if (currentTime >= (animal.nextSoundTime || 0)) {
            // 根据概率决定是否叫
            if (Math.random() < config.sound.callProbability) {
              // 计算玩家到动物的距离
              const currentPlayerPos = playerPositionRef.current
              const dx = animal.position[0] - currentPlayerPos[0]
              const dz = animal.position[2] - currentPlayerPos[2]
              const distance = Math.sqrt(dx * dx + dz * dz)

              // 只在玩家听觉范围内（15个单位）播放声音
              if (distance < 15) {
                audioManager.playAnimalSound(animal.animalId, distance)

                // 计算下次可以叫的时间
                const nextInterval = config.sound.callIntervalMin +
                  Math.random() * (config.sound.callIntervalMax - config.sound.callIntervalMin)

                newAnimal.lastSoundTime = currentTime
                newAnimal.nextSoundTime = currentTime + nextInterval
                hasChanges = true
              }
            } else {
              // 即使不叫，也要更新下次检查时间
              const nextInterval = config.sound.callIntervalMin +
                Math.random() * (config.sound.callIntervalMax - config.sound.callIntervalMin)

              newAnimal.nextSoundTime = currentTime + nextInterval
              hasChanges = true
            }
          }

          return newAnimal
        })

        return hasChanges ? updated : prev
      })
    }, 500) // 每500毫秒检查一次

    return () => clearInterval(soundInterval)
  }, [])

  // 树木生长和成熟检测（每2秒检查一次）
  useEffect(() => {
    const treeCheckInterval = setInterval(() => {
      setPlots((prevPlots) => {
        const newPlots = new Map(prevPlots)
        let hasChanges = false

        newPlots.forEach((plot, posKey) => {
          // 只检查树木状态
          if (plot.state === 'tree' && plot.treeType && plot.plantTime) {
            const isReady = isTreeReady({
              treeType: plot.treeType,
              plantTime: plot.plantTime,
              lastHarvestTime: plot.lastHarvestTime
            })

            if (isReady) {
              plot.state = 'tree_ready'
              newPlots.set(posKey, plot)
              hasChanges = true

              const treeConfig = getTreeConfig(plot.treeType)
              setMessage(`🌳 ${treeConfig.name}成熟了！点击收获水果`)
            }
          }
        })

        return hasChanges ? newPlots : prevPlots
      })
    }, 2000) // 每2秒检查一次

    return () => clearInterval(treeCheckInterval)
  }, [])

  // 机器加工完成检测（每秒检查一次）
  useEffect(() => {
    const processingInterval = setInterval(() => {
      setPlacedMachines((prev) => {
        const currentTime = Date.now()
        let hasChanges = false

        const updated = new Map(prev)

        updated.forEach((machine, machineId) => {
          // 检查正在加工的机器
          if (machine.processing && machine.processEndTime) {
            if (currentTime >= machine.processEndTime) {
              // 加工完成
              const updatedMachine = { ...machine }
              updatedMachine.processing = false // 停止加工状态
              updated.set(machineId, updatedMachine)
              hasChanges = true

              const recipe = getRecipe(machine.machineType, machine.recipeId!)
              if (recipe) {
                setMessage(`✅ ${recipe.name}制作完成！点击机器收取成品`)
              }
            }
          }
        })

        return hasChanges ? updated : prev
      })
    }, 1000) // 每秒检查一次

    return () => clearInterval(processingInterval)
  }, [])

  // 开发者工具系统（用于测试）
  useEffect(() => {
    // 只在开发模式下启用
    if (process.env.NODE_ENV !== 'production') {
      // @ts-ignore
      window.devTools = {
        // 添加物品到背包
        addItem: (itemType: string, itemId: string, count: number) => {
          addItemToInventory(itemId as any, count)
          setMessage(`🔧 [开发者] 已添加 ${itemId} x${count}`)
        },

        // 添加金币
        addGold: (amount: number) => {
          setGold((prev) => prev + amount)
          setMessage(`🔧 [开发者] 已添加 ${amount} 金币`)
        },

        // 设置金币
        setGold: (amount: number) => {
          setGold(amount)
          setMessage(`🔧 [开发者] 金币已设置为 ${amount}`)
        },

        // 解锁所有作物
        unlockAllCrops: () => {
          const allCrops: CropType[] = ['wheat', 'carrot', 'potato', 'tomato', 'corn', 'strawberry']
          setUnlockedCrops(allCrops)
          setMessage(`🔧 [开发者] 已解锁所有作物`)
        },

        // 设置体力
        setStamina: (amount: number) => {
          setStamina(amount)
          setMessage(`🔧 [开发者] 体力已设置为 ${amount}`)
        },

        // 添加机器到背包
        addMachine: (machineType: MachineType) => {
          addItemToInventory(machineType as any, 1)
          setMessage(`🔧 [开发者] 已添加 ${machineType}`)
        },

        // 完成当前机器的加工
        completeMachineProcessing: (machineId: string) => {
          setPlacedMachines((prev) => {
            const updated = new Map(prev)
            const machine = updated.get(machineId)
            if (machine && machine.processing) {
              const updatedMachine = { ...machine }
              updatedMachine.processing = false
              updatedMachine.processEndTime = Date.now() - 1000 // 设置为已完成
              updated.set(machineId, updatedMachine)
              setMessage(`🔧 [开发者] 机器加工已完成`)
            }
            return updated
          })
        },

        // 获取当前游戏状态
        getState: () => {
          return {
            gold,
            stamina,
            satiety,
            hotbarSlots,
            inventorySlots,
            placedMachines: Array.from(placedMachines.entries()),
            unlockedCrops
          }
        }
      }

      console.log('%c🔧 开发者工具已启用', 'color: #00ff00; font-size: 14px; font-weight: bold')
      console.log('%c使用方法:', 'color: #ffd700; font-size: 12px')
      console.log('  devTools.addItem(itemType, itemId, count)  - 添加物品')
      console.log('  devTools.addGold(amount)                   - 添加金币')
      console.log('  devTools.addMachine(machineType)           - 添加机器')
      console.log('  devTools.unlockAllCrops()                  - 解锁所有作物')
      console.log('  devTools.setStamina(amount)                - 设置体力')
      console.log('  devTools.getState()                        - 获取游戏状态')
      console.log('%c示例:', 'color: #ffd700; font-size: 12px')
      console.log('  devTools.addGold(1000)')
      console.log('  devTools.addItem("crop", "wheat", 20)')
      console.log('  devTools.addMachine("machine_grinder")')
    }
  }, [])

  // 动物左键交互（喂养）
  const handleAnimalClick = (animal: PlacedAnimal) => {
    const selectedItem = inventorySlots[selectedHotbarSlot]

    // 检查是否拿着饲料
    if (!selectedItem || isEmpty(selectedItem)) {
      setMessage('❌ 手拿饲料才能喂养动物')
      return
    }

    const config = ANIMAL_CONFIGS[animal.animalId]
    const canFeed = config.needs.foods.some(food => {
      // 检查是否是匹配的饲料
      if (selectedItem.itemType === 'crop') {
        return food === selectedItem.cropType
      }
      if (selectedItem.itemType === 'item') {
        return food === selectedItem.id
      }
      return false
    })

    if (!canFeed) {
      setMessage(`❌ ${config.name}不吃这个，需要：${config.needs.foods.join(', ')}`)
      return
    }

    // 喂养成功
    setAnimals(prev => prev.map(a => {
      if (a.id === animal.id) {
        const updated = { ...a }
        updated.lastFed = Date.now()
        updated.hunger = 100
        updated.happiness = Math.min(100, a.happiness + 20)
        return updated
      }
      return a
    }))

    // 消耗1个饲料
    const newCount = selectedItem.count - 1
    if (newCount <= 0) {
      updateHotbarSlot(selectedHotbarSlot, createEmptyStack())
    } else {
      updateHotbarSlot(selectedHotbarSlot, { ...selectedItem, count: newCount })
    }

    setMessage(`✅ 喂养了${config.name}！`)
    audioManager.playInteractionSound('success')
  }

  // 动物右键交互（击杀）
  const handleAnimalRightClick = (animal: PlacedAnimal) => {
    const selectedItem = inventorySlots[selectedHotbarSlot]

    // 检查是否拿着镰刀
    if (!selectedItem || isEmpty(selectedItem) || selectedItem.toolType !== 'sickle') {
      setMessage('❌ 需要手持镰刀才能击杀动物')
      return
    }

    const config = ANIMAL_CONFIGS[animal.animalId]

    // 第一次攻击：造成伤害
    if (animal.health > 50) {
      setAnimals(prev => prev.map(a => {
        if (a.id === animal.id) {
          const updated = { ...a, health: 50 }
          return updated
        }
        return a
      }))
      setMessage(`⚔️ 击中了${config.name}！造成伤害（再点一次击杀）`)
      audioManager.playInteractionSound('hit')
      return
    }

    // 第二次攻击：击杀
    // 掉落对应动物的肉
    let meatType: 'pork' | 'beef' | 'chicken_meat' | 'mutton'
    let meatName: string

    if (animal.animalId === 'pig') {
      meatType = 'pork'
      meatName = '猪肉'
    } else if (animal.animalId === 'cow') {
      meatType = 'beef'
      meatName = '牛肉'
    } else if (animal.animalId === 'chicken') {
      meatType = 'chicken_meat'
      meatName = '鸡肉'
    } else {
      meatType = 'mutton'
      meatName = '羊肉'
    }

    const meatAmount = animal.animalId === 'pig' ? 3 : animal.animalId === 'cow' ? 2 : animal.animalId === 'chicken' ? 1 : 2
    const droppedItem = {
      id: `${meatType}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: meatType as any,
      position: [animal.position[0], 0, animal.position[2]] as [number, number, number],
      count: meatAmount
    }
    setDroppedItems(prev => [...prev, droppedItem])

    // 移除动物
    setAnimals(prev => prev.filter(a => a.id !== animal.id))

    setMessage(`💀 击杀了${config.name}！获得 ${meatAmount} 个${meatName}`)
    audioManager.playInteractionSound('kill')
  }

  // 机器左键交互（打开机器面板）
  const handleMachineClick = (machineId: string) => {
    console.log('🎯 [Test3DGame] handleMachineClick triggered')
    console.log('🎯 [Test3DGame] showMachinePanel:', showMachinePanel)
    console.log('🎯 [Test3DGame] machinePanelCooldown:', machinePanelCooldown)
    console.log('🎯 [Test3DGame] pointerLockElement:', document.pointerLockElement)

    // 如果面板已经打开或处于冷却期，不要重新打开
    if (showMachinePanel || machinePanelCooldown) {
      console.log('🎯 [Test3DGame] Blocked: panel open or cooldown')
      return
    }

    // 立即退出指针锁定，让鼠标可以点击UI
    document.exitPointerLock()
    console.log('🎯 [Test3DGame] exitPointerLock called')

    setSelectedMachine(machineId)
    console.log('🎯 [Test3DGame] selectedMachine set to:', machineId)

    setShowMachinePanel(true)
    console.log('🎯 [Test3DGame] showMachinePanel set to true')
  }

  // 机器面板：开始加工
  const handleMachinePanelStartProcessing = (recipeId: string, count: number) => {
    if (selectedMachine) {
      handleStartProcessing(selectedMachine, recipeId, count)
    }
  }

  // 机器面板：收取成品
  const handleMachinePanelCollectProduct = () => {
    if (selectedMachine) {
      handleCollectProduct(selectedMachine)
    }
  }

  // 购买材料
  const buyMaterial = (type: 'wood' | 'stone' | 'dirt' | 'glass' | 'door' | 'planks', count: number) => {
    const prices = { wood: 5, stone: 8, dirt: 3, glass: 15, door: 20, planks: 6 }
    const cost = count * prices[type]

    if (gold < cost) {
      setMessage('❌ 金币不足！')
      return
    }

    setGold((prev) => prev - cost)
    setInventory((prev) => ({ ...prev, [type]: prev[type] + count }))

    // 同时添加到新背包系统
    addItemToInventory(type, count)

    setMessage(`✅ 购买了 ${count} 个 ${type}，花费 ${cost} 金币`)
  }

  // 购买其他物品（种子、工具、机器等）
  const buyItem = (itemId: string, count: number) => {
    import('../config/ShopConfig').then(({ BUYABLE_ITEMS }) => {
      const item = BUYABLE_ITEMS.find(i => i.id === itemId)

      if (!item) {
        setMessage('❌ 商品不存在！')
        return
      }

      const totalCost = item.price * count

      if (gold < totalCost) {
        setMessage('❌ 金币不足！')
        return
      }

      // 扣除金币
      setGold((prev) => prev - totalCost)

      // 根据商品类型添加到背包
      if (item.category === 'crops') {
        // 作物：可以直接种植
        addItemToInventory(itemId, count)
        setMessage(`✅ 购买了 ${count} 个 ${item.name}，花费 ${totalCost} 金币`)
      } else if (item.category === 'tools') {
        // 工具：提取toolType（去掉tool_前缀）
        const toolType = itemId.replace('tool_', '') as ToolType
        // 对于wood系列工具，还需要去掉_wood后缀
        const finalToolType = toolType.replace('_wood', '') as ToolType
        console.log('购买工具:', itemId, '->', finalToolType)
        addItemToInventory(finalToolType, 1)
        setMessage(`✅ 购买了 ${item.name}，花费 ${totalCost} 金币`)
      } else if (item.category === 'machines') {
        // 机器：作为物品添加
        console.log('购买机器:', itemId)
        addItemToInventory(itemId as any, count)
        setMessage(`✅ 购买了 ${item.name}，花费 ${totalCost} 金币`)
      } else if (item.category === 'decorations') {
        // 装饰品：直接使用itemId
        console.log('购买装饰品:', itemId)
        addItemToInventory(itemId as DecorationType, count)
        setMessage(`✅ 购买了 ${count} 个 ${item.name}，花费 ${totalCost} 金币`)
      } else if (item.category === 'animals') {
        // 动物和设施：直接使用itemId
        console.log('购买动物/设施:', itemId)
        addItemToInventory(itemId as any, count)
        setMessage(`✅ 购买了 ${count} 个 ${item.name}，花费 ${totalCost} 金币`)
      } else if (item.category === 'special') {
        // 特殊物品：直接使用itemId
        console.log('购买特殊物品:', itemId)
        addItemToInventory(itemId as SpecialType, count)
        setMessage(`✅ 购买了 ${count} 个 ${item.name}，花费 ${totalCost} 金币`)
      } else {
        // 其他物品（材料等）
        console.log('购买其他:', itemId)
        addItemToInventory(itemId as any, count)
        setMessage(`✅ 购买了 ${count} 个 ${item.name}，花费 ${totalCost} 金币`)
      }
    })
  }

  // 出售物品给商店（商店界面调用）
  const sellItem = (itemId: string, count: number) => {
    // 动态导入配置（保持兼容性）
    import('../config/ShopConfig').then(({ SELLABLE_ITEMS }) => {
      const item = SELLABLE_ITEMS.find(i => i.id === itemId)

      if (!item) {
        setMessage('❌ 商品不存在！')
        return
      }

      // 从 itemId 中解析物品类型
      // 例如: 'crop_carrot' -> itemType: 'crop', subType: 'carrot'
      const parts = itemId.split('_')
      const itemType = parts[0] // 'crop', 'fruit', 'product', 'mineral'
      const subType = parts[1] // 'carrot', 'apple', 'egg', 'gold'

      // 在背包中查找并移除物品
      let remainingCount = count
      const slotsToRemove: number[] = []

      // 遍历所有背包槽位（快捷栏+背包）
      for (let i = 0; i < inventorySlots.length && remainingCount > 0; i++) {
        const stack = inventorySlots[i]
        if (!stack || stack.count === 0) continue

        // 根据物品类型匹配
        let isMatch = false
        if (itemType === 'crop' && stack.itemType === 'crop' && stack.cropType === subType) {
          isMatch = true
        } else if (itemType === 'fruit' && (stack as any).treeType === subType) {
          isMatch = true
        } else if (itemType === 'product' && (stack as any).productType === subType) {
          isMatch = true
        } else if (itemType === 'mineral' && (stack as any).mineralType === subType) {
          isMatch = true
        }

        if (isMatch) {
          const toRemove = Math.min(stack.count, remainingCount)
          remainingCount -= toRemove

          // 更新槽位
          const newCount = stack.count - toRemove
          if (newCount === 0) {
            slotsToRemove.push(i)
          } else {
            setInventorySlots((prev) => {
              const newSlots = [...prev]
              newSlots[i] = { ...stack, count: newCount }
              return newSlots
            })
          }
        }
      }

      // 清理空槽位
      if (slotsToRemove.length > 0) {
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          slotsToRemove.forEach(idx => {
            newSlots[idx] = createEmptyStack()
            newSlots[idx].id = ''
          })
          return newSlots
        })
      }

      // 如果没有足够的物品
      if (remainingCount > 0) {
        setMessage(`❌ 背包中只有 ${count - remainingCount} 个${item.name}`)
        return
      }

      // 增加金币
      const earnings = item.price * count
      setGold((prev) => prev + earnings)
      setMessage(`💰 出售了 ${count} 个 ${item.name}，获得 ${earnings} 金币`)
    })
  }

  // ===== 新背包系统处理函数 =====

  /**
   * 添加物品到背包（优先快捷栏，再背包）
   * 使用单一状态更新，避免批处理冲突
   */
  const addItemToInventory = (
    type: BlockType | CropType | ToolType | DecorationType | MachineType | AnimalType | SpecialType | FacilityType | AnimalProductType | TreeType | FoodType | string,
    count: number
  ) => {
    console.log('📦 addItemToInventory - type:', type, 'count:', count)
    const newStack = createStack(type as any, count)
    if (!newStack) {
      console.error('❌ 创建物品堆叠失败:', type)
      return
    }
    console.log('✅ 创建物品成功:', newStack)

    // 使用单一状态更新，一次性处理所有逻辑
    setInventorySlots((prev) => {
      console.log('📦 当前背包槽位数:', prev.length)
      const newSlots = [...prev]
      let remainingCount = count

      // 1. 先尝试堆叠到快捷栏（背包前8个槽位）
      for (let i = 0; i < 8 && remainingCount > 0; i++) {
        if (canStack(newSlots[i], newStack)) {
          const merged = mergeStacks(newSlots[i], newStack)
          if (merged) {
            const canAdd = Math.min(remainingCount, merged.maxStack - newSlots[i].count)
            newSlots[i] = { ...newSlots[i], count: newSlots[i].count + canAdd }
            remainingCount -= canAdd
            console.log(`✅ 堆叠到快捷栏槽位${i}，添加${canAdd}个，剩余${remainingCount}个`)
          }
        }
      }

      // 2. 剩余的尝试放入背包其他槽位
      for (let i = 8; i < newSlots.length && remainingCount > 0; i++) {
        if (isEmpty(newSlots[i])) {
          const stack = createStack(type as any, Math.min(remainingCount, 64))
          if (stack) {
            newSlots[i] = stack
            remainingCount -= stack.count
            console.log(`✅ 放入主背包槽位${i}，添加${stack.count}个，剩余${remainingCount}个`)
          }
        } else if (canStack(newSlots[i], newStack)) {
          const merged = mergeStacks(newSlots[i], newStack)
          if (merged) {
            const canAdd = Math.min(remainingCount, merged.maxStack - newSlots[i].count)
            newSlots[i] = { ...newSlots[i], count: newSlots[i].count + canAdd }
            remainingCount -= canAdd
            console.log(`✅ 堆叠到主背包槽位${i}，添加${canAdd}个，剩余${remainingCount}个`)
          }
        }
      }

      console.log('📦 最终背包槽位数:', newSlots.length)
      return newSlots
    })
  }

  /**
   * 移动物品（拖拽）
   */
  const handleMoveItem = (
    fromIndex: number,
    toIndex: number,
    fromHotbar: boolean,
    toHotbar: boolean
  ) => {
    // 快捷栏就是背包的前8个槽位
    const fromSlot = inventorySlots[fromIndex]
    const toSlot = inventorySlots[toIndex]

    if (isEmpty(fromSlot)) return

    // 如果目标槽位为空，直接移动
    if (isEmpty(toSlot)) {
      setInventorySlots((prev) => {
        const newSlots = [...prev]
        newSlots[toIndex] = fromSlot
        newSlots[fromIndex] = createEmptyStack()
        newSlots[fromIndex].id = ''
        return newSlots
      })
      return
    }

    // 如果可以堆叠，合并
    if (canStack(fromSlot, toSlot)) {
      const merged = mergeStacks(fromSlot, toSlot)
      if (merged) {
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          newSlots[toIndex] = merged
          newSlots[fromIndex] = createEmptyStack()
          newSlots[fromIndex].id = ''
          return newSlots
        })
        return
      }
    }

    // 交换位置
    setInventorySlots((prev) => {
      const newSlots = [...prev]
      const temp = newSlots[fromIndex]
      newSlots[fromIndex] = newSlots[toIndex]
      newSlots[toIndex] = temp
      return newSlots
    })
  }

  /**
   * 出售物品（背包右键点击）
   */
  const handleSellItemFromNewInventory = (slotIndex: number, isHotbar: boolean, count: number) => {
    const slots = isHotbar ? hotbarSlots : inventorySlots
    const stack = slots[slotIndex]

    if (isEmpty(stack)) return

    // 动态导入配置
    import('../config/ShopConfig').then(({ SELLABLE_ITEMS }) => {
      // 根据物品类型生成 itemId
      let itemId: string | null = null
      let itemName: string = '物品'

      // 作物
      if (stack.itemType === 'crop' && stack.cropType) {
        itemId = `crop_${stack.cropType}`
        itemName = { carrot: '胡萝卜', wheat: '小麦', potato: '土豆', tomato: '番茄', pumpkin: '南瓜' }[stack.cropType] || stack.cropType
      }
      // 水果
      else if ((stack as any).treeType) {
        itemId = `fruit_${(stack as any).treeType}`
        itemName = { apple: '苹果', orange: '橙子', peach: '桃子', cherry: '樱桃', pear: '梨' }[(stack as any).treeType] || (stack as any).treeType
      }
      // 动物产品
      else if ((stack as any).productType) {
        itemId = `product_${(stack as any).productType}`
        itemName = { egg: '鸡蛋', milk: '牛奶', wool: '羊毛', meat: '肉类' }[(stack as any).productType] || (stack as any).productType
      }
      // 矿物
      else if ((stack as any).mineralType) {
        itemId = `mineral_${(stack as any).mineralType}`
        itemName = { gold: '金矿', silver: '银矿', iron: '铁矿' }[(stack as any).mineralType] || (stack as any).mineralType
      }

      // 如果不是可出售的物品
      if (!itemId) {
        setMessage('❌ 该物品不可出售')
        return
      }

      // 查找配置
      const item = SELLABLE_ITEMS.find(i => i.id === itemId)
      if (!item) {
        setMessage(`❌ ${itemName}不可出售`)
        return
      }

      const price = item.price
      const totalMoney = price * count

      // 增加金币
      setGold((prev) => prev + totalMoney)

      // 减少数量（快捷栏就是背包前8个槽位）
      setInventorySlots((prev) => {
        const newSlots = [...prev]
        const newCount = Math.max(0, newSlots[slotIndex].count - count)
        newSlots[slotIndex] = { ...newSlots[slotIndex], count: newCount }
        if (newCount === 0) {
          newSlots[slotIndex] = createEmptyStack()
          newSlots[slotIndex].id = ''
        }
        return newSlots
      })

      setMessage(`💰 出售了 ${count} 个${itemName}，获得 ${totalMoney} 金币`)
    })
  }

  /**
   * 使用物品
   */
  const handleUseItem = (slotIndex: number, isHotbar: boolean) => {
    const slots = isHotbar ? hotbarSlots : inventorySlots
    const stack = slots[slotIndex]

    if (isEmpty(stack)) return

    // 如果是食物，食用
    if ((stack as any).foodType && FOOD_ITEMS[(stack as any).foodType as FoodType]) {
      const foodType = (stack as any).foodType as FoodType
      const foodConfig = FOOD_ITEMS[foodType]

      // 恢复体力
      const staminaRestore = foodConfig.staminaRestore
      setStamina((prev) => Math.min(maxStamina, prev + staminaRestore))

      // 恢复饱食度
      setSatiety((prev) => Math.min(100, prev + foodConfig.satiety))

      // 应用增益效果
      if (foodConfig.buff) {
        const now = Date.now()
        setActiveBuffs((prev) => [
          ...prev,
          {
            type: foodConfig.buff!.type,
            value: foodConfig.buff!.value,
            endTime: now + foodConfig.buff!.duration * 1000
          }
        ])
      }

      // 消耗1个食物
      const updateSlots = (targetSlots: ItemStack[]) => {
        const newSlots = [...targetSlots]
        if (newSlots[slotIndex].count > 1) {
          newSlots[slotIndex] = {
            ...newSlots[slotIndex],
            count: newSlots[slotIndex].count - 1
          }
        } else {
          newSlots[slotIndex] = createEmptyStack()
          newSlots[slotIndex].id = ''
        }
        return newSlots
      }

      if (isHotbar) {
        setInventorySlots(updateSlots)
      } else {
        setInventorySlots(updateSlots)
      }

      let buffText = ''
      if (foodConfig.buff) {
        buffText = `，获得${foodConfig.buff.type === 'speed' ? '速度' : foodConfig.buff.type === 'efficiency' ? '效率' : '幸运'}+${foodConfig.buff.value}%增益`
      }

      setMessage(`😋 食用了${foodConfig.icon} ${foodConfig.name}，恢复${staminaRestore}体力${buffText}`)
      return
    }

    // 如果是工具，切换当前工具
    if (stack.itemType === 'tool' && stack.toolType) {
      setSelectedHotbarSlot(isHotbar ? slotIndex : selectedHotbarSlot)
      setMessage(`✅ 切换到 ${stack.name}`)
    }
  }

  // 处理装饰品拆除
  const handleDecorationRemove = (decorationId: string) => {
    const decoration = placedDecorations.get(decorationId)
    if (!decoration) return

    // 查找装饰品的配置
    const decorConfig = ITEM_CONFIG[decoration.decorationType]
    if (!decorConfig) return

    // 返回物品到背包（直接传入类型和数量）
    addItemToInventory(decoration.decorationType, 1)

    // 从装饰品列表中移除
    setPlacedDecorations((prev) => {
      const newMap = new Map(prev)
      newMap.delete(decorationId)
      return newMap
    })

    setMessage(`✅ 拆除了 ${decorConfig.name}`)
  }

  // 处理地块点击（使用射线检测）
  const handlePlotClick = (clickPosition: [number, number, number]) => {
    const [x, y, z] = clickPosition

    // 如果正在放置动物
    if (placingAnimal) {
      handlePlaceAnimal([x, y, z])
      return
    }

    // 如果正在放置机器
    if (placingMachine) {
      handlePlaceMachine([x, y, z])
      return
    }

    // 获取当前选中的快捷栏槽位物品
    const selectedItem = inventorySlots[selectedHotbarSlot]

    // 如果选中的是方块，放置方块
    if (selectedItem.itemType === 'block') {
      handlePlaceBlock([x, y, z])
      return
    }

    // 检查选中的是否是可放置的动物
    if (selectedItem.itemType === 'animal' && (selectedItem as any).animalType) {
      const animalItem = (selectedItem as any).animalType as string

      // 检查是否是设施（鸡舍、牛棚）
      if (animalItem === 'facility_chicken_coop' || animalItem === 'facility_barn') {
        // 放置设施
        handlePlaceFacility([x, y, z], animalItem as any)

        // 消耗1个设施
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          if (newSlots[selectedHotbarSlot].count > 1) {
            newSlots[selectedHotbarSlot] = {
              ...newSlots[selectedHotbarSlot],
              count: newSlots[selectedHotbarSlot].count - 1
            }
          } else {
            newSlots[selectedHotbarSlot] = createEmptyStack()
            newSlots[selectedHotbarSlot].id = ''
          }
          return newSlots
        })
        return
      }

      // 只有实际的动物可以放置（排除饲料、干草、设施）
      const placeableAnimals = ['animal_chicken', 'animal_cow', 'animal_sheep', 'animal_pig']

      if (placeableAnimals.includes(animalItem)) {
        // 去掉 'animal_' 前缀得到基础类型
        const baseAnimalType = animalItem.replace('animal_', '')
        // 放置动物
        handlePlaceAnimal([x, y, z], baseAnimalType)

        // 消耗1个动物（快捷栏就是背包前8个槽位）
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          if (newSlots[selectedHotbarSlot].count > 1) {
            newSlots[selectedHotbarSlot] = {
              ...newSlots[selectedHotbarSlot],
              count: newSlots[selectedHotbarSlot].count - 1
            }
          } else {
            newSlots[selectedHotbarSlot] = createEmptyStack()
            newSlots[selectedHotbarSlot].id = ''
          }
          return newSlots
        })
        return
      }
    }

    // 检查选中的是否是可放置的机器
    if (selectedItem.itemType === 'machine') {
      const machineType = (selectedItem as any).machineType as MachineType
      if (machineType) {
        // 放置机器
        handlePlaceMachine([x, y, z], machineType)

        // 消耗1个机器（快捷栏就是背包前8个槽位）
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          if (newSlots[selectedHotbarSlot].count > 1) {
            newSlots[selectedHotbarSlot] = {
              ...newSlots[selectedHotbarSlot],
              count: newSlots[selectedHotbarSlot].count - 1
            }
          } else {
            newSlots[selectedHotbarSlot] = createEmptyStack()
            newSlots[selectedHotbarSlot].id = ''
          }
          return newSlots
        })
        return
      }
    }

    // 检查是否有选中物品
    if (isEmpty(selectedItem)) {
      setMessage('❌ 请先在快捷栏选择一个工具、种子或动物（按1-8）')
      return
    }

    // 将位置对齐到网格（1x1x1单位，简化计算）
    const alignedX = Math.round(x)
    const alignedZ = Math.round(z)

    // 创建位置key
    const posKey = `${alignedX},${alignedZ}`

    // 检查选中的是否是可放置的装饰品（必须在 alignedX/alignedZ 定义之后）
    if (selectedItem.itemType === 'decoration') {
      const decorationType = (selectedItem as any).decorationType
      if (decorationType) {
        // 检查该位置是否已有装饰品
        if (placedDecorations.has(posKey)) {
          setMessage('❌ 该位置已有装饰品！')
          return
        }

        // 放置装饰品
        const newDecoration = {
          id: posKey,
          decorationType: decorationType as 'decor_table' | 'decor_chair' | 'decor_bed' | 'decor_cabinet' | 'decor_flowerpot' | 'decor_painting',
          position: [alignedX, y, alignedZ] as [number, number, number]
        }

        setPlacedDecorations((prev) => new Map(prev).set(posKey, newDecoration))

        // 消耗1个装饰品（快捷栏就是背包前8个槽位）
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          if (newSlots[selectedHotbarSlot].count > 1) {
            newSlots[selectedHotbarSlot] = {
              ...newSlots[selectedHotbarSlot],
              count: newSlots[selectedHotbarSlot].count - 1
            }
          } else {
            newSlots[selectedHotbarSlot] = createEmptyStack()
            newSlots[selectedHotbarSlot].id = ''
          }
          return newSlots
        })

        setMessage(`✅ 放置了 ${selectedItem.name}`)
        return
      }
    }

    const newPlots = new Map(plots)
    const plot = newPlots.get(posKey)

    // 根据选中槽位的物品类型决定行为
    if (selectedItem.itemType === 'tool' && selectedItem.toolType === 'hoe') {
      // 锄头：开垦土地
      // 检查体力
      const STAMINA_COST_TILLING = 2
      if (!hasEnoughStamina(STAMINA_COST_TILLING)) {
        setMessage('⚠️ 体力不足！开垦土地需要2点体力')
        return
      }

      if (!plot) {
        // 创建新地块
        const grassBlockKey = `${alignedX},0,${alignedZ}`
        setMinedBlocks((prev) => new Set([...prev, grassBlockKey]))

        newPlots.set(posKey, {
          state: 'tilled',
          position: [alignedX, -0.95, alignedZ],
          tilledTime: Date.now()  // 记录开垦时间
        })
        consumeStamina(STAMINA_COST_TILLING)
        setMessage('✅ 土地已开垦 (-2体力)')
      } else if (plot.state === 'empty') {
        const grassBlockKey = `${alignedX},0,${alignedZ}`
        setMinedBlocks((prev) => new Set([...prev, grassBlockKey]))

        plot.state = 'tilled'
        plot.position[1] = -0.95
        plot.tilledTime = Date.now()  // 记录开垦时间
        newPlots.set(posKey, plot)
        consumeStamina(STAMINA_COST_TILLING)
        setMessage('✅ 土地已开垦 (-2体力)')
      }
    } else if (selectedItem.itemType === 'tool' && selectedItem.toolType === 'watering_can') {
      // 水壶：浇水
      const STAMINA_COST_WATERING = 1
      if (!hasEnoughStamina(STAMINA_COST_WATERING)) {
        setMessage('⚠️ 体力不足！浇水需要1点体力')
        return
      }

      if (plot && (plot.state === 'tilled' || plot.state === 'planted')) {
        plot.state = plot.state === 'tilled' ? 'watered' : 'planted'
        newPlots.set(posKey, plot)
        consumeStamina(STAMINA_COST_WATERING)
        setMessage('✅ 土地已浇水 (-1体力)')
      } else if (!plot) {
        setMessage('⚠️ 这里没有耕地，不能浇水')
      }
    } else if (selectedItem.cropType) {
      // 种子：播种
      if (plot && (plot.state === 'tilled' || plot.state === 'watered')) {
        // 检查作物是否已解锁
        if (!unlockedCrops.includes(selectedItem.cropType)) {
          setMessage(`⚠️ 该作物尚未解锁！请先收获其他作物来解锁新种子`)
          return
        }

        const cropConfig = getCropConfig(selectedItem.cropType)
        plot.state = 'planted'
        plot.cropType = selectedItem.cropType
        plot.plantTime = Date.now()
        newPlots.set(posKey, plot)
        const realSeconds = cropConfig.growTime * 12 * 60 // 游戏天数转秒数
        setMessage(`✅ 已播种${cropConfig.name}，${cropConfig.growTime}游戏天后成熟（${realSeconds}秒）`)

        // 消耗1个种子（快捷栏就是背包前8个槽位）
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          if (newSlots[selectedHotbarSlot].count > 1) {
            // 如果还有多个种子，减少数量
            newSlots[selectedHotbarSlot] = {
              ...newSlots[selectedHotbarSlot],
              count: newSlots[selectedHotbarSlot].count - 1
            }
          } else {
            // 如果只剩1个种子，清空槽位
            newSlots[selectedHotbarSlot] = createEmptyStack()
            newSlots[selectedHotbarSlot].id = ''
          }
          return newSlots
        })
      } else if (!plot) {
        setMessage('⚠️ 这里没有耕地，请先用锄头开垦')
      } else if (plot.state === 'empty') {
        setMessage('⚠️ 这里是草地，请先用锄头开垦')
      } else if (plot.state === 'ready') {
        setMessage('⚠️ 这里还有成熟的作物，请先收获')
      }
    } else if ((selectedItem as any).treeType) {
      // 树苗：种植果树（可以在草地上直接种植，不需要耕地）
      if (!plot) {
        const treeConfig = getTreeConfig((selectedItem as any).treeType)
        newPlots.set(posKey, {
          state: 'tree',
          treeType: (selectedItem as any).treeType,
          plantTime: Date.now(),
          lastHarvestTime: undefined,
          position: [alignedX, -0.45, alignedZ]
        })
        const realSeconds = treeConfig.growTime * 12 * 60 // 游戏天数转秒数
        setMessage(`✅ 已种植${treeConfig.name}，${treeConfig.growTime}游戏天后成熟（${realSeconds}秒）`)

        // 消耗1个树苗（快捷栏就是背包前8个槽位）
        setInventorySlots((prev) => {
          const newSlots = [...prev]
          if (newSlots[selectedHotbarSlot].count > 1) {
            newSlots[selectedHotbarSlot] = {
              ...newSlots[selectedHotbarSlot],
              count: newSlots[selectedHotbarSlot].count - 1
            }
          } else {
            newSlots[selectedHotbarSlot] = createEmptyStack()
            newSlots[selectedHotbarSlot].id = ''
          }
          return newSlots
        })
      } else if (plot && plot.state === 'tree_ready') {
        // 树木成熟，可以收获
        const treeType = plot.treeType!
        const treeConfig = getTreeConfig(treeType)

        const droppedItem = {
          id: Date.now().toString(),
          type: treeType as any,
          position: [plot.position[0], 0, plot.position[2]] as [number, number, number],
          count: treeConfig.yield
        }

        setDroppedItems((prev) => [...prev, droppedItem])

        // 更新最后收获时间
        plot.lastHarvestTime = Date.now()
        newPlots.set(posKey, plot)
        setMessage(`🎉 收获成功！${treeConfig.yield}个${treeConfig.name}掉在地上`)
      } else if (plot && plot.state === 'tree') {
        setMessage('⚠️ 树木还没成熟，请耐心等待')
      } else {
        setMessage('⚠️ 这里已经有东西了，不能种植树木')
      }
    } else if (selectedItem.itemType === 'tool' && selectedItem.toolType === 'sickle') {
      // 镰刀：收获
      if (plot) {
        if (plot.state === 'ready' && plot.cropType) {
          const cropConfig = getCropConfig(plot.cropType)
          const droppedItem = {
            id: Date.now().toString(),
            type: plot.cropType as any,
            position: [plot.position[0], 0, plot.position[2]] as [number, number, number],
            count: cropConfig.yield
          }

          setDroppedItems((prev) => [...prev, droppedItem])
          plot.state = 'tilled'
          const harvestedCrop = plot.cropType
          plot.cropType = undefined
          plot.plantTime = undefined
          newPlots.set(posKey, plot)
          setMessage(`🎉 收获成功！${cropConfig.yield}个${cropConfig.name}掉在地上`)

          // 检查是否首次收获该作物，如果是则解锁下一个作物
          if (harvestedCrop && !harvestedCrops.has(harvestedCrop)) {
            setHarvestedCrops((prev) => new Set(prev).add(harvestedCrop))
            unlockNextCrop(harvestedCrop)
          }
        } else if (plot.state === 'planted') {
          setMessage('⚠️ 作物还没成熟')
        } else if (plot.state === 'empty') {
          setMessage('⚠️ 这里没有作物')
        }
      }
    } else {
      setMessage(`❌ 当前物品（${selectedItem.name}）无法使用在这块土地上`)
    }

    setPlots(newPlots)
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: '#87CEEB',
        overflow: 'hidden'
      }}
    >
      <Canvas
        camera={{ position: [0, 1.6, 5], fov: 75 }}
        shadows
        style={{ width: '100%', height: '100%' }}
        onPointerDown={(e) => {
          // 当任何面板打开时（除了暂停菜单），完全阻止 Canvas 交互
          const anyPanelOpen = showInventory || showShop || showColorPanel || showShortcutHelp || showMachinePanel
          if (anyPanelOpen) {
            e.stopPropagation()
            e.preventDefault()
            // 确保指针被解锁
            if (document.pointerLockElement) {
              document.exitPointerLock()
            }
            return
          }
        }}
        onPointerMove={(e) => {
          // 面板打开时也阻止鼠标移动事件（除了暂停菜单）
          const anyPanelOpen = showInventory || showShop || showColorPanel || showShortcutHelp || showMachinePanel
          if (anyPanelOpen) {
            e.stopPropagation()
          }
        }}
      >
        <Sky distance={450000} sunPosition={[100, 50, 100]} inclination={0.6} azimuth={0.25} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* 射线检测系统：检测鼠标点击位置 */}
        <GroundClickHandler onGroundClick={handlePlotClick} isLocked={isLocked} />

        {/* 玩家控制器 */}
        <FirstPersonController
          onLockChange={setIsLocked}
          cameraMode={cameraMode}
          onPlayerPositionChange={setPlayerPosition}
          onPlayerRotationChange={setPlayerRotation}
          onMovingChange={setIsMoving}
          disabled={showInventory || showShop || showColorPanel || showShortcutHelp || showMachinePanel}
          // 注意：showPauseMenu 不参与 disabled，因为暂停菜单需要 PointerLockControls 来开始游戏
        />

        {/* 玩家模型（第三人称时显示） */}
        <Player
          position={playerPosition}
          rotation={playerRotation}
          visible={cameraMode === 'third'}
          isMoving={isMoving}
          colors={playerColors}
        />

        {/* 建造预览 */}
        <BuildPreview
          buildMode={!isEmpty(inventorySlots[selectedHotbarSlot]) && inventorySlots[selectedHotbarSlot].itemType === 'block'}
          selectedItemType={!isEmpty(inventorySlots[selectedHotbarSlot]) && inventorySlots[selectedHotbarSlot].itemType === 'block' ? inventorySlots[selectedHotbarSlot].id : null}
          placedItems={placedBlocks.map(b => ({ id: b.id, type: b.type, position: b.position }))}
        />

        {/* 已放置的方块 */}
        {placedBlocks.map((block) => (
          <PlacedBlock key={block.id} block={block} onRemove={handleRemoveBlock} />
        ))}

        {/* 已放置的设施（鸡舍、牛棚） */}
        {Array.from(placedFacilities.values()).map((facility) => (
          <PlacedFacility
            key={facility.id}
            facilityType={facility.facilityType}
            position={facility.position}
            rotation={facility.rotation}
          />
        ))}

        {/* 动物 */}
        {animals.map((animal) => (
          <PlacedAnimalComponent
            key={animal.id}
            animal={animal}
            onClick={handleAnimalClick}
            onRightClick={handleAnimalRightClick}
            onUpdate={handleAnimalUpdate}
          />
        ))}

        {/* 机器 */}
        {Array.from(placedMachines.values()).map((machine) => (
          <PlacedMachineMesh
            key={machine.id}
            machine={machine}
            isSelected={selectedMachine === machine.id}
            onClick={() => handleMachineClick(machine.id)}
          />
        ))}

        {/* 装饰品 */}
        {Array.from(placedDecorations.values()).map((decoration) => {
          // 根据装饰品类型获取图标
          const getDecorationIcon = (type: string) => {
            const icons: Record<string, string> = {
              decor_table: '🪑',
              decor_chair: '💺',
              decor_bed: '🛏️',
              decor_cabinet: '🗄️',
              decor_flowerpot: '🪴',
              decor_painting: '🖼️'
            }
            return icons[type] || '🎨'
          }

          // 根据装饰品类型渲染不同的3D模型
          const renderDecoration = (decorationType: string) => {
            switch (decorationType) {
              case 'decor_bed':
                return (
                  <group>
                    {/* 床垫 - 长方形扁平体 */}
                    <mesh position={[0, 0.3, 0]}>
                      <boxGeometry args={[2, 0.3, 1]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    {/* 床头板 - 竖立的板 */}
                    <mesh position={[0, 0.6, -0.45]}>
                      <boxGeometry args={[2, 0.6, 0.1]} />
                      <meshStandardMaterial color="#A0522D" />
                    </mesh>
                    {/* 床脚 - 4个小方块 */}
                    <mesh position={[-0.9, 0.15, -0.4]}>
                      <boxGeometry args={[0.1, 0.3, 0.1]} />
                      <meshStandardMaterial color="#654321" />
                    </mesh>
                    <mesh position={[0.9, 0.15, -0.4]}>
                      <boxGeometry args={[0.1, 0.3, 0.1]} />
                      <meshStandardMaterial color="#654321" />
                    </mesh>
                    <mesh position={[-0.9, 0.15, 0.4]}>
                      <boxGeometry args={[0.1, 0.3, 0.1]} />
                      <meshStandardMaterial color="#654321" />
                    </mesh>
                    <mesh position={[0.9, 0.15, 0.4]}>
                      <boxGeometry args={[0.1, 0.3, 0.1]} />
                      <meshStandardMaterial color="#654321" />
                    </mesh>
                  </group>
                )
              case 'decor_table':
                return (
                  <group>
                    {/* 桌面 */}
                    <mesh position={[0, 0.6, 0]}>
                      <boxGeometry args={[1.5, 0.1, 1]} />
                      <meshStandardMaterial color="#DEB887" />
                    </mesh>
                    {/* 桌腿 */}
                    <mesh position={[-0.6, 0.3, -0.4]}>
                      <boxGeometry args={[0.1, 0.6, 0.1]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0.6, 0.3, -0.4]}>
                      <boxGeometry args={[0.1, 0.6, 0.1]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[-0.6, 0.3, 0.4]}>
                      <boxGeometry args={[0.1, 0.6, 0.1]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0.6, 0.3, 0.4]}>
                      <boxGeometry args={[0.1, 0.6, 0.1]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                  </group>
                )
              case 'decor_chair':
                return (
                  <group>
                    {/* 座面 */}
                    <mesh position={[0, 0.4, 0]}>
                      <boxGeometry args={[0.6, 0.1, 0.6]} />
                      <meshStandardMaterial color="#DEB887" />
                    </mesh>
                    {/* 靠背 */}
                    <mesh position={[0, 0.7, -0.25]}>
                      <boxGeometry args={[0.6, 0.4, 0.1]} />
                      <meshStandardMaterial color="#CD853F" />
                    </mesh>
                    {/* 椅子腿 */}
                    <mesh position={[-0.2, 0.2, -0.2]}>
                      <boxGeometry args={[0.08, 0.4, 0.08]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0.2, 0.2, -0.2]}>
                      <boxGeometry args={[0.08, 0.4, 0.08]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[-0.2, 0.2, 0.2]}>
                      <boxGeometry args={[0.08, 0.4, 0.08]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0.2, 0.2, 0.2]}>
                      <boxGeometry args={[0.08, 0.4, 0.08]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                  </group>
                )
              case 'decor_cabinet':
                return (
                  <group>
                    {/* 柜体 */}
                    <mesh position={[0, 0.6, 0]}>
                      <boxGeometry args={[1, 1.2, 0.5]} />
                      <meshStandardMaterial color="#A0522D" />
                    </mesh>
                    {/* 柜门 */}
                    <mesh position={[0, 0.6, 0.26]}>
                      <boxGeometry args={[0.45, 1.1, 0.05]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <mesh position={[0, 0.6, -0.26]}>
                      <boxGeometry args={[0.45, 1.1, 0.05]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                  </group>
                )
              case 'decor_flowerpot':
                return (
                  <group>
                    {/* 盆体 - 使用多个立方体模拟梯形 */}
                    <mesh position={[0, 0.2, 0]}>
                      <cylinderGeometry args={[0.35, 0.25, 0.4, 16]} />
                      <meshStandardMaterial color="#CD853F" />
                    </mesh>
                    {/* 盆沿 */}
                    <mesh position={[0, 0.41, 0]}>
                      <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    {/* 土壤 */}
                    <mesh position={[0, 0.35, 0]}>
                      <cylinderGeometry args={[0.32, 0.32, 0.05, 16]} />
                      <meshStandardMaterial color="#3D2314" />
                    </mesh>
                    {/* 植物 - 茎 */}
                    <mesh position={[0, 0.5, 0]}>
                      <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
                      <meshStandardMaterial color="#228B22" />
                    </mesh>
                    {/* 叶子1 */}
                    <mesh position={[0.1, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
                      <boxGeometry args={[0.15, 0.05, 0.25]} />
                      <meshStandardMaterial color="#32CD32" />
                    </mesh>
                    {/* 叶子2 */}
                    <mesh position={[-0.1, 0.55, 0]} rotation={[0, 0, Math.PI / 4]}>
                      <boxGeometry args={[0.15, 0.05, 0.25]} />
                      <meshStandardMaterial color="#32CD32" />
                    </mesh>
                    {/* 叶子3 */}
                    <mesh position={[0, 0.65, 0.08]} rotation={[Math.PI / 6, 0, 0]}>
                      <boxGeometry args={[0.12, 0.04, 0.2]} />
                      <meshStandardMaterial color="#32CD32" />
                    </mesh>
                    {/* 花 */}
                    <mesh position={[0, 0.75, 0]}>
                      <sphereGeometry args={[0.08, 8, 8]} />
                      <meshStandardMaterial color="#FF69B4" />
                    </mesh>
                  </group>
                )
              case 'decor_painting':
                return (
                  <group>
                    {/* 外框 */}
                    <mesh position={[0, 0.8, 0]}>
                      <boxGeometry args={[1.2, 1.6, 0.08]} />
                      <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    {/* 内框 - 凹陷效果 */}
                    <mesh position={[0, 0.8, 0.05]}>
                      <boxGeometry args={[0.9, 1.3, 0.03]} />
                      <meshStandardMaterial color="#654321" />
                    </mesh>
                    {/* 画布 */}
                    <mesh position={[0, 0.8, 0.07]}>
                      <boxGeometry args={[0.85, 1.25, 0.02]} />
                      <meshStandardMaterial color="#F5F5DC" />
                    </mesh>
                    {/* 简单的风景画 - 山脉 */}
                    <mesh position={[0, 0.6, 0.09]}>
                      <coneGeometry args={[0.3, 0.4, 4]} />
                      <meshStandardMaterial color="#4A6741" />
                    </mesh>
                    {/* 太阳 */}
                    <mesh position={[0.25, 1.1, 0.09]}>
                      <sphereGeometry args={[0.12, 8, 8]} />
                      <meshStandardMaterial color="#FFD700" />
                    </mesh>
                    {/* 地面 */}
                    <mesh position={[0, 0.35, 0.09]}>
                      <boxGeometry args={[0.8, 0.2, 0.02]} />
                      <meshStandardMaterial color="#8FBC8F" />
                    </mesh>
                  </group>
                )
              default:
                // 其他装饰品暂时用简单的立方体
                return (
                  <mesh>
                    <boxGeometry args={[0.8, 0.8, 0.8]} />
                    <meshStandardMaterial color="#8B4513" />
                  </mesh>
                )
            }
          }

          return (
            <group
              key={decoration.id}
              position={decoration.position}
              onClick={(e) => {
                e.stopPropagation()
                // Shift + 左键点击拆除
                if ((e as any).shiftKey) {
                  handleDecorationRemove(decoration.id)
                }
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = (e as any).shiftKey ? 'pointer' : 'default'
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'default'
              }}
            >
              {/* 装饰品3D模型 */}
              {renderDecoration(decoration.decorationType)}

              {/* 显示装饰品图标（悬浮在上方）- 已注释，使用纯3D模型 */}
              {/* <Html
                position={[0, 1.5, 0]}
                center
                distanceFactor={8}
                style={{
                  fontSize: '30px',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                <div style={{ fontSize: '30px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  {getDecorationIcon(decoration.decorationType)}
                </div>
              </Html> */}
            </group>
          )
        })}

        {/* 无限地面 - 已禁用，现在使用完整的地表方块系统 */}
        {/* <InfiniteGround playerPosition={playerPosition} /> */}

        {/* 地下方块（包含地表方块和地下方块） */}
        <UndergroundBlocks playerPosition={playerPosition} minedBlocks={minedBlocks} onBlockMined={handleBlockMined} targetBlock={targetBlock} />

        {/* 挖矿系统（右键长按挖掘）- 暂时注释掉 */}
        {/* <MiningSystem
          playerPosition={playerPosition}
          isLocked={isLocked}
          onBlockMined={handleBlockMined}
          onMiningProgressChange={(progress, targetBlock, isVisible) => {
            setMiningProgress({ progress, targetBlock, visible: isVisible })
          }}
          onTargetBlockChange={setTargetBlock}
        /> */}

        {/* 动态农场地块 */}
        {Array.from(plots.entries()).map(([posKey, plot]) => (
          <FarmPlot
            key={posKey}
            position={plot.position}
            state={plot.state}
            cropType={plot.cropType}
            treeType={plot.treeType}
            plantTime={plot.plantTime}
            lastHarvestTime={plot.lastHarvestTime}
            onClick={() => {}}
          />
        ))}

        {/* 掉落物品 */}
        {droppedItems.map((item) => (
          <DroppedItem key={item.id} item={item} />
        ))}

        {/* 草地装饰（随机生成的草和花）- 已禁用 */}
        {/* <GrassDecorations /> */}

        {/* ========== 测试果树（5种成熟果树） ========== */}
        {/* 苹果树 */}
        <FarmPlot
          position={[5, 0, 0]}
          state="tree"
          treeType="apple"
          plantTime={Date.now() - 1000 * 60 * 60 * 24} // 24小时前（成熟）
          lastHarvestTime={Date.now() - 1000 * 60 * 30} // 30分钟前收获过
          onClick={() => console.log('点击苹果树')}
        />
        {/* 橙子树 */}
        <FarmPlot
          position={[7, 0, 0]}
          state="tree"
          treeType="orange"
          plantTime={Date.now() - 1000 * 60 * 60 * 25}
          lastHarvestTime={Date.now() - 1000 * 60 * 30}
          onClick={() => console.log('点击橙子树')}
        />
        {/* 桃树 */}
        <FarmPlot
          position={[9, 0, 0]}
          state="tree"
          treeType="peach"
          plantTime={Date.now() - 1000 * 60 * 60 * 22}
          lastHarvestTime={Date.now() - 1000 * 60 * 30}
          onClick={() => console.log('点击桃树')}
        />
        {/* 樱桃树 */}
        <FarmPlot
          position={[11, 0, 0]}
          state="tree"
          treeType="cherry"
          plantTime={Date.now() - 1000 * 60 * 60 * 18}
          lastHarvestTime={Date.now() - 1000 * 60 * 30}
          onClick={() => console.log('点击樱桃树')}
        />
        {/* 梨树 */}
        <FarmPlot
          position={[13, 0, 0]}
          state="tree"
          treeType="pear"
          plantTime={Date.now() - 1000 * 60 * 60 * 24}
          lastHarvestTime={Date.now() - 1000 * 60 * 30}
          onClick={() => console.log('点击梨树')}
        />
        {/* ========== 测试果树结束 ========== */}

        {/* 无限树木 */}
        <InfiniteTrees playerPosition={playerPosition} onChop={handleTreeChop} />
      </Canvas>

      {/* 暂停菜单 */}
      <PauseMenu
        isVisible={!isLocked && showPauseMenu}
        isFirstTime={isFirstTime}
        onResume={() => {
          // 关闭暂停菜单和所有面板
          setShowPauseMenu(false)
          setShowColorPanel(false)
          setShowInventory(false)
          setShowShop(false)
          setShowShortcutHelp(false)
          setPlacingAnimal(null)
          setPlacingMachine(null)
          // 标记已不是首次进入
          if (isFirstTime) {
            setIsFirstTime(false)
          }
        }}
      />

      {/* HUD */}
      <HUD
        isVisible={true}  // 始终显示 HUD
        isLocked={isLocked}  // 单独传递锁定状态用于准心显示
        message={message}
        hotbarSlots={hotbarSlots}
        selectedHotbarSlot={selectedHotbarSlot}
        slotOffset={hotbarOffset}
        onSlotSelect={handleHotbarSlotSelect}
        onShortcutHelpToggle={() => {
          if (!showShortcutHelp) document.exitPointerLock()
          setShowShortcutHelp((prev) => !prev)
        }}
        showShortcutHelp={showShortcutHelp}
        onBackpackToggle={() => {
          if (!showInventory) document.exitPointerLock()
          setShowInventory((prev) => !prev)
        }}
        onShopToggle={() => {
          if (!showShop) document.exitPointerLock()
          setShowShop((prev) => !prev)
        }}
        onColorPanelToggle={() => {
          if (!showColorPanel) document.exitPointerLock()
          setShowColorPanel((prev) => !prev)
        }}
        showBackpack={showInventory}
        showShop={showShop}
        showColorPanel={showColorPanel}
      />

      {/* 挖掘进度条 */}
      <MiningProgressBar
        progress={miningProgress.progress}
        targetBlock={miningProgress.targetBlock}
        isVisible={miningProgress.visible}
      />

      {/* 颜色设置面板 */}
      <ColorPanel
        isVisible={showColorPanel}
        playerColors={playerColors}
        onColorChange={setPlayerColors}
        onClose={() => setShowColorPanel(false)}
      />

      {/* 快捷键帮助 */}
      <ShortcutHelp
        isVisible={showShortcutHelp}
        onClose={() => setShowShortcutHelp(false)}
      />

      {/* 背包界面（旧版，暂时保留） */}
      <Inventory
        isVisible={false} // 暂时禁用旧版
        gold={gold}
        inventory={inventory}
        onClose={() => setShowInventory(false)}
        onSellItem={sellItem}
        onDropItem={dropItem}
      />

      {/* 新背包界面 */}
      <InventoryPanel
        isVisible={showInventory}
        inventorySlots={inventorySlots}
        gold={gold}
        selectedSlot={selectedHotbarSlot}
        onClose={() => setShowInventory(false)}
        onSlotSelect={handleHotbarSlotSelect}
        onMoveItem={handleMoveItem}
        onUseItem={handleUseItem}
        onSellItem={handleSellItemFromNewInventory}
      />

      {/* 商店界面 */}
      <Shop
        isVisible={showShop}
        gold={gold}
        inventory={inventory}
        backpackItems={hotbarSlots.concat(inventorySlots)}
        onClose={() => setShowShop(false)}
        onBuyMaterial={buyMaterial}
        onBuyItem={buyItem}
        onSellItem={sellItem}
      />

      {/* 机器面板 */}
      {showMachinePanel && selectedMachine && placedMachines.has(selectedMachine) && (
        <MachinePanel
          machine={placedMachines.get(selectedMachine)!}
          inventory={inventorySlots}  // 只传递 inventorySlots，避免重复计算
          onClose={() => {
            setShowMachinePanel(false)
            setSelectedMachine(null)
            // 设置冷却期，防止立即重新打开
            setMachinePanelCooldown(true)
            setTimeout(() => {
              setMachinePanelCooldown(false)
            }, 500) // 500ms冷却时间
            // 重新获取指针锁定，恢复游戏控制
            const canvas = document.querySelector('canvas')
            if (canvas && !showInventory && !showShop && !showColorPanel && !showShortcutHelp) {
              canvas.requestPointerLock()
            }
          }}
          onStartProcessing={handleMachinePanelStartProcessing}
          onCollectProduct={handleMachinePanelCollectProduct}
        />
      )}
    </div>
  )
}

export default function Test3DGame() {
  return <FarmScene3D />
}
