import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'

interface FirstPersonControllerProps {
  onLockChange: (locked: boolean) => void
  cameraMode: 'first' | 'third'
  onPlayerPositionChange: (pos: [number, number, number]) => void
  onPlayerRotationChange: (rotation: number) => void
  onMovingChange: (isMoving: boolean) => void
  disabled?: boolean  // 禁用指针锁定（当弹窗打开时）
}

/**
 * 玩家控制器（第一人称/第三人称）
 * 处理WASD移动、鼠标视角控制、脚步声、头部晃动等
 */
export function FirstPersonController({
  onLockChange,
  cameraMode,
  onPlayerPositionChange,
  onPlayerRotationChange,
  onMovingChange,
  disabled = false
}: FirstPersonControllerProps) {
  const { camera, gl } = useThree()
  const controls = useRef<any>(null)

  // 当禁用状态改变时，处理指针锁定
  useEffect(() => {
    console.log('🎮 [FirstPersonController] disabled changed to:', disabled)
    console.log('🎮 [FirstPersonController] pointerLockElement:', document.pointerLockElement)

    if (disabled) {
      // 禁用时，总是尝试解锁指针
      if (document.pointerLockElement) {
        console.log('🎮 [FirstPersonController] Calling exitPointerLock because disabled')
        document.exitPointerLock()
      }

      // 确保鼠标可见
      const canvas = gl.domElement
      console.log('🎮 [FirstPersonController] canvas.style.cursor before:', canvas.style.cursor)

      // 清除可能设置的 cursor: none
      canvas.style.cursor = 'auto'
      document.body.style.cursor = 'auto'

      console.log('🎮 [FirstPersonController] Set canvas and body cursor to auto')
    }
  }, [disabled, gl])

  const moveForward = useRef(false)
  const moveBackward = useRef(false)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)

  const velocity = useRef([0, 0, 0])
  const direction = useRef([0, 0, 0])
  const playerPos = useRef([0, 0, 5])
  const playerRotation = useRef(0)

  // 脚步声
  const audioContext = useRef<AudioContext | null>(null)
  const lastStepTime = useRef(0)
  const stepInterval = 0.5 // 脚步间隔（秒）

  // 播放脚步声
  const playFootstep = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContext.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // 使用低频振荡器模拟脚步声
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 80 + Math.random() * 40 // 随机低频
    oscillator.type = 'triangle'

    // 音量包络（快速衰减）
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  // 组件挂载时，检查当前的鼠标锁定状态并同步
  // 这解决了重新挂载时鼠标已经锁定但不会触发 'lock' 事件的问题
  useEffect(() => {
    const currentlyLocked = !!document.pointerLockElement
    if (currentlyLocked) {
      onLockChange(true)
    }
  }, []) // 只在挂载时执行一次

  useEffect(() => {
    if (!controls.current) return

    // 监听锁定状态
    const handleLock = () => {
      console.log('🎮 [FirstPersonController] POINTER LOCKED!')
      console.log('🎮 [FirstPersonController] disabled prop:', disabled)

      // 如果当前是禁用状态，立即解锁
      if (disabled) {
        console.log('🎮 [FirstPersonController] Disabled is true, immediately unlocking!')
        document.exitPointerLock()
        return
      }

      onLockChange(true)
    }
    const handleUnlock = () => {
      console.log('🎮 [FirstPersonController] POINTER UNLOCKED!')
      onLockChange(false)
    }

    controls.current.addEventListener('lock', handleLock)
    controls.current.addEventListener('unlock', handleUnlock)

    return () => {
      controls.current?.removeEventListener('lock', handleLock)
      controls.current?.removeEventListener('unlock', handleUnlock)
    }
  }, [onLockChange, disabled])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = true
          break
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = true
          break
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = false
          break
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = false
          break
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = false
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!controls.current) return

    const speed = 0.15
    const [vx, vy, vz] = velocity.current
    const [dx, dy, dz] = direction.current
    const [px, py, pz] = playerPos.current

    // 获取相机旋转角度（用于玩家朝向）
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion)
    playerRotation.current = euler.y

    // 阻尼效果
    velocity.current = [vx - vx * 0.1, vy - vy * 0.1, vz - vz * 0.1]
    direction.current = [dx - dx * 0.1, dy - dy * 0.1, dz - dz * 0.1]

    // 移动输入（基于相机朝向）
    // 获取相机的前进和右方向量
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation.current)
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation.current)

    if (moveForward.current) {
      velocity.current[0] += forward.x * speed * 0.1
      velocity.current[2] += forward.z * speed * 0.1
    }
    if (moveBackward.current) {
      velocity.current[0] -= forward.x * speed * 0.1
      velocity.current[2] -= forward.z * speed * 0.1
    }
    if (moveLeft.current) {
      velocity.current[0] -= right.x * speed * 0.1
      velocity.current[2] -= right.z * speed * 0.1
    }
    if (moveRight.current) {
      velocity.current[0] += right.x * speed * 0.1
      velocity.current[2] += right.z * speed * 0.1
    }

    // 应用移动（无限世界，无边界限制）
    playerPos.current = [px + velocity.current[0], 0, pz + velocity.current[2]]

    // 通知父组件玩家位置和旋转
    onPlayerPositionChange([...playerPos.current] as [number, number, number])
    onPlayerRotationChange(playerRotation.current)

    // 检测是否在移动
    const isMoving = Math.abs(velocity.current[0]) > 0.001 || Math.abs(velocity.current[2]) > 0.001

    // 通知父组件玩家是否在移动
    onMovingChange(isMoving)

    // 根据视角模式设置相机位置
    if (cameraMode === 'first') {
      // 第一人称：眼睛高度
      const time = performance.now() / 1000
      const bobSpeed = 5
      const bobAmount = 0.02

      let cameraY = 1.6
      if (isMoving) {
        cameraY = 1.6 + Math.sin(time * bobSpeed) * bobAmount
      }

      camera.position.set(playerPos.current[0], cameraY, playerPos.current[2])

      // 脚步声 - 根据晃动节奏播放
      if (isMoving) {
        const phase = Math.sin(time * bobSpeed)
        const timeSinceLastStep = time - lastStepTime.current

        if (phase < -0.9 && timeSinceLastStep > stepInterval) {
          playFootstep()
          lastStepTime.current = time
        }
      }
    } else {
      // 第三人称：相机在玩家身后上方
      const thirdPersonDistance = 6
      const thirdPersonHeight = 4

      // 计算相机位置（在玩家身后）
      const offsetX = Math.sin(playerRotation.current) * thirdPersonDistance
      const offsetZ = Math.cos(playerRotation.current) * thirdPersonDistance

      camera.position.set(
        playerPos.current[0] - offsetX,
        playerPos.current[1] + thirdPersonHeight,
        playerPos.current[2] - offsetZ
      )
    }
  })

  // 始终渲染 PointerLockControls，但通过 disabled 来控制是否允许锁定
  // 这样可以避免卸载/重新挂载导致的问题
  return <PointerLockControls ref={controls} args={[camera, gl.domElement]} />
}
