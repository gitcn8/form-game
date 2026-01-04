import { useState } from 'react'

interface CharacterConfig {
  templateId: string
  hairColor: string
  clothesColor: string
  hatColor: string
  hasHat: boolean
  hasBow: boolean
}

interface CharacterCustomizationProps {
  onApply: (config: CharacterConfig) => void
  onClose: () => void
}

function CharacterCustomization({ onApply, onClose }: CharacterCustomizationProps) {
  const [config, setConfig] = useState<CharacterConfig>({
    templateId: 'girl_farm',
    hairColor: '#8b4513',
    clothesColor: '#ffb6c1',
    hatColor: '#ffe4e1',
    hasHat: true,
    hasBow: true
  })

  const templates = [
    { id: 'girl_farm', name: '农场女孩', icon: '👧' },
    { id: 'boy_farm', name: '农场男孩', icon: '👦' },
    { id: 'girl_casual', name: '休闲女孩', icon: '👩' },
    { id: 'boy_casual', name: '休闲男孩', icon: '👨' }
  ]

  const hairColors = [
    { name: '棕色', value: '#8b4513' },
    { name: '黑色', value: '#2c2c2c' },
    { name: '金色', value: '#ffd700' },
    { name: '粉色', value: '#ff69b4' },
    { name: '蓝色', value: '#4169e1' }
  ]

  const clothesColors = [
    { name: '粉色', value: '#ffb6c1' },
    { name: '蓝色', value: '#87ceeb' },
    { name: '绿色', value: '#90ee90' },
    { name: '黄色', value: '#ffd700' },
    { name: '紫色', value: '#ddaed8' }
  ]

  const handleSave = () => {
    // 保存到localStorage
    localStorage.setItem('characterConfig', JSON.stringify(config))
    onApply(config)
    alert('✅ 角色已保存！')
    onClose()
  }

  const handleReset = () => {
    setConfig({
      templateId: 'girl_farm',
      hairColor: '#8b4513',
      clothesColor: '#ffb6c1',
      hatColor: '#ffe4e1',
      hasHat: true,
      hasBow: true
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 标题 */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🎨 角色定制</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-sm mt-1">打造属于你的独特角色！</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧：选项 */}
            <div className="space-y-6">
              {/* 模板选择 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">📋 选择模板</h3>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setConfig({ ...config, templateId: template.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        config.templateId === template.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="text-3xl mb-1">{template.icon}</div>
                      <div className="text-sm font-medium">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 发型颜色 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">💇 头发颜色</h3>
                <div className="flex flex-wrap gap-2">
                  {hairColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setConfig({ ...config, hairColor: color.value })}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        config.hairColor === color.value
                          ? 'border-pink-500 scale-110'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* 衣服颜色 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">👕 衣服颜色</h3>
                <div className="flex flex-wrap gap-2">
                  {clothesColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setConfig({ ...config, clothesColor: color.value })}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        config.clothesColor === color.value
                          ? 'border-pink-500 scale-110'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* 配饰 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">🎀 配饰</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 bg-white rounded hover:bg-pink-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hasHat}
                      onChange={(e) => setConfig({ ...config, hasHat: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-2xl">👒</span>
                    <span>遮阳帽</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 bg-white rounded hover:bg-pink-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hasBow}
                      onChange={(e) => setConfig({ ...config, hasBow: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-2xl">🎀</span>
                    <span>蝴蝶结</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 右侧：预览 */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 p-6 rounded-lg">
                <h3 className="font-bold mb-4 text-center">👁️ 实时预览</h3>

                {/* 预览区域 */}
                <div className="bg-white rounded-lg p-8 shadow-inner">
                  <div className="flex flex-col items-center">
                    {/* 简单的CSS角色预览 */}
                    <div className="relative" style={{ width: '100px', height: '150px' }}>
                      {/* 帽子 */}
                      {config.hasHat && (
                        <div
                          className="absolute top-0 left-1/2 transform -translate-x-1/2"
                          style={{
                            width: '80px',
                            height: '20px',
                            backgroundColor: config.hatColor,
                            borderRadius: '50%',
                            border: '3px solid #ff69b4'
                          }}
                        />
                      )}

                      {/* 头 */}
                      <div
                        className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full"
                        style={{ backgroundColor: '#ffdbac' }}
                      />

                      {/* 头发 */}
                      <div
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full"
                        style={{ backgroundColor: config.hairColor }}
                      />

                      {/* 身体 */}
                      <div
                        className="absolute top-16 left-1/2 transform -translate-x-1/2"
                        style={{
                          width: '0',
                          height: '0',
                          borderLeft: '30px solid transparent',
                          borderRight: '30px solid transparent',
                          borderTop: `60px solid ${config.clothesColor}`
                        }}
                      />

                      {/* 蝴蝶结 */}
                      {config.hasBow && (
                        <div
                          className="absolute top-20 left-1/2 transform -translate-x-1/2 w-6 h-4 rounded-full"
                          style={{ backgroundColor: '#ff69b4' }}
                        />
                      )}
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-600">
                      <p>模板: {templates.find(t => t.id === config.templateId)?.name}</p>
                      <p>配饰: {[
                        config.hasHat && '帽子',
                        config.hasBow && '蝴蝶结'
                      ].filter(Boolean).join(' + ') || '无'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  ✅ 应用角色
                </button>
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition-all"
                >
                  🔄 重置
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-6 rounded-lg transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterCustomization
