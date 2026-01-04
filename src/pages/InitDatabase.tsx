import { useState } from 'react'
import { supabase } from '../lib/supabase'

function InitDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  const initDatabase = async () => {
    setLoading(true)
    setError(null)
    setLogs([])
    addLog('🚀 开始初始化数据库...')

    try {
      // 检查表是否已存在
      addLog('📊 检查现有表...')

      const { data: existingTables, error: checkError } = await supabase
        .rpc('get_existing_tables')

      if (checkError) {
        // 如果函数不存在，继续创建
        addLog('⚠️  检查函数不存在，继续创建表...')
      }

      // 创建 game_saves 表
      addLog('📝 创建 game_saves 表...')

      const createGameSavesSQL = `
        CREATE TABLE IF NOT EXISTS game_saves (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          save_name TEXT DEFAULT '主存档',
          game_state JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
        );

        CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON game_saves(user_id);
        CREATE INDEX IF NOT EXISTS idx_game_saves_is_active ON game_saves(is_active);

        ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "用户只能查看自己的存档" ON game_saves;
        CREATE POLICY "用户只能查看自己的存档"
        ON game_saves FOR SELECT
        USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "用户只能创建自己的存档" ON game_saves;
        CREATE POLICY "用户只能创建自己的存档"
        ON game_saves FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "用户只能更新自己的存档" ON game_saves;
        CREATE POLICY "用户只能更新自己的存档"
        ON game_saves FOR UPDATE
        USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "用户只能删除自己的存档" ON game_saves;
        CREATE POLICY "用户只能删除自己的存档"
        ON game_saves FOR DELETE
        USING (auth.uid() = user_id);
      `

      // 注意：直接通过 JS 客户端执行 DDL 是有限制的
      // 我们需要使用一个 workaround
      addLog('⚠️  Supabase JS 客户端不支持直接执行 DDL 语句')
      addLog('📖 请使用以下方法之一：')

      setError(`
        方案1（推荐）：在 Supabase Dashboard 执行 SQL
        1. 打开 https://supabase.com/dashboard
        2. 选择项目 → SQL Editor → New query
        3. 复制 supabase/migrations/001_create_tables.sql 的内容
        4. 粘贴并点击 Run

        方案2：使用 Supabase CLI（需要安装）
        supabase db push

        方案3：手动在 Table Editor 创建表
      `)

      addLog('❌ 无法通过 JS 客户端直接创建表')
      addLog('💡 请参考上方的错误提示进行操作')

    } catch (err: any) {
      addLog(`❌ 错误: ${err.message}`)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setLogs([])
    addLog('🔗 测试数据库连接...')

    try {
      // 测试连接：尝试查询当前用户
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) throw userError

      addLog(`✅ 认证系统正常`)
      addLog(`📧 当前用户: ${user?.email || '未登录'}`)

      // 测试数据库连接
      const { data, error } = await supabase
        .from('game_saves')
        .select('*')
        .limit(1)

      if (error) {
        if (error.code === '42P01') {
          addLog('⚠️  表 game_saves 不存在，需要先创建')
        } else {
          throw error
        }
      } else {
        addLog('✅ 数据库连接正常')
        addLog(`📊 game_saves 表已存在`)
      }

    } catch (err: any) {
      addLog(`❌ 连接失败: ${err.message}`)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🗄️ 数据库初始化</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>

          <div className="space-x-4 mb-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              🧪 测试连接
            </button>

            <button
              onClick={initDatabase}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              🚀 初始化数据库
            </button>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">⚠️ 重要提示</h3>
              <pre className="text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {logs.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">📋 执行日志</h3>
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h3 className="font-semibold mb-2">📖 手动创建表步骤：</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>访问 Supabase Dashboard: <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 hover:underline">https://supabase.com/dashboard</a></li>
            <li>选择项目: <strong>xitkpphkffxysouffchy</strong></li>
            <li>点击左侧菜单的 <strong>SQL Editor</strong></li>
            <li>点击 <strong>New query</strong> 按钮</li>
              <li>复制文件 <code className="bg-gray-200 px-1 rounded">supabase/migrations/001_create_tables.sql</code> 的内容</li>
            <li>粘贴到编辑器中，点击 <strong>Run</strong> 按钮</li>
            <li>返回此页面，点击 <strong>测试连接</strong> 验证</li>
          </ol>
        </div>

        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:underline">
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}

export default InitDatabasePage
