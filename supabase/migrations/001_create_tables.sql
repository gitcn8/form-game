-- ============================================================
-- 农场主小游戏 - 数据库表创建
-- ============================================================
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行此文件
-- ============================================================

-- ============================================================
-- 1. 游戏存档表
-- ============================================================

CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  save_name TEXT DEFAULT '主存档',
  game_state JSONB NOT NULL,           -- 完整游戏状态
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true       -- 是否为当前使用的存档
);

-- 索引
CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_game_saves_is_active ON game_saves(is_active);

-- RLS策略
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

-- ============================================================
-- 2. 玩家统计表
-- ============================================================

CREATE TABLE player_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_days INTEGER DEFAULT 0,           -- 总游戏天数
  total_earnings INTEGER DEFAULT 0,       -- 总收入
  crops_harvested INTEGER DEFAULT 0,      -- 收获作物数
  animals_owned INTEGER DEFAULT 0,        -- 拥有动物数
  quests_completed INTEGER DEFAULT 0,     -- 完成任务数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS策略
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的统计"
ON player_stats FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- 3. 排行榜表（后期扩展）
-- ============================================================

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,                 -- 'wealth', 'harvest', 'quests'
  score INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_leaderboards_category ON leaderboards(category);
CREATE INDEX idx_leaderboards_score ON leaderboards(score DESC);

-- RLS策略
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可以查看排行榜"
ON leaderboards FOR SELECT
USING (true);

CREATE POLICY "用户只能创建自己的记录"
ON leaderboards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 创建成功提示
-- ============================================================

-- 查看所有创建的表
SELECT
  '✅ 数据库表创建完成！' as status,
  'game_saves, player_stats, leaderboards' as tables_created;

-- 查看表信息
SELECT
  tablename as table_name,
  schemaname as schema
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('game_saves', 'player_stats', 'leaderboards')
ORDER BY tablename;
