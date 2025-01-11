-- Achievement Categories Table
CREATE TABLE achievement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (display_order)
);

-- Achievements Table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES achievement_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    custom_achievement BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements Table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    points_at_achievement INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- RLS Policies
ALTER TABLE achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievement Categories Policies
CREATE POLICY "全ユーザーがカテゴリを参照可能" ON achievement_categories
    FOR SELECT TO authenticated
    USING (true);

-- Achievements Policies
CREATE POLICY "全ユーザーが実績を参照可能" ON achievements
    FOR SELECT TO authenticated
    USING (true);

-- User Achievements Policies
CREATE POLICY "ユーザーは自分の実績を管理可能" ON user_achievements
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Initial Category Data
INSERT INTO achievement_categories (name, description, display_order) VALUES
    ('日常生活', '毎日の生活の中での小さな達成', 1),
    ('健康', '健康的な生活習慣に関する実績', 2),
    ('学習', '新しいスキルや知識の習得', 3),
    ('仕事', '職場やキャリアでの成長', 4),
    ('趣味', '趣味や特技の上達', 5),
    ('社会貢献', 'コミュニティへの貢献', 6),
    ('人間関係', '家族や友人との関係づくり', 7),
    ('マイルストーン', '人生の重要な節目', 8);

-- Functions
CREATE OR REPLACE FUNCTION record_achievement(p_achievement_id UUID, p_points INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    INSERT INTO user_achievements (
        user_id,
        achievement_id,
        achieved_at,
        points_at_achievement
    ) VALUES (
        v_user_id,
        p_achievement_id,
        NOW(),
        p_points
    );
    
    UPDATE auth.users
    SET total_points = COALESCE(total_points, 0) + p_points
    WHERE id = v_user_id;
END;
$$;

-- Comments
COMMENT ON TABLE achievement_categories IS 'カテゴリーマスターテーブル';
COMMENT ON TABLE achievements IS '実績マスターテーブル';
COMMENT ON TABLE user_achievements IS 'ユーザーの実績達成記録テーブル';
COMMENT ON COLUMN achievement_categories.display_order IS '表示順（一意の整数値）';
COMMENT ON COLUMN achievements.custom_achievement IS 'カスタム実績かどうかのフラグ';
COMMENT ON COLUMN user_achievements.points_at_achievement IS '達成時のポイント（動的計算値）'; 