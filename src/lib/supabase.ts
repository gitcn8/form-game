import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// 认证相关函数
// ============================================================

/**
 * 用户注册
 */
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // 不重定向
    }
  })

  if (error) {
    throw error
  }

  // 返回完整的数据对象
  return {
    user: data.user,
    session: data.session
  }
}

/**
 * 用户登录
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  // 返回完整的数据对象
  return {
    user: data.user,
    session: data.session
  }
}

/**
 * 用户登出
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * 获取当前用户
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

/**
 * 监听认证状态变化
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// ============================================================
// 存档相关函数
// ============================================================

/**
 * 保存游戏存档
 */
export const saveGameState = async (userId: string, gameState: any, saveName: string = '主存档') => {
  const { data, error } = await supabase
    .from('game_saves')
    .upsert({
      user_id: userId,
      save_name: saveName,
      game_state: gameState,
      updated_at: new Date().toISOString(),
    })
    .select()

  if (error) {
    throw error
  }

  return data
}

/**
 * 加载游戏存档
 */
export const loadGameState = async (userId: string) => {
  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * 获取所有存档
 */
export const getAllSaves = async (userId: string) => {
  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
