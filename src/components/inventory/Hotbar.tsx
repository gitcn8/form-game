import { ItemStack } from './ItemStack'

interface HotbarProps {
  slots: ItemStack[] // 显示的10个槽位
  selectedSlot: number // 实际选中的槽位索引（0-63）
  slotOffset?: number // 显示窗口的起始位置
  onSlotSelect: (index: number) => void
  onSlotUse?: (index: number) => void
}

/**
 * 快捷栏组件
 * 底部横向排列10个槽位
 * 按 Ctrl 键解锁鼠标后可以点击槽位选择物品
 */
export function Hotbar({ slots, selectedSlot, slotOffset = 0, onSlotSelect, onSlotUse }: HotbarProps) {
  const handleSlotClick = (displayIndex: number, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡到画布
    const actualIndex = slotOffset + displayIndex // 计算实际槽位索引
    onSlotSelect(actualIndex)
    onSlotUse?.(actualIndex)
  }

  const handlePrevSlot = (e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡到画布
    const prevIndex = selectedSlot - 1
    onSlotSelect(prevIndex >= 0 ? prevIndex : 0) // 不小于0
    onSlotUse?.(prevIndex >= 0 ? prevIndex : 0)
  }

  const handleNextSlot = (e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡到画布
    const nextIndex = selectedSlot + 1
    onSlotSelect(nextIndex) // 可以超过63，由调用方处理
    onSlotUse?.(nextIndex)
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDownCapture={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px',
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        zIndex: 1000
      }}
    >
      {/* 上一个槽位按钮 */}
      <div
        onClick={handlePrevSlot}
        onPointerDownCapture={(e) => e.stopPropagation()}
        style={{
          width: '30px',
          height: '50px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#fff',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
        }}
      >
        ‹
      </div>

      {/* 槽位 */}
      {slots.map((slot, displayIndex) => {
        const actualIndex = slotOffset + displayIndex
        return (
          <HotbarSlot
            key={actualIndex}
            slot={slot}
            index={displayIndex} // 显示索引（0-9）
            actualIndex={actualIndex} // 实际槽位号（0-63）
            isSelected={actualIndex === selectedSlot}
            onClick={(e) => handleSlotClick(displayIndex, e)}
          />
        )
      })}

      {/* 下一个槽位按钮 */}
      <div
        onClick={handleNextSlot}
        onPointerDownCapture={(e) => e.stopPropagation()}
        style={{
          width: '30px',
          height: '50px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#fff',
          fontWeight: 'bold',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
        }}
      >
        ›
      </div>
    </div>
  )
}

interface HotbarSlotProps {
  slot: ItemStack
  index: number // 显示索引（0-9）
  actualIndex: number // 实际槽位号（0-63）
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
}

function HotbarSlot({ slot, index, actualIndex, isSelected, onClick }: HotbarSlotProps) {
  const isEmpty = slot.count === 0 || !slot.id

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick(e)
  }

  return (
    <div
      onClick={handleClick}
      onPointerDownCapture={(e) => e.stopPropagation()}
      style={{
        width: '50px',
        height: '50px',
        background: isSelected
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(0, 0, 0, 0.5)',
        border: isSelected
          ? '3px solid #FFD700'
          : '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!isEmpty) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      {/* 槽位编号 - 显示实际槽位号（1-64） */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '4px',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: 'bold'
        }}
      >
        {actualIndex + 1}
      </div>

      {/* 物品图标 */}
      {!isEmpty && (
        <>
          {/* 方块图标 */}
          {slot.itemType === 'block' && slot.color && (
            <div
              style={{
                width: '30px',
                height: '30px',
                background: slot.color,
                border: '2px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '4px'
              }}
            />
          )}

          {/* 种子图标（优先于普通物品） */}
          {slot.itemType === 'item' && (slot as any).seedType && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getSeedIcon((slot as any).seedType)}
            </div>
          )}

          {/* 普通物品图标（不包括种子、产品、树苗和加工食品） */}
          {slot.itemType === 'item' && slot.color && !(slot as any).seedType && !(slot as any).productType && !(slot as any).treeType && !(slot as any).foodType && (
            <div
              style={{
                width: '30px',
                height: '30px',
                background: slot.color,
                border: '2px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '4px'
              }}
            />
          )}

          {/* 树苗图标 */}
          {slot.itemType === 'item' && (slot as any).treeType && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getTreeIcon((slot as any).treeType)}
            </div>
          )}

          {/* 动物产品图标 */}
          {slot.itemType === 'item' && (slot as any).productType && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getProductIcon((slot as any).productType)}
            </div>
          )}

          {/* 加工食品图标 */}
          {slot.itemType === 'item' && (slot as any).foodType && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getFoodIcon((slot as any).foodType)}
            </div>
          )}

          {/* 作物图标 */}
          {slot.itemType === 'crop' && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getCropIcon(slot.cropType!)}
            </div>
          )}

          {/* 工具图标 */}
          {slot.itemType === 'tool' && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getToolIcon(slot.toolType!)}
            </div>
          )}

          {/* 装饰品图标 */}
          {slot.itemType === 'decoration' && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getDecorationIcon((slot as any).decorationType)}
            </div>
          )}

          {/* 机器图标 */}
          {slot.itemType === 'machine' && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getMachineIcon((slot as any).machineType)}
            </div>
          )}

          {/* 动物图标 */}
          {slot.itemType === 'animal' && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getAnimalIcon((slot as any).animalType)}
            </div>
          )}

          {/* 特殊物品图标 */}
          {slot.itemType === 'special' && (
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1
              }}
            >
              {getSpecialIcon((slot as any).specialType)}
            </div>
          )}

          {/* 数量标签 */}
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

          {/* 耐久度条（仅工具） */}
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
                  background: getDurabilityColor(slot.durability, slot.maxDurability),
                  transition: 'width 0.2s'
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * 获取工具图标
 */
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

/**
 * 获取作物图标
 */
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

/**
 * 获取装饰品图标
 */
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

/**
 * 获取机器图标
 */
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

/**
 * 获取动物图标
 */
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

/**
 * 获取特殊物品图标
 */
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

/**
 * 获取动物产品图标
 */
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

/**
 * 获取加工食品图标
 */
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

/**
 * 获取树苗图标
 */
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

/**
 * 获取耐久度颜色
 */
function getDurabilityColor(current: number, max: number): string {
  const percentage = (current / max) * 100
  if (percentage > 50) return '#4CAF50'
  if (percentage > 25) return '#FFC107'
  return '#F44336'
}
