interface InventoryProps {
  isVisible: boolean
  gold: number
  inventory: {
    carrot: number
  }
  onClose: () => void
  onSellItem: (type: 'carrot', count: number) => void
  onDropItem: (type: 'carrot', count: number) => void
}

/**
 * 背包界面
 * 显示玩家拥有的物品，支持出售和丢弃
 */
export function Inventory({ isVisible, gold, inventory, onClose, onSellItem, onDropItem }: InventoryProps) {
  if (!isVisible) return null

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(139, 69, 19, 0.95)',
        padding: '30px',
        borderRadius: '16px',
        color: 'white',
        zIndex: 200,
        minWidth: '400px',
        border: '3px solid rgba(255, 215, 0, 0.6)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}
    >
      <h3 style={{ margin: '0 0 20px 0', fontSize: '28px', color: '#FFD700', textAlign: 'center' }}>🎒 背包</h3>

      {/* 金币显示 */}
      <div
        style={{
          background: 'rgba(255, 215, 0, 0.2)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '2px solid rgba(255, 215, 0, 0.4)'
        }}
      >
        <div style={{ fontSize: '24px', color: '#FFD700', fontWeight: 'bold' }}>💰 金币: {gold}</div>
      </div>

      {/* 物品列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* 胡萝卜 */}
        {inventory.carrot > 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '20px' }}>🥕 胡萝卜 x {inventory.carrot}</div>
              <div style={{ fontSize: '16px', color: '#90EE90' }}>单价: 10 金币</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onSellItem('carrot', 1)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                  border: '2px solid #2d6a2d',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                出售1个
              </button>
              <button
                onClick={() => onSellItem('carrot', inventory.carrot)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
                  border: '2px solid #2d6a2d',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                全部出售
              </button>
              <button
                onClick={() => onDropItem('carrot', 1)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(to bottom, #f44336, #da190b)',
                  border: '2px solid #a9190b',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                丢掉1个
              </button>
            </div>
          </div>
        )}

        {/* 空背包提示 */}
        {inventory.carrot === 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '16px',
              color: '#999'
            }}
          >
            背包是空的
            <br />
            <span style={{ fontSize: '14px' }}>走近掉落物品可自动拾取</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
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

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#90EE90', textAlign: 'center' }}>
        💡 提示：走近物品自动拾取 | 出售获得金币
      </div>
    </div>
  )
}
