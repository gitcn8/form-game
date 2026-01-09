import { ItemStack } from '../inventory/ItemStack'
import { Hotbar } from '../inventory/Hotbar'

interface HUDProps {
  isVisible: boolean
  isLocked?: boolean  // 鼠标锁定状态，用于控制准心显示
  message: string
  hotbarSlots: ItemStack[]
  selectedHotbarSlot: number
  slotOffset?: number  // 快捷栏窗口的起始位置
  buildMode: boolean
  selectedMaterial: 'wood' | 'stone' | 'dirt'
  cameraMode: 'first' | 'third'
  onSlotSelect?: (index: number) => void
  onShortcutHelpToggle?: () => void
  showShortcutHelp?: boolean
  // 新增：固定图标按钮的点击处理
  onBackpackToggle?: () => void
  onShopToggle?: () => void
  onColorPanelToggle?: () => void
  showBackpack?: boolean
  showShop?: boolean
  showColorPanel?: boolean
}

/**
 * HUD 组件
 * 包含准心、顶部信息栏、工具栏、视角指示器等游戏内界面元素
 */
export function HUD({
  isVisible,
  isLocked = true,
  message,
  hotbarSlots,
  selectedHotbarSlot,
  slotOffset = 0,
  buildMode,
  selectedMaterial,
  cameraMode,
  onSlotSelect,
  onShortcutHelpToggle,
  showShortcutHelp,
  onBackpackToggle,
  onShopToggle,
  onColorPanelToggle,
  showBackpack,
  showShop,
  showColorPanel
}: HUDProps) {
  // 获取当前选中的物品
  const selectedItem = hotbarSlots[selectedHotbarSlot]

  // 物品类型图标映射（用于顶部信息显示）
  const getItemEmoji = (item: ItemStack): string => {
    if (item.itemType === 'tool') {
      const toolEmojis: Record<string, string> = {
        hoe: '🪓',
        watering_can: '💧',
        sickle: '✂️',
        axe: '🪓',
        pickaxe: '⛏️',
        shovel: '🥄'
      }
      return toolEmojis[item.toolType || ''] || '🔧'
    } else if (item.itemType === 'crop') {
      const cropEmojis: Record<string, string> = {
        carrot: '🥕',
        wheat: '🌾',
        potato: '🥔',
        tomato: '🍅',
        pumpkin: '🎃'
      }
      return cropEmojis[item.cropType || ''] || '🌱'
    } else if (item.itemType === 'item' && (item as any).seedType) {
      const seedEmojis: Record<string, string> = {
        seed_carrot: '🥕',
        seed_wheat: '🌾',
        seed_potato: '🥔',
        seed_tomato: '🍅',
        seed_pumpkin: '🎃'
      }
      return seedEmojis[(item as any).seedType] || '🌱'
    } else if (item.itemType === 'block') {
      const blockEmojis: Record<string, string> = {
        wood: '🪵',
        stone: '🪨',
        dirt: '🟫'
      }
      return blockEmojis[item.blockType || ''] || '📦'
    }
    return '📦'
  }

  const materialEmoji: any = {
    wood: '🪵',
    stone: '🪨',
    dirt: '🟫'
  }

  // 显示当前选中物品信息
  const getSelectedItemDisplay = () => {
    if (!selectedItem || selectedItem.count === 0) {
      return <div>当前选中: 空（按 1-8 选择快捷栏槽位）</div>
    }

    const emoji = getItemEmoji(selectedItem)
    const itemInfo = selectedItem.count > 1
      ? `${selectedItem.name} x${selectedItem.count}`
      : selectedItem.name

    return (
      <div>
        当前选中: {emoji} {itemInfo} <span style={{ color: '#FFD700', marginLeft: '10px' }}>槽位 {selectedHotbarSlot + 1}</span>
      </div>
    )
  }

  return (
    <>
      {/* 准心 - 仅在鼠标锁定时显示，指示玩家朝向 */}
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 100
          }}
        >
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '50%'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%'
          }}
        />
        </div>
      )}

      {/* HUD - 顶部信息 - 仅在鼠标锁定时显示 */}
      {isVisible && (
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          fontSize: '18px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 100
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>{message}</div>
        {getSelectedItemDisplay()}
        {buildMode && (
          <div style={{ marginTop: '8px', color: '#FFD700', fontWeight: 'bold' }}>
            🔨 建造模式: {materialEmoji[selectedMaterial]} {selectedMaterial}
          </div>
        )}
      </div>
      )}

      {/* HUD - 快捷栏 - 仅在鼠标锁定时显示 */}
      {isVisible && (
      <Hotbar
        slots={hotbarSlots}
        selectedSlot={selectedHotbarSlot}
        slotOffset={slotOffset}
        onSlotSelect={(index) => {
          if (onSlotSelect) onSlotSelect(index)
        }}
      />
      )}

      {/* 视角指示器 - 仅在鼠标锁定时显示 */}
      {isVisible && (
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '10px 20px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '14px',
          zIndex: 100,
          border: '2px solid rgba(255, 215, 0, 0.4)'
        }}
      >
        <div>📷 当前视角: {cameraMode === 'first' ? '第一人称' : '第三人称'}</div>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#90EE90' }}>
          按 Ctrl 解锁鼠标 | 按 V 切换 | 按 C 设置颜色 | 按 B 背包 | 按 U 商店 | 按 F 建造
        </div>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#FFD700' }}>
          ⛏️ 按住空格或右键挖掘
        </div>
        </div>
      )}

      {/* 快捷键帮助按钮 - 始终显示 */}
      {onShortcutHelpToggle && (
        <div
          onClick={isLocked ? undefined : (e) => {
            e.stopPropagation()
            e.preventDefault()
            onShortcutHelpToggle()
          }}
          style={{
            position: 'absolute',
            bottom: '120px',
            right: '20px',
            background: showShortcutHelp
              ? 'rgba(147, 112, 219, 0.4)'
              : 'rgba(0, 0, 0, 0.6)',
            border: showShortcutHelp
              ? '3px solid rgba(147, 112, 219, 0.9)'
              : '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '10px 15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            minWidth: '70px',
            opacity: isLocked ? 0.4 : 1,
            pointerEvents: isLocked ? 'none' : 'auto',
          }}
          onMouseEnter={(e) => {
            if (!isLocked) {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.background = 'rgba(147, 112, 219, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLocked) {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.background = showShortcutHelp
                ? 'rgba(147, 112, 219, 0.4)'
                : 'rgba(0, 0, 0, 0.6)'
            }
          }}
          title={isLocked ? '按 Ctrl 解锁鼠标后点击' : '查看快捷键 (?键)'}
        >
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>⌨️</div>
          <div style={{
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            帮助
          </div>
          {isVisible && (
            <div style={{ fontSize: '10px', color: '#FFD700', marginTop: '2px' }}>
              (?)
            </div>
          )}
        </div>
      )}

      {/* 固定图标按钮 - 背包、商店、颜色 */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          zIndex: 100,
        }}
      >
        {/* Ctrl 提示（仅在鼠标锁定时显示） */}
        {isVisible && (
          <div
            style={{
              background: 'rgba(255, 165, 0, 0.9)',
              border: '2px solid rgba(255, 215, 0, 0.9)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '10px',
              fontSize: '11px',
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              animation: 'pulse 2s infinite',
            }}
          >
            按 Ctrl
            <br />
            解锁鼠标
          </div>
        )}

        {/* 背包按钮 */}
        {onBackpackToggle && (
          <div
            onClick={isLocked ? undefined : (e) => {
              e.stopPropagation()
              e.preventDefault()
              onBackpackToggle()
            }}
            style={{
              background: showBackpack
                ? 'rgba(100, 149, 237, 0.4)'
                : 'rgba(0, 0, 0, 0.6)',
              border: showBackpack
                ? '3px solid rgba(100, 149, 237, 0.9)'
                : '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '10px 15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              minWidth: '70px',
              opacity: isLocked ? 0.4 : 1,
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
            onMouseEnter={(e) => {
              if (!isLocked) {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.background = 'rgba(100, 149, 237, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLocked) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = showBackpack
                  ? 'rgba(100, 149, 237, 0.4)'
                  : 'rgba(0, 0, 0, 0.6)'
              }
            }}
            title={isLocked ? '按 Ctrl 解锁鼠标后点击' : '打开背包 (B键)'}
          >
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🎒</div>
            <div style={{
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              背包
            </div>
            {isVisible && (
              <div style={{ fontSize: '10px', color: '#FFD700', marginTop: '2px' }}>
                (B)
              </div>
            )}
          </div>
        )}

        {/* 商店按钮 */}
        {onShopToggle && (
          <div
            onClick={isLocked ? undefined : (e) => {
              e.stopPropagation()
              e.preventDefault()
              onShopToggle()
            }}
            style={{
              background: showShop
                ? 'rgba(255, 215, 0, 0.4)'
                : 'rgba(0, 0, 0, 0.6)',
              border: showShop
                ? '3px solid rgba(255, 215, 0, 0.9)'
                : '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '10px 15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              minWidth: '70px',
              opacity: isLocked ? 0.4 : 1,
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
            onMouseEnter={(e) => {
              if (!isLocked) {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLocked) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = showShop
                  ? 'rgba(255, 215, 0, 0.4)'
                  : 'rgba(0, 0, 0, 0.6)'
              }
            }}
            title={isLocked ? '按 Ctrl 解锁鼠标后点击' : '打开商店 (U键)'}
          >
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏪</div>
            <div style={{
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              商店
            </div>
            {isVisible && (
              <div style={{ fontSize: '10px', color: '#FFD700', marginTop: '2px' }}>
                (U)
              </div>
            )}
          </div>
        )}

        {/* 颜色按钮 */}
        {onColorPanelToggle && (
          <div
            onClick={isLocked ? undefined : (e) => {
              e.stopPropagation()
              e.preventDefault()
              onColorPanelToggle()
            }}
            style={{
              background: showColorPanel
                ? 'rgba(147, 112, 219, 0.4)'
                : 'rgba(0, 0, 0, 0.6)',
              border: showColorPanel
                ? '3px solid rgba(147, 112, 219, 0.9)'
                : '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '10px 15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              minWidth: '70px',
              opacity: isLocked ? 0.4 : 1,
              pointerEvents: isLocked ? 'none' : 'auto',
            }}
            onMouseEnter={(e) => {
              if (!isLocked) {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.background = 'rgba(147, 112, 219, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLocked) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = showColorPanel
                  ? 'rgba(147, 112, 219, 0.4)'
                  : 'rgba(0, 0, 0, 0.6)'
              }
            }}
            title={isLocked ? '按 Ctrl 解锁鼠标后点击' : '打开颜色面板 (C键)'}
          >
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🎨</div>
            <div style={{
              fontSize: '12px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              颜色
            </div>
            {isVisible && (
              <div style={{ fontSize: '10px', color: '#FFD700', marginTop: '2px' }}>
                (C)
              </div>
            )}
          </div>
        )}
      </div>

      {/* 添加 CSS 动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  )
}
