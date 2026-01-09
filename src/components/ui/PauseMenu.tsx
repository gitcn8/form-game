import { useEffect } from 'react'

interface PauseMenuProps {
  isVisible: boolean
  onResume: () => void
  isFirstTime?: boolean  // 是否是首次进入游戏
}

/**
 * 暂停菜单 / 开始屏幕
 * 首次进入显示"开始游戏"，暂停后显示"继续游戏"
 */
export function PauseMenu({ isVisible, onResume, isFirstTime = false }: PauseMenuProps) {
  // 主动锁定鼠标指针
  const requestPointerLock = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.requestPointerLock()
    }
    onResume()
  }

  // 监听键盘事件：按Enter键开始游戏
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        e.preventDefault()
        requestPointerLock()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, onResume])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={requestPointerLock}
    >
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🌾 我的世界农场</h1>
      <p style={{ fontSize: '24px', marginBottom: '30px', color: '#FFD700', fontWeight: 'bold' }}>
        {isFirstTime
          ? '点击屏幕或按Enter键开始游戏 - 无限探索'
          : '点击屏幕或按Enter键继续游戏'
        }
      </p>

      {/* 开始游戏/继续游戏按钮 */}
      <button
        onClick={requestPointerLock}
        style={{
          padding: '15px 60px',
          marginBottom: '30px',
          background: 'linear-gradient(to bottom, #4CAF50, #45a049)',
          border: '3px solid #2d6a2d',
          borderRadius: '12px',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)'
        }}
      >
        {isFirstTime ? '🎮 开始游戏' : '🎮 继续游戏'}
      </button>

      {/* 提示查看快捷键帮助 */}
      <div style={{ fontSize: '16px', color: '#AAA', textAlign: 'center' }}>
        💡 按 <span style={{ color: '#FFD700', fontWeight: 'bold' }}>? 键</span> 或点击右下角 <span style={{ fontSize: '20px' }}>⌨️</span> 查看完整快捷键帮助
      </div>
    </div>
  )
}
