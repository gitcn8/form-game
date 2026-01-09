import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { getBlockAt, getMiningTime, getBlockDrop } from './OreGenerator'

interface MiningSystemProps {
  playerPosition: [number, number, number]
  isLocked: boolean
  onBlockMined: (position: [number, number, number], blockType: string, dropItem: string | null) => void
  onMiningProgressChange: (progress: number, targetBlock: string, isVisible: boolean) => void
  onTargetBlockChange?: (targetBlock: string | null) => void  // 新增：瞄准的方块变化回调
}

/**
 * 挖矿系统
 * 处理右键长按挖掘、键盘快捷键挖掘、挖掘进度计算、方块移除
 *
 * 支持两种挖掘方式：
 * 1. 右键长按挖掘（鼠标玩家）
 * 2. 空格键长按挖掘（键盘玩家）
 */
export function MiningSystem({
  playerPosition,
  isLocked,
  onBlockMined,
  onMiningProgressChange,
  onTargetBlockChange
}: MiningSystemProps) {
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const miningState = useRef({
    isMining: false,
    targetBlock: null as { position: [number, number, number]; blockType: string } | null,
    progress: 0,
    startTime: 0,
    miningTime: 0
  })

  // 跟踪当前瞄准的方块（用于高亮显示）
  const currentTargetBlock = useRef<string | null>(null)

  // 监听右键长按和空格键长按
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // 右键（button 2）
      console.log('🖱️ Mouse down:', e.button, 'isLocked:', isLocked)
      if (e.button === 2 && isLocked) {
        e.preventDefault()
        startMining()
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        stopMining()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 空格键开始挖掘（只在游戏锁定状态下）
      console.log('⌨️ Key down:', e.code, 'isLocked:', isLocked, 'isMining:', miningState.current.isMining)
      if (e.code === 'Space' && isLocked && !miningState.current.isMining) {
        e.preventDefault()
        console.log('✅ Starting mining!')
        startMining()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // 空格键停止挖掘
      if (e.code === 'Space') {
        console.log('⏹️ Stopping mining')
        stopMining()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isLocked])

  /**
   * 开始挖掘
   */
  const startMining = () => {
    console.log('⛏️ startMining called')

    // 从相机发射射线
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)

    // 获取场景中的所有对象
    const allObjects: THREE.Object3D[] = []

    // 递归收集场景中的所有对象
    scene.traverse((child: THREE.Object3D) => {
      if (child.isMesh) {
        allObjects.push(child)
      }
    })

    console.log('🔍 Scene objects found:', allObjects.length)

    // 射线检测
    const intersects = raycaster.current.intersectObjects(allObjects, false)

    console.log('🎯 Raycast results:', intersects.length, 'objects hit')
    if (intersects.length > 0) {
      console.log('📍 First hit:', {
        distance: intersects[0].distance,
        point: intersects[0].point,
        object: intersects[0].object?.uuid,
        objectType: intersects[0].object?.type,
        objectGeometry: intersects[0].object?.geometry?.type
      })

      // 输出所有击中的对象
      for (let i = 0; i < Math.min(3, intersects.length); i++) {
        console.log(`  Hit ${i + 1}:`, {
          distance: intersects[i].distance,
          geometry: intersects[i].object?.geometry?.type
        })
      }
    }

    if (intersects.length > 0) {
      const hit = intersects[0]
      if (hit.distance <= 8) { // 增加距离限制到8
        // 获取击中的方块位置
        const point = hit.point
        const x = Math.round(point.x - hit.face.normal.x * 0.5)
        const y = Math.round(point.y - hit.face.normal.y * 0.5)
        const z = Math.round(point.z - hit.face.normal.z * 0.5)

        console.log('📦 Block position:', { x, y, z })

        // 获取方块类型
        const blockType = getBlockAt(x, y, z)
        console.log('🔨 Block type:', blockType)

        // 检查是否可挖掘（基岩不可挖掘）
        if (blockType === 'BEDROCK') {
          console.log('❌ Bedrock - cannot mine')
          return
        }

        if (blockType === 'AIR') {
          console.log('❌ Air - nothing to mine')
          return
        }

        // 计算挖掘时间
        const miningTime = getMiningTime(blockType, 'pickaxe') // 假设玩家有镐子
        console.log('⏱️ Mining time:', miningTime, 'seconds')

        // 开始挖掘
        miningState.current = {
          isMining: true,
          targetBlock: { position: [x, y, z] as [number, number, number], blockType },
          progress: 0,
          startTime: Date.now(),
          miningTime
        }

        onMiningProgressChange(0, blockType, true)

        console.log('✅ Mining started for:', blockType)
      } else {
        console.log('❌ Too far:', hit.distance)
      }
    } else {
      console.log('❌ No objects hit by raycast')
    }
  }

  /**
   * 停止挖掘
   */
  const stopMining = () => {
    if (!miningState.current.isMining) return

    // 重置挖掘状态
    miningState.current.isMining = false
    miningState.current.targetBlock = null
    miningState.current.progress = 0

    onMiningProgressChange(0, '', false)
  }

  /**
   * 完成挖掘
   */
  const completeMining = () => {
    const { targetBlock } = miningState.current
    if (!targetBlock) return

    // 获取掉落物品
    const dropItem = getBlockDrop(targetBlock.blockType)

    // 调用回调函数
    onBlockMined(targetBlock.position, targetBlock.blockType, dropItem)

    // 重置状态
    miningState.current.isMining = false
    miningState.current.targetBlock = null
    miningState.current.progress = 0

    onMiningProgressChange(0, '', false)
  }

  // 更新挖掘进度 + 持续跟踪瞄准的方块
  useFrame(() => {
    // 持续跟踪瞄准的方块（即使不在挖掘状态）
    if (isLocked) {
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)

      const allObjects: THREE.Object3D[] = []
      scene.traverse((child: THREE.Object3D) => {
        if (child.isMesh) allObjects.push(child)
      })

      const intersects = raycaster.current.intersectObjects(allObjects, false)

      if (intersects.length > 0 && intersects[0].distance <= 8) {
        const hit = intersects[0]
        const point = hit.point
        const x = Math.round(point.x - hit.face.normal.x * 0.5)
        const y = Math.round(point.y - hit.face.normal.y * 0.5)
        const z = Math.round(point.z - hit.face.normal.z * 0.5)

        const blockKey = `${x},${y},${z}`

        // 如果瞄准的方块变化了，通知父组件
        if (currentTargetBlock.current !== blockKey) {
          currentTargetBlock.current = blockKey
          onTargetBlockChange?.(blockKey)
        }
      } else {
        // 没有瞄准任何方块
        if (currentTargetBlock.current !== null) {
          currentTargetBlock.current = null
          onTargetBlockChange?.(null)
        }
      }
    }

    // 更新挖掘进度
    if (!miningState.current.isMining || !miningState.current.targetBlock) {
      return
    }

    const now = Date.now()
    const elapsed = (now - miningState.current.startTime) / 1000 // 秒
    const progress = Math.min((elapsed / miningState.current.miningTime) * 100, 100)

    miningState.current.progress = progress

    onMiningProgressChange(progress, miningState.current.targetBlock.blockType, true)

    // 检查是否完成
    if (progress >= 100) {
      completeMining()
    }
  })

  return null
}
