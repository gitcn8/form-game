import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const { login, register, loading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      clearError()

      if (isRegister) {
        const result = await register(email, password)

        // 注册成功，检查是否有 session
        if (result.session) {
          // 有 session，直接进入游戏
          navigate('/game')
        } else {
          // 没有 session，自动尝试登录
          console.log('注册成功但没有 session，尝试自动登录...')
          await login(email, password)
          navigate('/game')
        }
      } else {
        await login(email, password)
        navigate('/game')
      }
    } catch (err: any) {
      // 错误已经在 store 中处理
      console.error('认证失败:', err)

      // 如果是注册时发现用户已存在，自动切换到登录模式
      if (isRegister && err.message?.includes('该邮箱已被注册')) {
        setIsRegister(false)
        clearError()
      }
      // 如果是注册后自动登录失败，给出更友好的提示
      else if (isRegister && err.message?.includes('Invalid login credentials')) {
        alert('注册成功，但自动登录失败。请手动登录。')
        setIsRegister(false)
        clearError()
      }
    }
  }

  const toggleMode = () => {
    setIsRegister(!isRegister)
    clearError()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-6">
          {isRegister ? '注册账号' : '登录'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>

          <button
            type="button"
            onClick={toggleMode}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-green-600 hover:underline"
          >
            返回首页
          </a>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-600">
          <p className="font-medium mb-1">注册提示：</p>
          <p>• 可以使用任意邮箱注册</p>
          <p>• 密码至少6位字符</p>
          <p>• 注册成功后会自动登录并进入游戏</p>
          <p>• 如果自动登录失败，系统会提示您手动登录</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
