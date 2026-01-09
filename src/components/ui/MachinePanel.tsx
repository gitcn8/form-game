import { useState, useMemo, useEffect } from 'react'
import {
  MACHINE_CONFIGS,
  FOOD_ITEMS,
  getRecipe,
  getProcessProgress,
  type PlacedMachine,
  type MachineType,
  type FoodRecipe
} from '../../config/MachineConfig'

import { hasEnoughIngredients, type ItemStack } from '../../utils/itemMatcher'

interface MachinePanelProps {
  machine: PlacedMachine
  inventory: ItemStack[]  // 修改为完整的 ItemStack 类型
  onClose: () => void
  onStartProcessing: (recipeId: string, count: number) => void  // 添加 count 参数
  onCollectProduct: () => void
}

/**
 * 机器面板UI组件
 * 显示配方列表、加工进度、收取成品
 */
export function MachinePanel({
  machine,
  inventory,
  onClose,
  onStartProcessing,
  onCollectProduct
}: MachinePanelProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)

  const config = MACHINE_CONFIGS[machine.machineType]

  // 确保面板打开时指针锁定被释放
  useEffect(() => {
    console.log('🔧 [MachinePanel] Panel mounted')
    console.log('🔧 [MachinePanel] pointerLockElement:', document.pointerLockElement)

    // 强制释放指针锁定
    if (document.pointerLockElement) {
      console.log('🔧 [MachinePanel] Forcefully exiting pointer lock')
      document.exitPointerLock()
    }

    // 设置鼠标样式为可见
    document.body.style.cursor = 'auto'
    console.log('🔧 [MachinePanel] Set body cursor to auto')

    return () => {
      console.log('🔧 [MachinePanel] Panel unmounted')
    }
  }, [])

  // 计算加工进度
  const progress = useMemo(() => {
    if (machine.processing && machine.processStartTime && machine.processEndTime) {
      return getProcessProgress(machine.processStartTime, machine.processEndTime)
    }
    return 0
  }, [machine])

  // 检查配方是否可以制作（使用新的匹配工具）
  const canCraft = (recipe: FoodRecipe) => {
    return hasEnoughIngredients(inventory, recipe.ingredients)
  }

  // 获取配方所需材料的总数量（支持多种材料类型）
  const getIngredientsAvailable = (recipe: FoodRecipe) => {
    const availableMap = new Map<string, number>()

    recipe.ingredients.forEach(ingredient => {
      const itemType = ingredient.itemType  // 'crop', 'animal_product', 'processed_food', 'fruit'
      const itemId = ingredient.itemId      // 'crop_wheat', 'animal_milk', etc.

      let totalAvailable = 0

      inventory.forEach(item => {
        if (item.itemType === itemType) {
          if (itemType === 'crop' && item.cropType === itemId.split('_')[1]) {
            totalAvailable += item.count
          } else if (itemType === 'animal_product' && (item as any).productType === itemId.split('_')[1]) {
            totalAvailable += item.count
          } else if (itemType === 'processed_food' && (item as any).foodType === itemId.split('_')[1]) {
            totalAvailable += item.count
          } else if (itemType === 'fruit' && (item as any).fruitType === itemId.split('_')[1]) {
            totalAvailable += item.count
          }
        }
      })

      availableMap.set(`${itemType}_${itemId}`, totalAvailable)
    })

    return availableMap
  }

  // 计算可以制作多少次（基于所有材料的限制）
  const calculateRecipeCount = (recipe: FoodRecipe, availableMap: Map<string, number>) => {
    // 找出所有材料中能制作的最少次数
    let minCount = Infinity

    recipe.ingredients.forEach(ingredient => {
      const key = `${ingredient.itemType}_${ingredient.itemId}`
      const available = availableMap.get(key) || 0
      const canMake = Math.floor(available / ingredient.count)
      minCount = Math.min(minCount, canMake)
    })

    return minCount === Infinity ? 0 : minCount
  }

  // 当选择配方时，自动设置为可制作的次数
  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipe(recipeId)
    const recipe = config.recipes.find(r => r.id === recipeId)
    if (recipe) {
      // 计算可制作次数
      const availableMap = getIngredientsAvailable(recipe)
      const maxCount = calculateRecipeCount(recipe, availableMap)
      // 默认设置为最大可制作次数
      if (maxCount > 0) {
        setSelectedRecipe(recipeId)
      }
    }
  }

  // 开始加工
  const handleStartProcessing = () => {
    if (selectedRecipe) {
      const recipe = config.recipes.find(r => r.id === selectedRecipe)!
      const availableMap = getIngredientsAvailable(recipe)
      const maxCount = calculateRecipeCount(recipe, availableMap)
      onStartProcessing(selectedRecipe, maxCount)
    }
  }

  // 渲染配方材料列表
  const renderIngredients = (recipe: FoodRecipe) => {
    // 获取材料可用数量
    const availableMap = getIngredientsAvailable(recipe)

    return (
      <div className="recipe-ingredients">
        {recipe.ingredients.map((ingredient, index) => {
          // 格式化材料名称
          const itemId = ingredient.itemId
          let materialName = itemId

          if (ingredient.itemType === 'crop') {
            const cropName = itemId.split('_')[1]
            const cropNames: Record<string, string> = {
              wheat: '小麦',
              carrot: '胡萝卜',
              potato: '土豆',
              tomato: '番茄',
              pumpkin: '南瓜'
            }
            materialName = cropNames[cropName] || cropName
          } else if (ingredient.itemType === 'animal_product') {
            const productName = itemId.split('_')[1]
            const productNames: Record<string, string> = {
              egg: '鸡蛋',
              milk: '牛奶',
              wool: '羊毛',
              meat: '肉'
            }
            materialName = productNames[productName] || productName
          } else if (ingredient.itemType === 'processed_food') {
            const foodName = itemId.split('_')[1]
            const foodNames: Record<string, string> = {
              flour: '面粉',
              cheese: '奶酪'
            }
            materialName = foodNames[foodName] || foodName
          } else if (ingredient.itemType === 'fruit') {
            const fruitName = itemId.split('_')[1]
            const fruitNames: Record<string, string> = {
              apple: '苹果',
              orange: '橙子',
              peach: '桃子',
              cherry: '樱桃',
              pear: '梨'
            }
            materialName = fruitNames[fruitName] || fruitName
          }

          const key = `${ingredient.itemType}_${ingredient.itemId}`
          const available = availableMap.get(key) || 0
          const hasEnough = available >= ingredient.count

          return (
            <div key={index} className={`ingredient-item ${!hasEnough ? 'insufficient' : ''}`}>
              <span className="ingredient-name">
                {materialName}
              </span>
              <span className="ingredient-count">
                {available}/{ingredient.count}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="machine-panel-overlay"
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        cursor: 'auto'
      }}
    >
      <div
        className="machine-panel"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="machine-panel-header">
          <h2>
            {config.icon} {config.name}
          </h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 机器状态 */}
        <div className="machine-status">
          {machine.processing ? (
            <div className="processing-status">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p>加工中... {progress}%</p>
            </div>
          ) : machine.recipeId ? (
            <div className="completed-status">
              <p>✅ 加工完成！</p>
              <button className="collect-button" onClick={onCollectProduct}>
                收取成品
              </button>
            </div>
          ) : (
            <p>等待开始加工...</p>
          )}
        </div>

        {/* 配方列表 */}
        {!machine.processing && !machine.recipeId && (
          <div className="recipe-list">
            <h3>选择配方</h3>
            {config.recipes.map((recipe) => {
              const isCanCraft = canCraft(recipe)
              const isSelected = selectedRecipe === recipe.id

              return (
                <div
                  key={recipe.id}
                  className={`recipe-item ${isSelected ? 'selected' : ''} ${!isCanCraft ? 'disabled' : ''}`}
                  onClick={() => isCanCraft && handleRecipeSelect(recipe.id)}
                >
                  <div className="recipe-header">
                    <span className="recipe-icon">{recipe.icon}</span>
                    <span className="recipe-name">{recipe.name}</span>
                    <span className="recipe-time">⏱️ {recipe.processTime}秒</span>
                  </div>
                  {renderIngredients(recipe)}
                  <div className="recipe-effects">
                    <span>💪 +{recipe.staminaRestore}体力</span>
                    <span>🍽️ +{recipe.satiety}饱食度</span>
                    {recipe.buff && (
                      <span>
                        ⭐
                        {recipe.buff.type === 'speed' && '速度'}
                        {recipe.buff.type === 'efficiency' && '效率'}
                        {recipe.buff.type === 'luck' && '幸运'}
                        +{recipe.buff.value}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 操作按钮 */}
        {!machine.processing && !machine.recipeId && selectedRecipe && (
          <div className="machine-actions">
            {/* 显示可制作次数 */}
            {(() => {
              const recipe = config.recipes.find(r => r.id === selectedRecipe)!
              const availableMap = getIngredientsAvailable(recipe)
              const maxCount = calculateRecipeCount(recipe, availableMap)
              const totalOutput = recipe.outputCount * maxCount

              // 获取机器的动作文本
              const getActionText = () => {
                switch (machine.machineType) {
                  case 'machine_oven': return '烘烤'
                  case 'machine_boiler': return '煮制'
                  case 'machine_juicer': return '榨汁'
                  case 'machine_grinder': return '研磨'
                  case 'machine_mixer': return '搅拌'
                  default: return '加工'
                }
              }

              return (
                <div className="recipe-info">
                  <div className="info-row">
                    <span>可制作次数：</span>
                    <span className="info-number">{maxCount}</span>
                  </div>
                  <div className="info-row">
                    <span>预计产出：</span>
                    <span className="info-number">{totalOutput}</span>
                    <span>{recipe.name}</span>
                  </div>
                </div>
              )
            })()}

            <button
              className="start-button"
              onClick={handleStartProcessing}
              disabled={!canCraft(config.recipes.find(r => r.id === selectedRecipe)!)}
            >
              🔥 开始{config.name.replace('机器', '')}
            </button>
          </div>
        )}

        {/* 机器描述 */}
        <div className="machine-description">
          <p>{config.description}</p>
        </div>
      </div>

      <style>{`
        .machine-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .machine-panel {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 4px solid #ffd700;
          border-radius: 20px;
          padding: 24px;
          width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          color: white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .machine-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
        }

        .machine-panel-header h2 {
          margin: 0;
          font-size: 28px;
          color: #ffd700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .machine-status {
          background: rgba(0, 0, 0, 0.3);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          text-align: center;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.2);
          height: 24px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          background: linear-gradient(90deg, #00ff88, #00cc6a);
          height: 100%;
          transition: width 0.3s;
          border-radius: 12px;
        }

        .collect-button {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          border: none;
          color: white;
          padding: 12px 32px;
          border-radius: 24px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
        }

        .collect-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 255, 136, 0.4);
        }

        .recipe-list {
          background: rgba(0, 0, 0, 0.2);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .recipe-list h3 {
          margin: 0 0 16px 0;
          color: #ffd700;
        }

        .recipe-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .recipe-item:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(4px);
        }

        .recipe-item.selected {
          border-color: #ffd700;
          background: rgba(255, 215, 0, 0.2);
        }

        .recipe-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .recipe-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .recipe-icon {
          font-size: 32px;
          margin-right: 12px;
        }

        .recipe-name {
          font-size: 18px;
          font-weight: bold;
          flex: 1;
        }

        .recipe-time {
          font-size: 14px;
          color: #ffd700;
        }

        .recipe-ingredients {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .ingredient-item {
          background: rgba(0, 0, 0, 0.3);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ingredient-item.insufficient {
          opacity: 0.5;
          background: rgba(255, 0, 0, 0.2);
        }

        .ingredient-count {
          font-weight: bold;
          color: #ffd700;
        }

        .recipe-effects {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 14px;
          color: #ffd700;
        }

        .machine-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .recipe-info {
          background: rgba(0, 0, 0, 0.3);
          padding: 16px;
          border-radius: 12px;
          width: 100%;
          text-align: center;
        }

        .info-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-number {
          font-size: 24px;
          font-weight: bold;
          color: #ffd700;
        }

        .count-label {
          font-size: 16px;
          margin-bottom: 12px;
          color: #ffd700;
        }

        .count-number {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
        }

        .count-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .count-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: 2px solid #ffd700;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .count-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        }

        .count-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .count-display {
          font-size: 32px;
          font-weight: bold;
          min-width: 60px;
          color: white;
        }

        .count-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
        }

        .max-recipes {
          color: #ffd700;
          font-weight: bold;
        }

        .total-materials,
        .total-output {
          color: rgba(255, 255, 255, 0.9);
        }

        .start-button {
          background: linear-gradient(135deg, #ff6b6b, #ff5252);
          border: none;
          color: white;
          padding: 16px 48px;
          border-radius: 24px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .start-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
        }

        .start-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .machine-description {
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  )
}
