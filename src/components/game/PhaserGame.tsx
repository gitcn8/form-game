import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { MainScene } from '../../game/scenes/MainScene'

function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 避免重复创建
    if (gameRef.current) {
      return
    }

    console.log('🚀 初始化 Phaser 游戏...')

    // Phaser 配置
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: parentRef.current!,
      backgroundColor: '#90cdf4',
      scene: [MainScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        pixelArt: false,
        antialias: true
      }
    }

    // 创建游戏实例
    gameRef.current = new Phaser.Game(config)

    console.log('✅ Phaser 游戏已创建')

    // 清理函数
    return () => {
      if (gameRef.current) {
        console.log('🧹 清理 Phaser 游戏...')
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={parentRef}
      className="w-full h-full"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    />
  )
}

export default PhaserGame
