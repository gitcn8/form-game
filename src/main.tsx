import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// PWA Service Worker 注册
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('发现新版本，是否立即更新？')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('应用已准备好离线使用')
  },
  onRegistered(registration) {
    console.log('Service Worker 已注册')
  }
})

// PWA 安装提示组件
function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [showPrompt, setShowPrompt] = React.useState(true) // 始终显示

  React.useEffect(() => {
    const handler = (e: any) => {
      console.log('🎯 beforeinstallprompt 事件触发！', e)
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    console.log('✅ PWA安装提示组件已加载')

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('📱 点击安装按钮，deferredPrompt:', deferredPrompt)

    if (!deferredPrompt) {
      // 手动打开Chrome的安装流程
      alert('💡 手动安装方法：\n\n1. 点击浏览器右上角 ⋮ 菜单\n2. 选择 "应用" 或 "安装应用"\n3. 点击 "安装此站点作为应用"\n\n或者使用Chrome浏览器访问此页面')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log('安装结果:', outcome)

    if (outcome === 'accepted') {
      console.log('✅ PWA安装成功！')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '300px'
    }}>
      <div style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
        🎮 安装到桌面
      </div>
      <div style={{ marginBottom: '16px', fontSize: '14px', opacity: 0.9 }}>
        将农场游戏安装到桌面，像APP一样玩！
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          立即安装
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          取消
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PWAInstallPrompt />
    <App />
  </React.StrictMode>,
)
