interface MiningProgressBarProps {
  progress: number // 0-100
  targetBlock: string // 方块类型
  isVisible: boolean
}

/**
 * 挖掘进度条组件
 * 显示在屏幕中央，展示当前挖掘进度
 */
export function MiningProgressBar({ progress, targetBlock, isVisible }: MiningProgressBarProps) {
  if (!isVisible || progress <= 0) return null

  const blockNames: Record<string, string> = {
    STONE: '石头',
    DIRT: '泥土',
    COAL_ORE: '煤矿',
    IRON_ORE: '铁矿',
    GOLD_ORE: '金矿',
    DIAMOND_ORE: '钻石矿',
    BEDROCK: '基岩',
    GRASS: '草方块',
    WOOD: '木头'
  }

  const blockName = blockNames[targetBlock] || targetBlock

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 200,
        pointerEvents: 'none'
      }}
    >
      {/* 进度条背景 */}
      <div
        style={{
          width: '200px',
          height: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* 进度填充 */}
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(to right, #4CAF50, #81C784)',
            transition: 'width 0.1s linear'
          }}
        />

        {/* 百分比文字 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap'
          }}
        >
          {Math.floor(progress)}%
        </div>
      </div>

      {/* 方块名称 */}
      <div
        style={{
          marginTop: '8px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}
      >
        挖掘: {blockName}
      </div>
    </div>
  )
}
