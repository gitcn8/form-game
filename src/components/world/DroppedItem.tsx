interface DroppedItemProps {
  item: {
    type: 'carrot' | 'wheat' | 'potato' | 'tomato' | 'pumpkin' | 'dirt' | 'stone' | 'coal' | 'iron_ore' | 'gold_ore' | 'diamond'
    position: [number, number, number]
    count: number
  }
}

/**
 * 掉落物品组件
 * 显示掉落在地上的物品（如作物、矿石、材料）
 */
export function DroppedItem({ item }: DroppedItemProps) {
  // 物品配置
  const itemConfig: Record<string, { color: string; size: [number, number, number]; shape: 'box' | 'cylinder' | 'sphere' | 'carrot' | 'wheat' | 'potato' | 'tomato' | 'pumpkin' }> = {
    // 作物类
    carrot: { color: '#FF8C00', size: [0.08, 0.25, 0.08], shape: 'carrot' }, // 胡萝卜
    wheat: { color: '#FFD700', size: [0.15, 0.35, 0.15], shape: 'wheat' }, // 小麦穗
    potato: { color: '#DAA520', size: [0.18, 0.12, 0.25], shape: 'potato' }, // 土豆（椭圆）
    tomato: { color: '#FF6347', size: [0.15, 0.15, 0.15], shape: 'tomato' }, // 番茄（圆形）
    pumpkin: { color: '#FF8C00', size: [0.35, 0.25, 0.35], shape: 'pumpkin' }, // 南瓜（扁圆）

    // 矿物类
    dirt: { color: '#8B6914', size: [0.2, 0.2, 0.2], shape: 'box' },
    stone: { color: '#808080', size: [0.25, 0.25, 0.25], shape: 'box' },
    coal: { color: '#2C2C2C', size: [0.2, 0.2, 0.2], shape: 'box' },
    iron_ore: { color: '#A0522D', size: [0.2, 0.2, 0.2], shape: 'box' },
    gold_ore: { color: '#FFD700', size: [0.2, 0.2, 0.2], shape: 'box' },
    diamond: { color: '#00CED1', size: [0.15, 0.15, 0.15], shape: 'sphere' }
  }

  const config = itemConfig[item.type]
  if (!config) return null

  return (
    <group position={item.position}>
      {/* 主物品模型 */}
      {config.shape === 'box' && (
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={config.size} />
          <meshStandardMaterial color={config.color} />
        </mesh>
      )}
      {config.shape === 'cylinder' && (
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[config.size[0], config.size[1], config.size[2], 8]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
      )}
      {config.shape === 'sphere' && (
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[config.size[0] / 2, 16, 16]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
      )}
      {config.shape === 'carrot' && (
        // 胡萝卜：圆锥形状 + 绿色叶缨
        <group>
          {/* 胡萝卜主体（橙色圆锥）- 尖端朝下 */}
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI]} castShadow>
            <coneGeometry args={[config.size[0], config.size[1], 8]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* 绿色叶缨 - 在胡萝卜粗头上方 */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <coneGeometry args={[config.size[0] * 0.8, config.size[0] * 1.5, 4]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      )}

      {config.shape === 'wheat' && (
        // 小麦：多个金黄色的籽粒
        <group>
          {/* 小麦主茎 */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
          {/* 小麦穗（顶部多个小椭圆） */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          <mesh position={[0.03, 0.30, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          <mesh position={[-0.03, 0.30, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
        </group>
      )}

      {config.shape === 'potato' && (
        // 土豆：不规则的椭圆土豆
        <mesh position={[0, 0.06, 0]} rotation={[0.2, 0, 0]} castShadow>
          <sphereGeometry args={[config.size[0], config.size[1], config.size[2], 12, 12]} />
          <meshStandardMaterial color={config.color} roughness={0.9} />
        </mesh>
      )}

      {config.shape === 'tomato' && (
        // 番茄：红色圆形 + 绿色果蒂
        <group>
          {/* 番茄主体 */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[config.size[0], 16, 16]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* 绿色果蒂 */}
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.03, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      )}

      {config.shape === 'pumpkin' && (
        // 南瓜：扁圆形 + 橙色条纹
        <group>
          {/* 南瓜主体（扁球体） */}
          <mesh position={[0, 0.13, 0]} castShadow>
            <sphereGeometry args={[config.size[0], config.size[1], config.size[2], 16, 12]} />
            <meshStandardMaterial color={config.color} roughness={0.7} />
          </mesh>
          {/* 南瓜蒂 */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.025, 0.05, 6]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* 橙色条纹（装饰） */}
          <mesh position={[0, 0.13, 0.05]} rotation={[0.5, 0, 0]} castShadow>
            <torusGeometry args={[0.15, 0.01, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#FF6600" />
          </mesh>
        </group>
      )}

      {/* 数量标签 */}
      {item.count > 1 && (
        <mesh position={[0.1, 0.2, 0]}>
          <planeGeometry args={[0.2, 0.1]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}
