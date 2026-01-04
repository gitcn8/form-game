function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-800 mb-4">🌾 农场主小游戏</h1>
        <p className="text-xl text-green-700 mb-8">种田、养殖、交友，打造你的梦想农场</p>
        <div className="space-y-4">
          <a
            href="/login"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            开始游戏
          </a>
          <br />
          <a
            href="/test3d"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
          >
            🎮 3D测试页面
          </a>
          <br />
          <a
            href="/setup"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
          >
            ⚙️ 数据库设置
          </a>
          <br />
          <a
            href="/test"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
          >
            🧪 测试认证
          </a>
        </div>
      </div>
    </div>
  )
}

export default HomePage
