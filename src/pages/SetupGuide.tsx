import { useState } from 'react'
import { supabase } from '../lib/supabase'

function SetupGuidePage() {
  const [copied, setCopied] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  // SQL 脚本
  const sqlScript = `-- ============================================================
-- 农场主小游戏 - 数据库表创建
-- 请将此 SQL 复制到 Supabase SQL Editor 中执行
-- ============================================================

-- 1. 游戏存档表
CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  save_name TEXT DEFAULT '主存档',
  game_state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_game_saves_is_active ON game_saves(is_active);

ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的存档"
ON game_saves FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的存档"
ON game_saves FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的存档"
ON game_saves FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的存档"
ON game_saves FOR DELETE
USING (auth.uid() = user_id);

-- 2. 玩家统计表
CREATE TABLE player_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_days INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  crops_harvested INTEGER DEFAULT 0,
  animals_owned INTEGER DEFAULT 0,
  quests_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的统计"
ON player_stats FOR ALL
USING (auth.uid() = user_id);

-- 3. 排行榜表（后期扩展）
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboards_category ON leaderboards(category);
CREATE INDEX idx_leaderboards_score ON leaderboards(score DESC);

ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可以查看排行榜"
ON leaderboards FOR SELECT
USING (true);

CREATE POLICY "用户只能创建自己的记录"
ON leaderboards FOR INSERT
WITH CHECK (auth.uid() = user_id);`

  const copySQL = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const testDatabase = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      // 测试 game_saves 表
      const { data: savesData, error: savesError } = await supabase
        .from('game_saves')
        .select('*')
        .limit(1)

      // 测试 player_stats 表
      const { data: statsData, error: statsError } = await supabase
        .from('player_stats')
        .select('*')
        .limit(1)

      // 测试 leaderboards 表
      const { data: leaderData, error: leaderError } = await supabase
        .from('leaderboards')
        .select('*')
        .limit(1)

      const tables = [
        { name: 'game_saves', error: savesError, exists: !savesError || savesError.code !== '42P01' },
        { name: 'player_stats', error: statsError, exists: !statsError || statsError.code !== '42P01' },
        { name: 'leaderboards', error: leaderError, exists: !leaderError || leaderError.code !== '42P01' }
      ]

      const allExist = tables.every(t => t.exists)

      setTestResult({
        success: allExist,
        tables
      })

    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message
      })
    } finally {
      setTesting(false)
    }
  }

  const openSupabaseSQLEditor = () => {
    window.open('https://supabase.com/dashboard/project/xitkpphkffxysouffchy/sql/new', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-2">🗄️ 数据库设置</h1>
        <p className="text-center text-gray-600 mb-8">一次性设置，永久使用</p>

        {/* 测试区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">📊 步骤 1：检查数据库状态</h2>
          <p className="text-gray-600 mb-4">点击按钮检查数据库表是否已创建</p>

          <button
            onClick={testDatabase}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg"
          >
            {testing ? '🔄 检查中...' : '🧪 测试连接'}
          </button>

          {testResult && (
            <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              {testResult.success ? (
                <>
                  <h3 className="font-bold text-green-800 mb-2">✅ 所有表已创建成功！</h3>
                  <ul className="list-disc list-inside text-sm">
                    {testResult.tables.map((table: any) => (
                      <li key={table.name} className="text-green-700">
                        ✅ {table.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-green-700">🎉 可以开始游戏了！</p>
                  <a
                    href="/game"
                    className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    进入游戏 →
                  </a>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-yellow-800 mb-2">⚠️ 数据库表尚未创建</h3>
                  {testResult.tables && (
                    <ul className="list-disc list-inside text-sm">
                      {testResult.tables.map((table: any) => (
                        <li key={table.name} className={table.exists ? 'text-green-700' : 'text-red-700'}>
                          {table.exists ? '✅' : '❌'} {table.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-yellow-700">请按照下面的步骤创建数据库表</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* 复制 SQL 区域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">📋 步骤 2：获取 SQL 脚本</h2>

          <div className="flex gap-4 mb-4">
            <button
              onClick={copySQL}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              {copied ? '✅ 已复制！' : '📋 复制 SQL'}
            </button>

            <button
              onClick={openSupabaseSQLEditor}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              🔗 打开 Supabase SQL Editor
            </button>
          </div>

          {copied && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mb-4">
              ✅ SQL 已复制到剪贴板！现在可以在 Supabase SQL Editor 中粘贴（Ctrl+V）
            </div>
          )}

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">{sqlScript}</pre>
          </div>
        </div>

        {/* 详细步骤 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📖 步骤 3：在 Supabase 中执行 SQL</h2>

          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">点击上方</span>
              <button
                onClick={openSupabaseSQLEditor}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded text-sm font-medium"
              >
                🔗 打开 Supabase SQL Editor
              </button>
              <span>（或手动访问 Dashboard）</span>
            </li>

            <li>在左侧菜单点击 <strong>SQL Editor</strong>（图标：📊）</li>

            <li>点击 <strong>"New query"</strong> 按钮</li>

            <li>在打开的编辑器中，按 <strong>Ctrl+V</strong> 粘贴 SQL</li>

            <li>点击右下角的 <strong>"Run"</strong> ▶️ 按钮执行</li>

            <li>看到绿色 "Success" 提示后，返回此页面</li>

            <li>再次点击上方的 <strong>"🧪 测试连接"</strong> 按钮验证</li>
          </ol>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-bold text-blue-800 mb-2">💡 提示</p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>整个过程只需 2 分钟</li>
              <li>只需要执行一次（永久生效）</li>
              <li>如果遇到错误，请把错误信息发给我</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}

export default SetupGuidePage
