import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useGameStore } from '../../store/gameStore'

// 3D土地组件
function FarmPlot({ position, plotId, state, onPlotClick }: any) {
  const [hovered, setHover] = useState(false)

  const getColor = () => {
    switch (state) {
      case 'empty': return '#8b6914'
      case 'tilled': return '#5c3d0a'
      case 'watered': return '#1e40af'
      case 'planted': return '#22c55e'
      case 'ready': return '#ffa500'
      default: return '#8b6914'
    }
  }

  return (
    <mesh
      position={position}
      onClick={() => onPlotClick(plotId)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={hovered ? 1.1 : 1}
    >
      <boxGeometry args={[0.9, 0.15, 0.9]} />
      <meshStandardMaterial color={getColor()} />
    </mesh>
  )
}

// 玩家组件
function Player({ position }: any) {
  return (
    <group position={position}>
      {/* 身体 */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.25, 0.5, 0.25]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>
      {/* 头 */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffcc99" />
      </mesh>
    </group>
  )
}

// 地面
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial color="#90ee90" />
    </mesh>
  )
}

export default function FarmScene3D() {
  const { player } = useGameStore()
  const [plots, setPlots] = useState<any[]>(
    Array.from({ length: 48 }, (_, i) => ({ id: i, state: 'empty' }))
  )
  const [currentTool, setCurrentTool] = useState('hoe')
  const [playerPos, setPlayerPos] = useState([0, 0.5, 3])

  const keys = useRef({ w: false, a: false, s: false, d: false })

  // 键盘控制
  useEffect(() => {
    const handleDown = (e: any) => {
      const key = e.key.toLowerCase()
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = true

      // 工具切换
      if (e.key === '1') setCurrentTool('hoe')
      if (e.key === '2') setCurrentTool('water')
      if (e.key === '3') setCurrentTool('seed')
      if (e.key === '4') setCurrentTool('harvest')
    }

    const handleUp = (e: any) => {
      const key = e.key.toLowerCase()
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = false
    }

    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  // 土地交互
  const handlePlotClick = (plotId: number) => {
    const energyCosts: any = { hoe: 2, water: 1, seed: 1, harvest: 0 }
    const cost = energyCosts[currentTool]

    if (player.energy < cost) {
      alert('❌ 体力不足！')
      return
    }

    const newPlots = [...plots]
    const plot = newPlots[plotId]

    switch (currentTool) {
      case 'hoe':
        if (plot.state === 'empty') {
          plot.state = 'tilled'
          useGameStore.getState().useEnergy(cost)
        }
        break
      case 'water':
        if (plot.state === 'tilled' || plot.state === 'planted') {
          plot.state = 'watered'
          useGameStore.getState().useEnergy(cost)
        }
        break
      case 'seed':
        if (plot.state === 'tilled' || plot.state === 'watered') {
          plot.state = 'planted'
          useGameStore.getState().useEnergy(cost)
          setTimeout(() => {
            setPlots((prev: any) => {
              const updated = [...prev]
              if (updated[plotId].state === 'planted') {
                updated[plotId].state = 'ready'
              }
              return updated
            })
          }, 10000)
        }
        break
      case 'harvest':
        if (plot.state === 'ready') {
          plot.state = 'empty'
          useGameStore.getState().addGold(10)
          alert('🥕 收获成功！+10金币')
        }
        break
    }
    setPlots(newPlots)
  }

  // 生成土地位置（6x8网格，扩大农场范围）
  const plotPositions: any[] = []
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      const x = (col - 3.5) * 1.3
      const z = (row - 2.5) * 1.3
      plotPositions.push([x, 0, z])
    }
  }

  const toolEmoji = {
    hoe: '🪓 锄头',
    water: '💧 水壶',
    seed: '🌱 种子',
    harvest: '🌾 镰刀'
  }

  const toolColors = {
    hoe: 'from-amber-500 to-orange-600',
    water: 'from-blue-500 to-cyan-600',
    seed: 'from-green-500 to-emerald-600',
    harvest: 'from-yellow-500 to-amber-600'
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'linear-gradient(to bottom, #87CEEB, #90EE90)', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 8, 6], fov: 60 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 8]} intensity={1.0} castShadow />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 8}
          minDistance={3}
          maxDistance={15}
        />

        <Ground />

        {plots.map((plot, i) => (
          <FarmPlot
            key={plot.id}
            position={plotPositions[i]}
            plotId={i}
            state={plot.state}
            onPlotClick={handlePlotClick}
          />
        ))}

        <Player position={playerPos} />
      </Canvas>

      {/* 顶部标题栏（星露谷风格） */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.95), rgba(101, 67, 33, 0.9))',
        padding: '12px 20px',
        borderBottom: '3px solid rgba(255, 215, 0, 0.6)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <div>
            <h1 style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              🌾 我的农场
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ color: '#90EE90', fontSize: '14px' }}>
              土地: {plots.filter(p => p.state !== 'empty').length} / {plots.length}
            </div>
          </div>
        </div>
      </div>

      {/* 左侧信息面板 */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,248,255,0.95))',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        minWidth: '200px',
        border: '2px solid rgba(255, 215, 0, 0.4)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#8B4513', fontSize: '18px', fontWeight: 'bold', borderBottom: '2px solid #FFD700', paddingBottom: '8px' }}>
          📊 农场信息
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>当前工具:</span>
            <span style={{ fontWeight: 'bold', color: '#8B4513' }}>{toolEmoji[currentTool as keyof typeof toolEmoji]}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>已开垦:</span>
            <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{plots.filter(p => p.state === 'tilled' || p.state === 'watered' || p.state === 'planted' || p.state === 'ready').length} 块</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>已种植:</span>
            <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{plots.filter(p => p.state === 'planted' || p.state === 'ready').length} 块</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>可收获:</span>
            <span style={{ fontWeight: 'bold', color: '#ffa500' }}>{plots.filter(p => p.state === 'ready').length} 块</span>
          </div>
        </div>
      </div>

      {/* 底部工具栏（星露谷风格） */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(139, 69, 19, 0.95), rgba(101, 67, 33, 0.9))',
        padding: '16px 20px',
        borderTop: '3px solid rgba(255, 215, 0, 0.6)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {(['hoe', 'water', 'seed', 'harvest'] as const).map((tool, index) => (
            <button
              key={tool}
              onClick={() => setCurrentTool(tool)}
              style={{
                padding: '12px 24px',
                background: currentTool === tool
                  ? `linear-gradient(to bottom, #FFD700, #FFA500)`
                  : `linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.1))`,
                border: currentTool === tool ? '3px solid #8B4513' : '2px solid rgba(255, 215, 0, 0.4)',
                borderRadius: '12px',
                color: currentTool === tool ? '#8B4513' : '#FFFFFF',
                fontSize: '16px',
                fontWeight: currentTool === tool ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: currentTool === tool ? '0 4px 12px rgba(255, 215, 0, 0.5)' : 'none',
                minWidth: '120px',
                textShadow: currentTool === tool ? 'none' : '1px 1px 2px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => {
                if (currentTool !== tool) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.2))'
                }
              }}
              onMouseLeave={(e) => {
                if (currentTool !== tool) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.1))'
                }
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{toolEmoji[tool]}</div>
              <div style={{ fontSize: '12px' }}>按 {index + 1}</div>
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px', color: '#90EE90', fontSize: '12px' }}>
          💡 提示：点击数字键 1-4 切换工具 | 鼠标拖拽旋转视角 | 滚轮缩放 | 点击土地进行操作
        </div>
      </div>

      {/* 右侧操作提示 */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.9)',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        fontSize: '13px',
        color: '#666',
        maxWidth: '180px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#8B4513', fontSize: '14px' }}>🎮 操作说明</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>🖱️ 拖拽：旋转视角</div>
          <div>🔄 滚轮：缩放远近</div>
          <div>👆 点击：操作土地</div>
          <div>⌨️ 1-4：切换工具</div>
        </div>
      </div>
    </div>
  )
}
