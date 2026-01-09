import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

interface GroundClickHandlerProps {
  onGroundClick: (position: [number, number, number]) => void
  isLocked?: boolean  // 新增：鼠标锁定状态
}

/**
 * 地面点击检测组件（射线检测）
 * 将屏幕中心的射线投射到地面，获取点击位置
 */
export function GroundClickHandler({ onGroundClick, isLocked }: GroundClickHandlerProps) {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  useEffect(() => {
    const handleClick = (_event: MouseEvent) => {
      // 只有在鼠标锁定时才处理点击
      if (!isLocked) return

      // 计算鼠标位置（归一化到-1到1）
      mouse.current.x = 0 // 准心在屏幕中心
      mouse.current.y = 0

      // 从相机发射射线
      raycaster.current.setFromCamera(mouse.current, camera)

      // 创建地平面
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

      // 检测射线与地面的交点
      const intersectPoint = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(groundPlane, intersectPoint)

      if (intersectPoint) {
        // 限制在草地范围内（-50到50）
        const x = Math.max(-50, Math.min(50, intersectPoint.x))
        const z = Math.max(-50, Math.min(50, intersectPoint.z))

        onGroundClick([x, 0, z])
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, onGroundClick, isLocked])

  return null
}
