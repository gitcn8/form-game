import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase, signIn, signUp, signOut } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const result = await signIn(email, password)

      console.log('登录结果:', result)

      // 检查 result 是否存在
      if (!result || !result.user) {
        throw new Error('登录失败：未返回用户信息')
      }

      // 设置用户信息
      set({
        user: result.user,
        session: result.session,
        loading: false,
        error: null
      })
    } catch (error: any) {
      console.error('登录失败:', error)
      set({
        error: error.message || '登录失败',
        loading: false
      })
      throw error
    }
  },

  register: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const result = await signUp(email, password)

      // 打印调试信息
      console.log('注册结果:', result)

      // 检查 result 是否存在
      if (!result || !result.user) {
        throw new Error('注册失败：未返回用户信息')
      }

      // 设置用户信息
      set({
        user: result.user,
        session: result.session || null,
        loading: false,
        error: null
      })

      return result
    } catch (error: any) {
      console.error('注册失败:', error)

      // 如果用户已存在，提供更友好的错误信息
      if (error.message?.includes('User already registered')) {
        set({
          error: '该邮箱已被注册，请直接登录',
          loading: false
        })
        throw new Error('该邮箱已被注册，请直接登录')
      }

      set({
        error: error.message || '注册失败',
        loading: false
      })
      throw error
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      await signOut()
      set({
        user: null,
        session: null,
        loading: false,
        error: null
      })
    } catch (error: any) {
      set({
        error: error.message || '登出失败',
        loading: false
      })
    }
  },

  clearError: () => set({ error: null })
}))

// 初始化：监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.setState({
      user: session?.user || null,
      session: session,
      loading: false
    })
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false
    })
  }
})
