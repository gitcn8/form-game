import { useState, useEffect, useRef } from 'react'
import {
  BUYABLE_ITEMS,
  SELLABLE_ITEMS,
  BUY_CATEGORIES,
  SELL_CATEGORIES,
  getBuyableItemsByCategory,
  getSellableItemsByCategory,
  type BuyableItem,
  type SellableItem
} from '../../config/ShopConfig'

interface ShopProps {
  isVisible: boolean
  gold: number
  inventory: {
    wood: number
    stone: number
    dirt: number
    // 新增材料库存
    glass?: number
    door?: number
    planks?: number
  }
  // 背包物品（用于出售）
  backpackItems?: Array<{ id: string; itemType: string; count: number }>
  onClose: () => void
  onBuyMaterial: (type: 'wood' | 'stone' | 'dirt' | 'glass' | 'door' | 'planks', count: number) => void
  onBuyItem?: (itemId: string, count: number) => void // 购买其他物品
  onSellItem?: (itemId: string, count: number) => void // 出售物品
}

/**
 * 商店界面（新版本）
 * 支持购买/出售双向交易，支持多分类
 */
export function Shop({
  isVisible,
  gold,
  inventory,
  backpackItems = [],
  onClose,
  onBuyMaterial,
  onBuyItem,
  onSellItem
}: ShopProps) {
  // 购买或出售模式
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  // 当前选中的分类
  const [selectedCategory, setSelectedCategory] = useState<string>(
    BUY_CATEGORIES[0].id
  )

  // 调试：只在模式从 buy 变为 sell 时打印一次背包内容
  useEffect(() => {
    if (isVisible && mode === 'sell') {
      const nonEmptySlots = backpackItems.filter((s) => {
        return s && s.count > 0
      })

      console.log('[商店] ========== 背包详细信息 ==========')
      console.log('[商店] 背包总槽位数:', backpackItems.length)
      console.log('[商店] 非空槽位:', nonEmptySlots.length)
      console.log('[商店] 非空槽位详情:')
      nonEmptySlots.forEach((s, i) => {
        const index = backpackItems.indexOf(s)
        console.log(`  [${index}]`, {
          itemType: s?.itemType,
          cropType: (s as any)?.cropType,
          treeType: (s as any)?.treeType,
          productType: (s as any)?.productType,
          blockType: (s as any)?.blockType,
          seedType: (s as any)?.seedType,
          toolType: s?.toolType,
          type: (s as any)?.type,
          count: s?.count,
          name: s?.name,
          id: s?.id
        })
      })
      console.log('[商店] =====================================')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]) // 只依赖 mode，确保只在切换模式时执行一次

  // 切换模式时重置分类
  useEffect(() => {
    if (mode === 'buy') {
      setSelectedCategory(BUY_CATEGORIES[0].id)
    } else {
      setSelectedCategory(SELL_CATEGORIES[0].id)
    }
  }, [mode])

  if (!isVisible) return null

  // 获取当前分类的商品列表
  const currentCategories = mode === 'buy' ? BUY_CATEGORIES : SELL_CATEGORIES
  const currentItems =
    mode === 'buy'
      ? getBuyableItemsByCategory(selectedCategory)
      : getSellableItemsByCategory(selectedCategory)

  // 购买商品
  const handleBuyItem = (item: BuyableItem, count: number) => {
    const totalCost = item.price * count

    if (gold < totalCost) {
      alert('金币不足！')
      return
    }

    // 建筑材料特殊处理
    if (item.category === 'materials') {
      const materialType = item.id.replace('material_', '') as any
      onBuyMaterial(materialType, count)
    } else {
      // 其他物品（种子、工具、机器等）
      onBuyItem?.(item.id, count)
    }
  }

  // 出售商品
  const handleSellItem = (item: SellableItem) => {
    // 检查背包中该物品的数量
    const playerItemCount = getItemCountInBackpack(item.id)

    if (playerItemCount === 0) {
      return // 没有物品，不能出售
    }

    // 出售1个（默认）
    onSellItem?.(item.id, 1)
  }

  // 统计背包中某个物品的数量
  const getItemCountInBackpack = (itemId: string): number => {
    // 从 itemId 中提取物品类型
    // 例如: 'crop_carrot' -> cropType: 'carrot'
    // 'fruit_apple' -> treeType: 'apple'
    const parts = itemId.split('_')
    const itemType = parts[0] // 'crop', 'fruit', 'product', etc.
    const itemSubType = parts[1] // 'carrot', 'apple', etc.

    let totalCount = 0

    // 遍历背包槽位统计数量
    for (const stack of backpackItems) {
      if (!stack || stack.count === 0) continue

      // 根据物品类型匹配
      if (itemType === 'crop' && stack.itemType === 'crop' && (stack as any).cropType === itemSubType) {
        totalCount += stack.count
      } else if (itemType === 'fruit') {
        // 检查是否是水果（树果）
        if ((stack as any).treeType === itemSubType) {
          totalCount += stack.count
        }
        // 也检查 seedType（如果是种子的话）
        else if ((stack as any).seedType === `seed_${itemSubType}`) {
          totalCount += stack.count
        }
      } else if (itemType === 'product' && (stack as any).productType === itemSubType) {
        totalCount += stack.count
      } else if (itemType === 'mineral') {
        if (itemId === 'mineral_gold' && stack.blockType === 'gold_ore') {
          totalCount += stack.count
        } else if (itemId === 'mineral_silver' && stack.blockType === 'silver') {
          totalCount += stack.count
        } else if (itemId === 'mineral_iron' && stack.blockType === 'iron_ore') {
          totalCount += stack.count
        }
      }
    }

    return totalCount
  }

  // 渲染购买商品卡片
  const renderBuyCard = (item: BuyableItem) => {
    const stackSize = item.stackSize || 1
    const singlePrice = item.price
    const stackPrice = singlePrice * stackSize

    return (
      <div
        key={item.id}
        style={{
          background: 'rgba(139, 69, 19, 0.3)',
          padding: '15px',
          borderRadius: '8px',
          border: '2px solid rgba(139, 69, 19, 0.5)',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '20px' }}>
            {item.icon} {item.name}
          </div>
          <div style={{ fontSize: '16px', color: '#FFD700' }}>
            {singlePrice}金币{stackSize > 1 ? `/包(${stackSize}个)` : '/个'}
          </div>
        </div>
        <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '10px' }}>{item.description}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleBuyItem(item, 1)}
            disabled={gold < singlePrice}
            style={{
              flex: 1,
              padding: '8px',
              background: gold >= singlePrice ? 'linear-gradient(to bottom, #4CAF50, #45a049)' : 'gray',
              border: '2px solid #2d6a2d',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: gold >= singlePrice ? 'pointer' : 'not-allowed'
            }}
          >
            买{stackSize > 1 ? `1包(${singlePrice}金币)` : `1个(${singlePrice}金币)`}
          </button>
          {stackSize > 1 && (
            <button
              onClick={() => handleBuyItem(item, stackSize)}
              disabled={gold < stackPrice}
              style={{
                flex: 1,
                padding: '8px',
                background: gold >= stackPrice ? 'linear-gradient(to bottom, #4CAF50, #45a049)' : 'gray',
                border: '2px solid #2d6a2d',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: gold >= stackPrice ? 'pointer' : 'not-allowed'
              }}
            >
              买{stackSize}包({stackPrice}金币)
            </button>
          )}
        </div>
      </div>
    )
  }

  // 渲染出售商品卡片
  const renderSellCard = (item: SellableItem) => {
    // 检查背包中该物品的数量
    const playerItemCount = getItemCountInBackpack(item.id)
    const hasItem = playerItemCount > 0

    return (
      <div
        key={item.id}
        style={{
          background: 'rgba(139, 69, 19, 0.3)',
          padding: '15px',
          borderRadius: '8px',
          border: '2px solid rgba(139, 69, 19, 0.5)',
          marginBottom: '10px',
          opacity: hasItem ? 1 : 0.5
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '20px' }}>
            {item.icon} {item.name}
          </div>
          <div style={{ fontSize: '16px', color: '#FFD700' }}>{item.price}金币/个</div>
        </div>
        <div style={{ fontSize: '14px', color: '#CCCCCC', marginBottom: '10px' }}>{item.description}</div>
        {hasItem && (
          <div style={{ fontSize: '12px', color: '#90EE90', marginBottom: '10px' }}>
            📦 拥有数量: {playerItemCount} 个
          </div>
        )}
        <button
          onClick={() => handleSellItem(item)}
          disabled={!hasItem}
          style={{
            width: '100%',
            padding: '8px',
            background: hasItem ? 'linear-gradient(to bottom, #FF6B6B, #EE5A5A)' : 'gray',
            border: '2px solid #c0392b',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: hasItem ? 'pointer' : 'not-allowed'
          }}
        >
          {hasItem ? `出售1个 (获得${item.price}金币)` : '暂无物品'}
        </button>
      </div>
    )
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
          maxWidth: '700px',
          maxHeight: '80vh',
          border: '3px solid rgba(255, 215, 0, 0.6)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        {/* 标题 */}
        <h3 style={{ margin: '0 0 20px 0', fontSize: '28px', color: '#FFD700', textAlign: 'center' }}>
          🛒 商店
        </h3>

        {/* 金币显示 */}
        <div
          style={{
            background: 'rgba(255, 215, 0, 0.2)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'center',
            border: '2px solid rgba(255, 215, 0, 0.4)'
          }}
        >
          <div style={{ fontSize: '24px', color: '#FFD700', fontWeight: 'bold' }}>💰 我的金币: {gold}</div>
        </div>

        {/* 购买/出售切换 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => setMode('buy')}
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'buy' ? 'linear-gradient(to bottom, #4CAF50, #45a049)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${mode === 'buy' ? '#2d6a2d' : '#666'}`,
              borderRadius: '8px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🛍️ 购买
          </button>
          <button
            onClick={() => setMode('sell')}
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'sell' ? 'linear-gradient(to bottom, #FF6B6B, #EE5A5A)' : 'rgba(0,0,0,0.3)',
              border: `2px solid ${mode === 'sell' ? '#c0392b' : '#666'}`,
              borderRadius: '8px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            💰 出售
          </button>
        </div>

        {/* 分类标签页 */}
        <div
          style={{
            display: 'flex',
            gap: '5px',
            marginBottom: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {currentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat.id ? cat.color : 'rgba(0,0,0,0.3)',
                border: `2px solid ${selectedCategory === cat.id ? cat.color : '#666'}`,
                borderRadius: '6px',
                color: selectedCategory === cat.id ? 'white' : '#CCC',
                fontSize: '14px',
                fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 商品列表 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '350px',
            overflowY: 'auto',
            padding: '5px'
          }}
        >
          {currentItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              该分类暂无商品
            </div>
          ) : mode === 'buy' ? (
            currentItems.map((item) => renderBuyCard(item as BuyableItem))
          ) : (
            currentItems.map((item) => renderSellCard(item as SellableItem))
          )}
        </div>

        {/* 关闭按钮 */}
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
            关闭 (U)
          </button>
        </div>

        {/* 提示信息 */}
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#90EE90', textAlign: 'center' }}>
          {mode === 'buy' ? (
            <>💡 提示：购买机器可以加工农产品，制作高价值食物出售赚更多钱！</>
          ) : (
            <>💡 提示：出售加工食品比原材料更赚钱！用机器加工农产品再出售。</>
          )}
        </div>
      </div>
    </div>
  )
}
