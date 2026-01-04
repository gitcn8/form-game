import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import { saveGameState, loadGameState } from '../lib/supabase'
import PhaserGame from '../components/game/PhaserGame'
import FarmScene3D from '../components/game/FarmScene3D'
import CharacterCustomization from '../components/character/CharacterCustomization'

interface CharacterConfig {
  templateId: string
  hairColor: string
  clothesColor: string
  hatColor: string
  hasHat: boolean
  hasBow: boolean
}

function GamePage() {
  const { user, logout } = useAuthStore()
  const { player, world } = useGameStore()
  const [saveStatus, setSaveStatus] = useState<string>('')
  const [loadStatus, setLoadStatus] = useState<string>('')
  const [showCharacterCustom, setShowCharacterCustom] = useState(false)
  const [use3D, setUse3D] = useState(true) // 默认使用3D
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>({
    templateId: 'girl_farm',
    hairColor: '#8b4513',
    clothesColor: '#ffb6c1',
    hatColor: '#ffe4e1',
    hasHat: true,
    hasBow: true
  })

  // 加载保存的角色配置
  useEffect(() => {
    const saved = localStorage.getItem('characterConfig')
    if (saved) {
      try {
        setCharacterConfig(JSON.parse(saved))
      } catch (e) {
        console.error('加载角色配置失败:', e)
      }
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const testSave = async () => {
    if (!user) return

    try {
      setSaveStatus('保存中...')
      const gameState = useGameStore.getState()
      await saveGameState(user.id, gameState, '测试存档')
      setSaveStatus('✅ 存档成功！')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error: any) {
      setSaveStatus(`❌ 保存失败: ${error.message}`)
    }
  }

  const testLoad = async () => {
    if (!user) return

    try {
      setLoadStatus('加载中...')
      const data = await loadGameState(user.id)

      if (data) {
        useGameStore.getState().loadGame(data.game_state)
        setLoadStatus(`✅ 加载成功！游戏天数: ${data.game_state?.world?.day || 1}`)
      } else {
        setLoadStatus('⚠️ 没有找到存档')
      }

      setTimeout(() => setLoadStatus(''), 3000)
    } catch (error: any) {
      setLoadStatus(`❌ 加载失败: ${error.message}`)
    }
  }

  const handleApplyCharacter = (config: CharacterConfig) => {
    setCharacterConfig(config)
    console.log('应用角色配置:', config)
    window.location.reload()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">未登录</h1>
          <a href="/login" className="text-blue-600 hover:underline mt-4 inline-block">
            去登录
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-green-100 to-blue-100">
      {/* 全屏游戏 */}
      {use3D ? <FarmScene3D /> : <PhaserGame />}

      {/* 顶部玩家状态条（仅3D模式下显示，位置调高以避开农场标题栏） */}
      {use3D && (
        <div className="fixed top-16 left-0 right-0 z-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-2xl p-4 border-2 border-yellow-400">
              <div className="flex justify-between items-center">
                {/* 金币 */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-yellow-300">
                  <span className="text-3xl">💰</span>
                  <div>
                    <div className="text-xs text-yellow-700 font-semibold">金币</div>
                    <div className="text-xl font-bold text-yellow-900">{player.gold}</div>
                  </div>
                </div>

                {/* 体力 */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300 flex-1 max-w-md mx-4">
                  <span className="text-3xl">⚡</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-700 font-semibold">体力</span>
                      <span className="text-sm font-bold text-green-900">{player.energy}/{player.maxEnergy}</span>
                    </div>
                    <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-300 ${
                          player.energy > 50 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          player.energy > 20 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 日期和季节 */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-300">
                  <span className="text-3xl">📅</span>
                  <div>
                    <div className="text-xs text-blue-700 font-semibold">时间</div>
                    <div className="text-lg font-bold text-blue-900">第{world.day}天 {world.season}</div>
                  </div>
                </div>

                {/* 功能按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      useGameStore.getState().nextDay()
                      alert(`😴 你睡了一觉！\n\n现在是第 ${useGameStore.getState().world.day} 天\n体力已恢复！`)
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg border-2 border-purple-400"
                    title="结束今天，恢复体力"
                  >
                    🌙 睡觉
                  </button>
                  <button
                    onClick={() => setUse3D(!use3D)}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg border-2 border-blue-400"
                    title="切换2D/3D视图"
                  >
                    {use3D ? '🎮 2D' : '🎮 3D'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2D模式下的HUD */}
      {!use3D && (
        <>
          <div className="fixed top-0 left-0 right-0 z-10 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4">
              <div className="flex gap-6 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="font-bold text-gray-700">{player.gold}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700 text-sm">体力</span>
                      <span className="font-bold text-gray-700">{player.energy}/{player.maxEnergy}</span>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          player.energy > 50 ? 'bg-green-500' :
                          player.energy > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  <span className="font-bold text-gray-700">第{world.day}天 {world.season}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setUse3D(!use3D)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  {use3D ? '🔄 2D' : '🔄 3D'}
                </button>
                <button
                  onClick={() => {
                    useGameStore.getState().nextDay()
                    alert(`😴 你睡了一觉！\n\n现在是第 ${useGameStore.getState().world.day} 天\n体力已恢复！`)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-indigo-600 transition-all"
                >
                  🌙 睡觉
                </button>
                <span className="text-gray-600 text-sm">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  登出
                </button>
              </div>
            </div>
          </div>

          <div className="fixed bottom-4 right-4 z-10">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-2">
              <button
                onClick={testSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-bold"
              >
                💾 保存
              </button>
              <button
                onClick={testLoad}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-bold"
              >
                📂 加载
              </button>
            </div>
            {saveStatus && (
              <div className="mt-2 text-sm text-green-600 bg-white bg-opacity-90 px-3 py-1 rounded">{saveStatus}</div>
            )}
            {loadStatus && (
              <div className="mt-2 text-sm text-blue-600 bg-white bg-opacity-90 px-3 py-1 rounded">{loadStatus}</div>
            )}
          </div>
        </>
      )}

      {/* 角色定制模态框 */}
      {showCharacterCustom && (
        <CharacterCustomization
          onApply={handleApplyCharacter}
          onClose={() => setShowCharacterCustom(false)}
        />
      )}
    </div>
  )
}

export default GamePage
