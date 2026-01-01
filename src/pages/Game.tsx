function GamePage() {
  return (
    <div className="h-screen w-screen bg-gray-900">
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
        <p>💰 金币: 1000</p>
        <p>⚡ 体力: 100/100</p>
        <p>📅 第1天 春季</p>
      </div>

      <div className="flex items-center justify-center h-full">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">🌾 农场</h2>
          <p className="text-lg mb-4">游戏加载中...</p>
          <p className="text-sm text-gray-400">Phaser 游戏引擎准备中</p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
        <p>工具: 锄头 💱</p>
      </div>
    </div>
  )
}

export default GamePage
