/**
 * 数据库初始化脚本
 * 运行方式: node scripts/init-db.js
 *
 * 这个脚本会连接到你的 Supabase 数据库并创建所需的表
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// 从 .env.local 读取配置
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

// 从 URL 提取数据库连接信息
// URL 格式: https://xitkpphkffxysouffchy.supabase.co
function getDbUrl(supabaseUrl) {
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]
  if (!projectId) {
    throw new Error('无法解析 Supabase URL')
  }

  // Supabase PostgreSQL 连接格式
  // 但需要数据库密码，这个只能在 Dashboard 获取
  return `postgresql://postgres:[YOUR-PASSWORD]@db.${projectId}.supabase.co:5432/postgres`
}

async function initDatabase() {
  console.log('🚀 开始初始化数据库...\n')

  // 读取 SQL 文件
  const sqlFile = path.resolve(__dirname, '../supabase/migrations/001_create_tables.sql')

  if (!fs.existsSync(sqlFile)) {
    console.error('❌ SQL 文件不存在:', sqlFile)
    console.log('\n💡 请先确保 supabase/migrations/001_create_tables.sql 文件存在')
    return
  }

  const sql = fs.readFileSync(sqlFile, 'utf8')

  console.log('📖 已读取 SQL 文件')
  console.log('📄 SQL 文件路径:', sqlFile)
  console.log('📏 SQL 大小:', sql.length, '字符\n')

  console.log('⚠️  注意：此脚本需要数据库密码')
  console.log('🔑 获取密码步骤：')
  console.log('   1. 访问: https://supabase.com/dashboard')
  console.log('   2. 选择项目: xitkpphkffxysouffchy')
  console.log('   3. Settings → Database')
  console.log('   4. 找到 "Connection string" → "URI"')
  console.log('   5. 复制数据库密码\n')

  console.log('📋 或者，更简单的方法是：')
  console.log('   1. 访问: https://supabase.com/dashboard')
  console.log('   2. 选择项目 → SQL Editor')
  console.log('   3. 点击 "New query"')
  console.log('   4. 粘贴 SQL 文件内容')
  console.log('   5. 点击 "Run"\n')

  console.log('💡 推荐使用第二种方法（SQL Editor），更安全更简单！')
}

initDatabase()
