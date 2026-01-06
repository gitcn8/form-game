import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'

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
  MachineType,
  AnimalType,
  SpecialType,
  FacilityType,
  AnimalProductType,
  TreeType
} from '../components/inventory/ItemStack'

// Farming Components
import { CROP_CONFIG, getCropConfig, isCropReady } from '../components/farming/CropConfig'
import { SeedType as FarmingSeedType, SEED_CONFIG, getSeedTypeByCrop, buySeedPack, calculateSeedCost, SEED_SHOP_ITEMS } from '../components/farming/SeedConfig'
import { TREE_CONFIG, getTreeConfig, isTreeReady, getTreeGrowthProgress } from '../components/farming/TreeConfig'

// Animal Components
import { PlacedAnimal as PlacedAnimalComponent } from '../components/animals/PlacedAnimal'
import { ANIMAL_CONFIGS, PlacedAnimal, shouldUpgradeGrowthStage, isAnimalHungry, canAnimalProduce } from '../components/animals/AnimalConfig'

// 主场景
function FarmScene3D() {
  // 动态地块数据：用Map存储，key为位置字符串 "x,z"，value为地块状态
  const [plots, setPlots] = useState<Map<string, {
    state: string
    position: [number, number, number]
    cropType?: CropType  // 新增：作物类型
    plantTime?: number   // 新增：种植时间戳（毫秒）
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
  const [gold, setGold] = useState(100) // 初始金币
  const [showInventory, setShowInventory] = useState(false)
  const [showShop, setShowShop] = useState(false) // 商店面板

  // 作物解锁系统
  const [unlockedCrops, setUnlockedCrops] = useState<CropType[]>(['wheat']) // 已解锁的作物
  const [harvestedCrops, setHarvestedCrops] = useState<Set<CropType>>(new Set()) // 已收获过的作物

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

    // 槽位5-8：空槽位（后续通过收获解锁）
    for (let i = 5; i < 8; i++) {
      slots.push(createEmptyStack())
    }

    // 后56个槽位：空槽位
    for (let i = 8; i < 64; i++) {
      slots.push(createEmptyStack())
    }

    return slots
  })
  const [selectedHotbarSlot, setSelectedHotbarSlot] = useState(0) // 当前选中的快捷栏槽位

  // 快捷栏直接使用背包的前8个槽位
  const hotbarSlots = useMemo(() => inventorySlots.slice(0, 8), [inventorySlots])

  // 辅助函数：更新快捷栏槽位（更新inventorySlots的前8个）
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

  // 挖矿系统
  const [minedBlocks, setMinedBlocks] = useState<Set<string>>(new Set()) // 已挖掘的方块
  const [miningProgress, setMiningProgress] = useState({ progress: 0, targetBlock: '', visible: false }) // 挖掘进度
  const [targetBlock, setTargetBlock] = useState<string | null>(null) // 当前瞄准的方块

  // 建造系统 - 初始包含简陋房屋
  const [buildMode, setBuildMode] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<'wood' | 'stone' | 'dirt'>('wood')
  const [placedBlocks, setPlacedBlocks] = useState<
    Array<{ id: string; type: 'wood' | 'stone' | 'dirt' | 'door' | 'glass' | 'planks'; position: [number, number, number] }>
  >([
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

  // 视角和玩家相关状态
  const [cameraMode, setCameraMode] = useState<'first' | 'third'>('first')
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 5])
  const [playerRotation, setPlayerRotation] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [showColorPanel, setShowColorPanel] = useState(false)
  const [showPauseMenu, setShowPauseMenu] = useState(true) // 默认显示引导面板

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
    setSelectedHotbarSlot(index)
    const stack = hotbarSlots[index]

    if (isEmpty(stack)) {
      setMessage('❌ 该槽位为空')
      return
    }

    // 根据物品类型显示不同提示
    if (stack.itemType === 'tool' && stack.toolType) {
      const toolNames: Record<string, string> = {
        hoe: '锄头',
        watering_can: '水壶',
        sickle: '镰刀'
      }
      const toolName = toolNames[stack.toolType] || stack.name
      setMessage(`✅ 切换到：${toolName}`)
    } else if (stack.cropType) {
      setSelectedSeed(stack.cropType)
      const cropConfig = getCropConfig(stack.cropType)
      setMessage(`✅ 切换到种子：${cropConfig.name}（${cropConfig.growTime}秒成熟）`)
    } else if (stack.itemType === 'block') {
      setMessage(`✅ 切换到：${stack.name}（按F进入建造模式后放置）`)
    } else {
      setMessage(`✅ 切换到：${stack.name}`)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 快捷栏数字键 1-8 - 统一处理
      if (e.code >= 'Digit1' && e.code <= 'Digit8') {
        const index = parseInt(e.code.replace('Digit', '')) - 1 // 转换为 0-7
        handleHotbarSlotSelect(index)
        e.preventDefault()
        return
      }

      if (e.code === 'KeyF') {
        // 切换建造模式
        setBuildMode((prev) => !prev)
        setMessage((prev) => (prev ? '🔨 退出建造模式' : '🔨 进入建造模式'))
      } else if (e.code === 'KeyV') {
        // 视角切换
        setCameraMode((prev) => {
          const newMode = prev === 'first' ? 'third' : 'first'
          setMessage(newMode === 'first' ? '📷 切换到第一人称' : '📷 切换到第三人称')
          return newMode
        })
      } else if (e.code === 'KeyC') {
        // 打开/关闭颜色设置面板
        setShowColorPanel((prev) => !prev)
      } else if (e.code === 'KeyB') {
        // 打开/关闭背包
        setShowInventory((prev) => !prev)
      } else if (e.code === 'KeyU') {
        // 打开/关闭商店
        setShowShop((prev) => !prev)
      } else if (e.code === 'KeyT') {
        // 测试：放置动物（临时）
        if (placingAnimal) {
          setPlacingAnimal(null)
          setMessage('❌ 取消放置动物')
        } else {
          setPlacingAnimal('pig') // 默认放置猪
          const config = ANIMAL_CONFIGS['pig']
          setMessage(`🐷 放置模式：${config.name}（左键放置，右键取消）`)
        }
      } else if (e.code === 'Escape') {
        // ESC 键：关闭面板并显示暂停菜单
        if (placingAnimal) {
          // 退出动物放置模式
          setPlacingAnimal(null)
          setMessage('❌ 取消放置动物')
        } else if (showColorPanel) {
          setShowColorPanel(false)
        } else if (showInventory) {
          setShowInventory(false)
        } else if (showShop) {
          setShowShop(false)
        } else {
          setShowPauseMenu(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showColorPanel, showInventory, showShop, showPauseMenu, cameraMode, hotbarSlots, selectedSeed, selectedHotbarSlot, buildMode])

  // 监听面板状态变化，自动解锁指针
  useEffect(() => {
    if (showColorPanel || showInventory || showShop) {
      document.exitPointerLock()
    }
  }, [showColorPanel, showInventory, showShop])

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

    // 创建新动物实例
    const newAnimal: PlacedAnimal = {
      id: `${animalType}_${currentTime}_${Math.random().toString(36).slice(2, 9)}`,
      animalId: animalType,
      position: position,
      rotation: 0,
      birthTime: currentTime,
      growthStage: 'baby',
      lastFed: currentTime,
      lastProduct: currentTime,
      hunger: 0,
      happiness: 100,
      health: 100
    }

    setAnimals((prev) => [...prev, newAnimal])
    setPlacingAnimal(null)
    setMessage(`✅ 放置了${config.name}幼崽`)
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

          // 2. 检查饥饿
          if (isAnimalHungry(animal)) {
            const hungerDamage = config.needs.hungerDamage
            newAnimal.hunger = Math.min(100, animal.hunger + hungerDamage)
            newAnimal.health = Math.max(0, animal.health - hungerDamage)

            if (newAnimal.health <= 0 && animal.health > 0) {
              // 动物饿死
              setMessage(`💔 ${config.name}饿死了...`)
              hasChanges = true
            } else if (animal.hunger < 30) {
              // 饥饿警告
              hasChanges = true
            }
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
  // 动物右键交互
  const handleAnimalRightClick = (animal: PlacedAnimal) => {
    // TODO: 打开动物交互面板（后续实现）
    // 现在先简单处理：直接收起
    handleRemoveAnimal(animal)
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
    type: BlockType | CropType | ToolType | DecorationType | MachineType | AnimalType | SpecialType | FacilityType | AnimalProductType | TreeType | string,
    count: number
  ) => {
    const newStack = createStack(type as any, count)
    if (!newStack) {
      console.error('创建物品堆叠失败:', type)
      return
    }

    // 使用单一状态更新，一次性处理所有逻辑
    setInventorySlots((prev) => {
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
          }
        } else if (canStack(newSlots[i], newStack)) {
          const merged = mergeStacks(newSlots[i], newStack)
          if (merged) {
            const canAdd = Math.min(remainingCount, merged.maxStack - newSlots[i].count)
            newSlots[i] = { ...newSlots[i], count: newSlots[i].count + canAdd }
            remainingCount -= canAdd
          }
        }
      }

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

    // 如果是工具，切换当前工具
    if (stack.itemType === 'tool' && stack.toolType) {
      setSelectedHotbarSlot(isHotbar ? slotIndex : selectedHotbarSlot)
      setMessage(`✅ 切换到 ${stack.name}`)
    }
  }

  // 处理地块点击（使用射线检测）
  const handlePlotClick = (clickPosition: [number, number, number]) => {
    const [x, y, z] = clickPosition

    // 如果正在放置动物
    if (placingAnimal) {
      handlePlaceAnimal([x, y, z])
      return
    }

    // 如果在建造模式，放置方块
    if (buildMode) {
      handlePlaceBlock([x, y, z])
      return
    }

    // 获取当前选中的快捷栏槽位物品
    const selectedItem = hotbarSlots[selectedHotbarSlot]

    // 检查选中的是否是可放置的动物
    if (selectedItem.itemType === 'animal' && (selectedItem as any).animalType) {
      const animalItem = (selectedItem as any).animalType as string
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

    const newPlots = new Map(plots)
    const plot = newPlots.get(posKey)

    // 根据选中槽位的物品类型决定行为
    if (selectedItem.itemType === 'tool' && selectedItem.toolType === 'hoe') {
      // 锄头：开垦土地
      if (!plot) {
        // 创建新地块
        const grassBlockKey = `${alignedX},0,${alignedZ}`
        setMinedBlocks((prev) => new Set([...prev, grassBlockKey]))

        newPlots.set(posKey, {
          state: 'tilled',
          position: [alignedX, -0.95, alignedZ]
        })
        setMessage('✅ 土地已开垦')
      } else if (plot.state === 'empty') {
        const grassBlockKey = `${alignedX},0,${alignedZ}`
        setMinedBlocks((prev) => new Set([...prev, grassBlockKey]))

        plot.state = 'tilled'
        plot.position[1] = -0.95
        newPlots.set(posKey, plot)
        setMessage('✅ 土地已开垦')
      }
    } else if (selectedItem.itemType === 'tool' && selectedItem.toolType === 'watering_can') {
      // 水壶：浇水
      if (plot && (plot.state === 'tilled' || plot.state === 'planted')) {
        plot.state = plot.state === 'tilled' ? 'watered' : 'planted'
        newPlots.set(posKey, plot)
        setMessage('✅ 土地已浇水')
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
      <Canvas camera={{ position: [0, 1.6, 5], fov: 75 }} shadows style={{ width: '100%', height: '100%' }}>
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
        <GroundClickHandler onGroundClick={handlePlotClick} />

        {/* 玩家控制器 */}
        <FirstPersonController
          onLockChange={setIsLocked}
          cameraMode={cameraMode}
          onPlayerPositionChange={setPlayerPosition}
          onPlayerRotationChange={setPlayerRotation}
          onMovingChange={setIsMoving}
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
        <BuildPreview buildMode={buildMode} selectedMaterial={selectedMaterial} placedBlocks={placedBlocks} />

        {/* 已放置的方块 */}
        {placedBlocks.map((block) => (
          <PlacedBlock key={block.id} block={block} onRemove={handleRemoveBlock} />
        ))}

        {/* 动物 */}
        {animals.map((animal) => (
          <PlacedAnimalComponent
            key={animal.id}
            animal={animal}
            onRightClick={handleAnimalRightClick}
          />
        ))}

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

        {/* 无限树木 */}
        <InfiniteTrees playerPosition={playerPosition} onChop={handleTreeChop} />
      </Canvas>

      {/* 暂停菜单 */}
      <PauseMenu isVisible={!isLocked && showPauseMenu} onResume={() => setShowPauseMenu(false)} />

      {/* HUD */}
      <HUD
        isVisible={isLocked}
        message={message}
        hotbarSlots={hotbarSlots}
        selectedHotbarSlot={selectedHotbarSlot}
        buildMode={buildMode}
        selectedMaterial={selectedMaterial}
        cameraMode={cameraMode}
        onSlotSelect={handleHotbarSlotSelect}
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
    </div>
  )
}

export default function Test3DGame() {
  return <FarmScene3D />
}
