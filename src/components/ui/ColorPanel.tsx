interface ColorPanelProps {
  isVisible: boolean
  playerColors: {
    head: string
    body: string
    limbs: string
  }
  onColorChange: (colors: { head: string; body: string; limbs: string }) => void
  onClose: () => void
}

/**
 * 颜色设置面板
 * 允许玩家自定义角色颜色（头部、身体、四肢）
 */
export function ColorPanel({ isVisible, playerColors, onColorChange, onClose }: ColorPanelProps) {
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
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '30px',
          borderRadius: '16px',
          color: 'white',
          minWidth: '300px',
          border: '3px solid rgba(255, 215, 0, 0.6)'
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#FFD700' }}>🎨 角色颜色设置</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label>头部颜色：</label>
            <input
              type="color"
              value={playerColors.head}
              onChange={(e) => onColorChange({ ...playerColors, head: e.target.value })}
              style={{ width: '60px', height: '40px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label>身体颜色：</label>
            <input
              type="color"
              value={playerColors.body}
              onChange={(e) => onColorChange({ ...playerColors, body: e.target.value })}
              style={{ width: '60px', height: '40px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label>四肢颜色：</label>
            <input
              type="color"
              value={playerColors.limbs}
              onChange={(e) => onColorChange({ ...playerColors, limbs: e.target.value })}
              style={{ width: '60px', height: '40px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 215, 0, 0.9)',
              border: '2px solid white',
              borderRadius: '8px',
              color: '#8B4513',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>

        <div style={{ marginTop: '15px', fontSize: '14px', color: '#90EE90', textAlign: 'center' }}>
          💡 提示：按 V 键切换到第三人称查看效果
        </div>
      </div>
    </div>
  )
}
