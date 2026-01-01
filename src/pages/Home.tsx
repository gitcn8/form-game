function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-800 mb-4">🌾 农场主小游戏</h1>
        <p className="text-xl text-green-700 mb-8">种田、养殖、交友，打造你的梦想农场</p>
        <a
          href="/login"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          开始游戏
        </a>
      </div>
    </div>
  )
}

export default HomePage
