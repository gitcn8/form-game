import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// 测试旋转的立方体
function RotatingCube() {
  const meshRef = useRef<any>()

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

// 测试球体
function TestSphere() {
  return (
    <mesh position={[2, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

// 测试地面
function TestGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#90ee90" />
    </mesh>
  )
}

export default function Test3D() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('点击测试')

  console.log('🎮 Test3D 组件已渲染')

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 顶部信息栏 */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '20px 40px',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: 1000,
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, marginBottom: '10px' }}>🧪 3D测试页面</h1>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          如果你能看到：<br/>
          ✅ 旋转的橙色立方体<br/>
          ✅ 红色的球体<br/>
          ✅ 绿色的地面<br/>
          ✅ 能用鼠标拖拽旋转视角
        </p>
        <button
          onClick={() => {
            setCount(count + 1)
            setMessage(`点击了 ${count + 1} 次`)
            console.log('🖱️ 按钮被点击:', count + 1)
          }}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          点击测试 ({count})
        </button>
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
          {message}
        </p>
        <p style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>
          打开控制台(F12)查看日志
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 3, 5], fov: 60 }}
        style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F7FA)' }}
        onCreated={() => console.log('✅ Canvas 已创建')}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls />

        <TestGround />
        <RotatingCube />
        <TestSphere />
      </Canvas>

      {/* 底部状态 */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        🖱️ 鼠标拖拽旋转 | 滚轮缩放 | 右键平移
      </div>
    </div>
  )
}
