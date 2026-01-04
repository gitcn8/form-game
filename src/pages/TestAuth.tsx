import { useState } from 'react'
import { supabase } from '../lib/supabase'

function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSignUp = async () => {
    try {
      console.log('开始注册...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('注册返回:', { data, error })

      setResult({
        type: 'signUp',
        success: !error,
        data,
        error: error?.message
      })
    } catch (err: any) {
      console.error('注册异常:', err)
      setResult({
        type: 'signUp',
        success: false,
        error: err.message
      })
    }
  }

  const handleSignIn = async () => {
    try {
      console.log('开始登录...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('登录返回:', { data, error })

      setResult({
        type: 'signIn',
        success: !error,
        data,
        error: error?.message
      })
    } catch (err: any) {
      console.error('登录异常:', err)
      setResult({
        type: 'signIn',
        success: false,
        error: err.message
      })
    }
  }

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      console.log('当前会话:', data)
      setResult({
        type: 'session',
        success: true,
        data: data.session
      })
    } catch (err: any) {
      console.error('获取会话失败:', err)
      setResult({
        type: 'session',
        success: false,
        error: err.message
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🧪 Supabase 认证测试</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">1. 输入信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="123456"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleSignUp}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            注册
          </button>
          <button
            onClick={handleSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            登录
          </button>
          <button
            onClick={checkSession}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            检查会话
          </button>
        </div>

        {result && (
          <div className="bg-gray-800 text-green-400 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">结果</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h3 className="font-semibold mb-2">测试步骤：</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>输入一个新邮箱（如：abc123@test.com）</li>
            <li>点击"注册"</li>
            <li>查看结果（如果有 session，说明成功）</li>
            <li>如果没有 session，点击"登录"</li>
            <li>查看结果</li>
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

export default TestAuthPage
