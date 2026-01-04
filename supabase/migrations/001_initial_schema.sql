-- ============================================================
-- 农场主游戏 - 数据库初始化脚本
-- 版本: 1.0
-- 说明: 创建游戏所需的数据库表和策略
-- ============================================================

-- ------------------------------------------------------------
-- 1. 游戏存档表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  save_name TEXT DEFAULT '主存档',
  game_state JSONB NOT NULL,           -- 完整游戏状态
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true       -- 是否为当前使用的存档
);

-- 索引：提升查询性能
CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_is_active ON game_saves(is_active);

-- ------------------------------------------------------------
-- 2. 玩家统计表
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS player_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_days INTEGER DEFAULT 0,           -- 总游戏天数
  total_earnings INTEGER DEFAULT 0,       -- 总收入
  crops_harvested INTEGER DEFAULT 0,      -- 收获作物数
  animals_owned INTEGER DEFAULT 0,        -- 拥有动物数
  quests_completed INTEGER DEFAULT 0,     -- 完成任务数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. 排行榜表（后期扩展）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,                 -- 'wealth', 'harvest', 'quests'
  score INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON leaderboards(category);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(score DESC);

-- ------------------------------------------------------------
-- 安全策略 (Row Level Security)
-- ------------------------------------------------------------

-- 启用 RLS
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- game_saves 表策略
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

-- player_stats 表策略
CREATE POLICY "用户只能查看自己的统计"
ON player_stats FOR ALL
USING (auth.uid() = user_id);

-- leaderboards 表策略
CREATE POLICY "所有人可以查看排行榜"
ON leaderboards FOR SELECT
USING (true);

CREATE POLICY "用户只能创建自己的记录"
ON leaderboards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 触发器：自动更新 updated_at 字段
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_saves_updated_at BEFORE UPDATE ON game_saves
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON player_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
