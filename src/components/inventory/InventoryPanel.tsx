import { useState, useCallback } from 'react'
import { ItemStack, isEmpty } from './ItemStack'

interface InventoryPanelProps {
  isVisible: boolean
  inventorySlots: ItemStack[] // 64个背包槽位
  gold: number
  selectedSlot: number
  onClose: () => void
  onSlotSelect: (index: number) => void
  onMoveItem: (fromIndex: number, toIndex: number, fromHotbar: boolean, toHotbar: boolean) => void
  onUseItem?: (slotIndex: number, isHotbar: boolean) => void
  onSellItem?: (slotIndex: number, isHotbar: boolean, count: number) => void
}

/**
 * 完整背包界面
 * 只显示背包主区域（64槽，8行8列）
 * 前8个槽位与页面底部快捷栏同步
 */
export function InventoryPanel({
  isVisible,
  inventorySlots,
  gold,
  selectedSlot,
  onClose,
  onSlotSelect,
  onMoveItem,
  onUseItem,
  onSellItem
}: InventoryPanelProps) {
  // 点击交换状态
  const [selectedForSwap, setSelectedForSwap] = useState<{
    index: number
    isHotbar: boolean
  } | null>(null)

  // 槽位点击
  const handleSlotClick = useCallback((index: number, isHotbar: boolean, stack: ItemStack) => {
    // 如果有已选中的槽位，且不是当前槽位 → 交换
    if (selectedForSwap && (selectedForSwap.index !== index || selectedForSwap.isHotbar !== isHotbar)) {
      onMoveItem(selectedForSwap.index, index, selectedForSwap.isHotbar, isHotbar)
      setSelectedForSwap(null) // 交换后清除选中
      return
    }

    // 如果点击同一个槽位 → 取消选中
    if (selectedForSwap && selectedForSwap.index === index && selectedForSwap.isHotbar === isHotbar) {
      setSelectedForSwap(null)
      return
    }

    // 如果没有已选中的槽位，且不是空槽位 → 选中用于交换
    if (!selectedForSwap && !isEmpty(stack)) {
      setSelectedForSwap({ index, isHotbar })
      return
    }
  }, [selectedForSwap, onMoveItem])

  // 右键点击（出售）
  const handleRightClick = useCallback((e: React.MouseEvent, index: number, isHotbar: boolean, stack: ItemStack) => {
    e.preventDefault()
    // 右键时清除选中状态
    setSelectedForSwap(null)
    if (!isEmpty(stack) && onSellItem) {
      onSellItem(index, isHotbar, 1)
    }
  }, [onSellItem])

  if (!isVisible) return null

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onClose()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(139, 69, 19, 0.95)',
          padding: '30px',
          borderRadius: '16px',
          color: 'white',
          minWidth: '600px',
          border: '3px solid rgba(255, 215, 0, 0.6)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        {/* 标题和金币 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '28px', color: '#FFD700' }}>🎒 背包</h3>
          <div style={{ fontSize: '20px', color: '#FFD700', fontWeight: 'bold' }}>💰 {gold} 金币</div>
        </div>

        {/* 背包区域 (8行8列 = 64槽，前8个对应底部快捷栏) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#AAA', marginBottom: '8px' }}>
            背包 (64格) - 前8格对应底部快捷栏，可拖拽整理
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
            {inventorySlots.map((slot, index) => (
              <InventorySlot
                key={`inv-${index}`}
                slot={slot}
                index={index}
                isHotbar={index < 8}
                isSelected={index < 8 && selectedSlot === index}
                isSwapSource={selectedForSwap?.index === index && selectedForSwap?.isHotbar === (index < 8)}
                onClick={() => handleSlotClick(index, index < 8, slot)}
                onRightClick={(e) => handleRightClick(e, index, index < 8, slot)}
              />
            ))}
          </div>
        </div>

        {/* 提示 */}
        <div style={{ fontSize: '12px', color: '#AAA', textAlign: 'center', marginBottom: '15px' }}>
          💡 点击两个槽位可交换 | 右键：出售1个
        </div>

        {/* 关闭按钮 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 30px',
              background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
              border: '2px solid #8B4513',
              borderRadius: '8px',
              color: '#8B4513',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            关闭 (B)
          </button>
        </div>
      </div>
    </div>
  )
}

interface InventorySlotProps {
  slot: ItemStack
  index: number
  isHotbar: boolean
  isSelected: boolean
  isSwapSource: boolean  // 是否被选中用于交换
  onClick: () => void
  onRightClick: (e: React.MouseEvent) => void
}

function InventorySlot({
  slot,
  index,
  isHotbar,
  isSelected,
  isSwapSource,
  onClick,
  onRightClick
}: InventorySlotProps) {
  const slotIsEmpty = isEmpty(slot)

  return (
    <div
      onClick={onClick}
      onContextMenu={onRightClick}
      style={{
        width: '50px',
        height: '50px',
        background: isSwapSource
          ? 'rgba(0, 255, 0, 0.3)'  // 绿色背景表示选中用于交换
          : isSelected
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(0, 0, 0, 0.5)',
        border: isSwapSource
          ? '3px solid #00FF00'  // 绿色边框
          : isSelected
          ? '3px solid #FFD700'
          : '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: slotIsEmpty ? 'default' : 'pointer',
        position: 'relative',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!slotIsEmpty && !isSwapSource) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isSwapSource) {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      {!slotIsEmpty && (
        <>
          {/* 物品图标 */}
          {slot.itemType === 'block' && slot.color && (
            <div
              style={{
                width: '35px',
                height: '35px',
                background: slot.color,
                border: '2px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '4px'
              }}
            />
          )}

          {/* 种子图标（优先于普通物品） */}
          {slot.itemType === 'item' && (slot as any).seedType && (
            <div style={{ fontSize: '28px' }}>
              {getSeedIcon((slot as any).seedType)}
            </div>
          )}

          {/* 普通物品图标（不包括种子、产品、树苗和加工食品） */}
          {slot.itemType === 'item' && slot.color && !(slot as any).seedType && !(slot as any).productType && !(slot as any).treeType && !(slot as any).foodType && (
            <div
              style={{
                width: '35px',
                height: '35px',
                background: slot.color,
                border: '2px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '4px'
              }}
            />
          )}

          {/* 树苗图标 */}
          {slot.itemType === 'item' && (slot as any).treeType && (
            <div style={{ fontSize: '28px' }}>
              {getTreeIcon((slot as any).treeType)}
            </div>
          )}

          {/* 动物产品图标 */}
          {slot.itemType === 'item' && (slot as any).productType && (
            <div style={{ fontSize: '28px' }}>
              {getProductIcon((slot as any).productType)}
            </div>
          )}

          {/* 加工食品图标 */}
          {slot.itemType === 'item' && (slot as any).foodType && (
            <div style={{ fontSize: '28px' }}>
              {getFoodIcon((slot as any).foodType)}
            </div>
          )}

          {slot.itemType === 'crop' && (
            <div style={{ fontSize: '28px' }}>{getCropIcon(slot.cropType!)}</div>
          )}

          {slot.itemType === 'tool' && (
            <div style={{ fontSize: '28px' }}>
              {getToolIcon(slot.toolType!)}
            </div>
          )}

          {slot.itemType === 'decoration' && (
            <div style={{ fontSize: '28px' }}>
              {getDecorationIcon((slot as any).decorationType)}
            </div>
          )}

          {slot.itemType === 'machine' && (
            <div style={{ fontSize: '28px' }}>
              {getMachineIcon((slot as any).machineType)}
            </div>
          )}

          {slot.itemType === 'animal' && (
            <div style={{ fontSize: '28px' }}>
              {getAnimalIcon((slot as any).animalType)}
            </div>
          )}

          {slot.itemType === 'special' && (
            <div style={{ fontSize: '28px' }}>
              {getSpecialIcon((slot as any).specialType)}
            </div>
          )}

          {/* 数量 */}
          {slot.count > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                fontSize: '12px',
                color: '#FFF',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}
            >
              {slot.count}
            </div>
          )}

          {/* 耐久度条 */}
          {slot.itemType === 'tool' && slot.durability !== undefined && slot.maxDurability !== undefined && (
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '3px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '0 0 4px 4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${(slot.durability / slot.maxDurability) * 100}%`,
                  height: '100%',
                  background: getDurabilityColor(slot.durability, slot.maxDurability)
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function getToolIcon(toolType: string): string {
  const icons: Record<string, string> = {
    hoe: '🔨',
    watering_can: '💧',
    sickle: '🔪',
    axe: '🪓',
    pickaxe: '⛏️',
    shovel: '🥄'
  }
  return icons[toolType] || '🔧'
}

function getCropIcon(cropType: string): string {
  const icons: Record<string, string> = {
    carrot: '🥕',
    wheat: '🌾',
    potato: '🥔',
    tomato: '🍅',
    pumpkin: '🎃'
  }
  return icons[cropType] || '🌱'
}

function getDecorationIcon(decorationType: string): string {
  const icons: Record<string, string> = {
    decor_table: '🪑',
    decor_chair: '💺',
    decor_bed: '🛏️',
    decor_cabinet: '🗄️',
    decor_flowerpot: '🪴',
    decor_painting: '🖼️'
  }
  return icons[decorationType] || '🎨'
}

function getMachineIcon(machineType: string): string {
  const icons: Record<string, string> = {
    machine_oven: '🔥',
    machine_boiler: '🍲',
    machine_juicer: '🧃',
    machine_grinder: '⚙️',
    machine_mixer: '🥣'
  }
  return icons[machineType] || '⚙️'
}

function getAnimalIcon(animalType: string): string {
  const icons: Record<string, string> = {
    animal_chicken: '🐔',
    animal_cow: '🐄',
    animal_sheep: '🐑',
    animal_pig: '🐷',
    animal_feed: '🌾',
    animal_hay: '🌿',
    facility_chicken_coop: '🏠',
    facility_barn: '🏚️'
  }
  return icons[animalType] || '🐄'
}

function getSpecialIcon(specialType: string): string {
  const icons: Record<string, string> = {
    special_fertilizer: '💩',
    special_expansion: '📜'
  }
  return icons[specialType] || '⭐'
}

/**
 * 获取种子图标
 */
function getSeedIcon(seedType: string): string {
  const icons: Record<string, string> = {
    seed_carrot: '🥕',  // 胡萝卜种子
    seed_wheat: '🌾',   // 小麦种子
    seed_potato: '🥔',  // 土豆种子
    seed_tomato: '🍅',  // 番茄种子
    seed_pumpkin: '🎃'  // 南瓜种子
  }
  return icons[seedType] || '🌱'
}

function getProductIcon(productType: string): string {
  const icons: Record<string, string> = {
    egg: '🥚',
    milk: '🥛',
    wool: '🧶',
    meat: '🥩',
    pork: '🥓',
    beef: '🥩',
    chicken_meat: '🍗',
    mutton: '🍖'
  }
  return icons[productType] || '📦'
}

function getFoodIcon(foodType: string): string {
  const icons: Record<string, string> = {
    flour: '🌾',    // 面粉
    bread: '🍞',    // 面包
    cake: '🍰',     // 蛋糕
    soup: '🍲',     // 汤品
    juice: '🧃',    // 果汁
    cheese: '🧀',   // 奶酪
    pizza: '🍕',    // 披萨
    jammed_fruit: '🍓'  // 果酱
  }
  return icons[foodType] || '🍽️'
}

function getTreeIcon(treeType: string): string {
  const icons: Record<string, string> = {
    apple: '🍎',
    orange: '🍊',
    peach: '🍑',
    cherry: '🍒',
    pear: '🍐'
  }
  return icons[treeType] || '🌳'
}

function getDurabilityColor(current: number, max: number): string {
  const percentage = (current / max) * 100
  if (percentage > 50) return '#4CAF50'
  if (percentage > 25) return '#FFC107'
  return '#F44336'
}
