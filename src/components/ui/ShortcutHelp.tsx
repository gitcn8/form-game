/**
 * 快捷键帮助组件
 * 显示游戏中所有快捷键的说明
 */

interface ShortcutHelpProps {
  isVisible: boolean
  onClose: () => void
}

interface Shortcut {
  key: string
  description: string
  category: 'movement' | 'interaction' | 'inventory' | 'view' | 'building'
  icon: string
}

export function ShortcutHelp({ isVisible, onClose }: ShortcutHelpProps) {
  if (!isVisible) return null

  const shortcuts: Shortcut[] = [
    // 移动类
    { key: 'W/A/S/D', description: '移动角色', category: 'movement', icon: '🚶' },
    { key: '方向键', description: '移动角色（备用）', category: 'movement', icon: '⬆️⬇️⬅️➡️' },

    // 交互类
    { key: '左键点击', description: '使用工具/交互', category: 'interaction', icon: '👆' },
    { key: '右键/空格', description: '挖掘方块/矿石', category: 'interaction', icon: '⛏️' },
    { key: '1-8 数字键', description: '切换快捷栏槽位', category: 'interaction', icon: '🔢' },
    { key: '点击树木', description: '砍伐获得木材', category: 'interaction', icon: '🪓' },
    { key: '向下挖掘', description: '进入地下世界', category: 'interaction', icon: '⬇️' },

    // 背包和商店类（重点）
    { key: 'B', description: '打开/关闭背包', category: 'inventory', icon: '🎒' },
    { key: 'U', description: '打开/关闭商店', category: 'inventory', icon: '🏪' },
    { key: 'C', description: '打开/关闭颜色面板', category: 'inventory', icon: '🎨' },
    { key: 'ESC', description: '按两次暂停游戏/关闭面板', category: 'inventory', icon: '⏸️' },
    { key: 'Ctrl', description: '解锁/锁定鼠标（点击界面按钮）', category: 'inventory', icon: '🔓' },
    { key: '? (Shift+/)', description: '查看快捷键帮助', category: 'inventory', icon: '❓' },

    // 视角类
    { key: 'V', description: '切换第一/第三人称', category: 'view', icon: '🔄' },
    { key: '鼠标移动', description: '控制视角', category: 'view', icon: '🖱️' },

    // 建造类
    { key: 'F', description: '开关建造模式', category: 'building', icon: '🔨' },
    { key: '左键', description: '放置/拆除方块（建造模式）', category: 'building', icon: '👆' },
  ]

  // 按类别分组
  const categories = {
    movement: '🚶 移动控制',
    interaction: '🎮 游戏交互',
    inventory: '📦 背包与商店',
    view: '📷 视角控制',
    building: '🏗️ 建造系统'
  }

  const categoryOrder: (keyof typeof categories)[] = ['movement', 'interaction', 'inventory', 'view', 'building']

  // 获取类别颜色
  const getCategoryColor = (category: string) => {
    const colors = {
      movement: '#4ECDC4',
      interaction: '#FF6B6B',
      inventory: '#95E1D3',
      view: '#A8E6CF',
      building: '#FFD93D'
    }
    return colors[category as keyof typeof colors] || '#CCCCCC'
  }

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
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* 标题 */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h2 style={{
            color: '#FFD700',
            margin: 0,
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            ⌨️ 游戏快捷键
          </h2>
          <div style={{
            color: '#AAA',
            marginTop: '10px',
            fontSize: '14px'
          }}>
            掌握这些快捷键，提升游戏体验
          </div>
        </div>

        {/* 重要快捷键突出显示 */}
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <div style={{
            color: '#FFD700',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            ⭐ 核心快捷键
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '15px' }}>
            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px solid rgba(149, 225, 211, 0.3)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎒</div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#95E1D3',
                marginBottom: '8px'
              }}>B</div>
              <div style={{ color: '#AAA', fontSize: '14px' }}>打开/关闭背包</div>
            </div>

            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px solid rgba(255, 215, 0, 0.3)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏪</div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#FFD700',
                marginBottom: '8px'
              }}>U</div>
              <div style={{ color: '#AAA', fontSize: '14px' }}>打开/关闭商店</div>
            </div>

            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px solid rgba(168, 230, 207, 0.3)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎨</div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#A8E6CF',
                marginBottom: '8px'
              }}>C</div>
              <div style={{ color: '#AAA', fontSize: '14px' }}>打开/关闭颜色面板</div>
            </div>
          </div>
        </div>

        {/* 农场系统详细说明 */}
        <div style={{
          background: 'rgba(78, 205, 196, 0.1)',
          border: '2px solid rgba(78, 205, 196, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <div style={{
            color: '#4ECDC4',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            🌾 智能快捷栏系统
          </div>
          <div style={{
            color: '#CCC',
            fontSize: '14px',
            lineHeight: '1.8',
            textAlign: 'center',
            marginBottom: '15px'
          }}>
            💡 智能交互：根据选中物品自动决定行为
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '5px' }}>🔨</div>
              <div style={{
                background: 'rgba(255, 215, 0, 0.2)',
                color: '#FFD700',
                padding: '4px 10px',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>槽位 1</div>
              <div style={{ color: '#AAA', fontSize: '12px' }}>锄头 → 开垦土地</div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '5px' }}>💧</div>
              <div style={{
                background: 'rgba(255, 215, 0, 0.2)',
                color: '#FFD700',
                padding: '4px 10px',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>槽位 2</div>
              <div style={{ color: '#AAA', fontSize: '12px' }}>水壶 → 浇水</div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '5px' }}>🔪</div>
              <div style={{
                background: 'rgba(255, 215, 0, 0.2)',
                color: '#FFD700',
                padding: '4px 10px',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>槽位 3</div>
              <div style={{ color: '#AAA', fontSize: '12px' }}>镰刀 → 收获作物</div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '5px' }}>🌱</div>
              <div style={{
                background: 'rgba(255, 215, 0, 0.2)',
                color: '#FFD700',
                padding: '4px 10px',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>槽位 4-8</div>
              <div style={{ color: '#AAA', fontSize: '12px' }}>5种作物种子 → 播种</div>
            </div>
          </div>
        </div>

        {/* 所有快捷键列表 */}
        {categoryOrder.map((category) => (
          <div key={category} style={{ marginBottom: '20px' }}>
            <div style={{
              color: getCategoryColor(category),
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `2px solid ${getCategoryColor(category)}`,
            }}>
              {categories[category]}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
              {shortcuts
                .filter(s => s.category === category)
                .map((shortcut, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.transform = 'translateX(5px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <div style={{
                      fontSize: '24px',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      {shortcut.icon}
                    </div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        background: 'rgba(255, 215, 0, 0.2)',
                        color: '#FFD700',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        minWidth: '80px',
                        textAlign: 'center'
                      }}>
                        {shortcut.key}
                      </div>
                      <div style={{ color: '#EEE', fontSize: '14px' }}>
                        {shortcut.description}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* 关闭按钮 */}
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 40px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            关闭 (ESC)
          </button>
        </div>

        {/* 提示 */}
        <div style={{
          textAlign: 'center',
          marginTop: '15px',
          color: '#888',
          fontSize: '12px'
        }}>
          提示：点击 ESC 键或点击遮罩层可快速关闭此窗口
        </div>
      </div>
    </div>
  )
}
