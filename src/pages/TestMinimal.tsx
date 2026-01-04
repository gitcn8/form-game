import { Canvas } from '@react-three/fiber'

export default function TestMinimal() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
      <h1 style={{ position: 'absolute', top: 20, left: 20, color: 'white' }}>Minimal Test</h1>
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  )
}
