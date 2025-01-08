# データベース設計

## テーブル構成

### achievements（実績テーブル）
- id: uuid (PK)
- title: text (実績のタイトル)
- description: text (実績の説明)
- custom_achievement: boolean (カスタム実績かどうか)
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

### user_achievements（ユーザーの実績記録）
- id: uuid (PK)
- user_id: uuid (FK -> auth.users.id)
- achievement_id: uuid (FK -> achievements.id)
- achieved_at: timestamp with time zone (達成日時)
- points_at_achievement: integer (達成時のポイント)
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- unique(user_id, achievement_id) -- 同じ実績を複数回達成できない制約

## ポイント計算の仕組み

### 動的ポイント計算
- ポイントは実績の希少性に基づいて動的に計算
- 計算式: `points = max(100 * (1 - achievementRate), 10)`
  - achievementRate = 達成者数 / 全ユーザー数
  - 最小ポイントは10点を保証
  - 達成率0%で100点、100%で10点

### ポイントの記録
- 実績達成時の時点でのポイントを`points_at_achievement`に記録
- ユーザーの総ポイントは`auth.users.total_points`で管理
- ポイントの記録と更新は`record_achievement`関数で一括処理

## セキュリティ設定（RLS）

### achievements
```sql
-- 全ユーザーが実績を参照可能
CREATE POLICY "全ユーザーが実績を参照可能" ON achievements
  FOR SELECT TO authenticated
  USING (true);
```

### user_achievements
```sql
-- ユーザーは自分の実績のみ読み書き可能
CREATE POLICY "ユーザーは自分の実績を管理可能" ON user_achievements
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## ストアドプロシージャ

### record_achievement
```sql
create or replace function record_achievement(p_achievement_id uuid, p_points integer)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  insert into user_achievements (
    user_id,
    achievement_id,
    achieved_at,
    points_at_achievement
  ) values (
    v_user_id,
    p_achievement_id,
    now(),
    p_points
  );
  
  update auth.users
  set total_points = coalesce(total_points, 0) + p_points
  where id = v_user_id;
end;
$$;
```

## バックアップ
- Supabaseの自動バックアップ機能を使用
- 毎日バックアップを実行
- 7日間のバックアップを保持

## データの制約
- タイトルは必須
- 説明文は任意
- タイムスタンプは自動的にUTC時間で記録
- ユーザーは同じ実績を複数回達成できない
- カスタム実績は作成者のユーザーIDが必須

## 今後の拡張予定
1. シェア機能の追加
2. 実績カテゴリの追加
3. 実績の達成条件の自動チェック機能
4. 実績の達成順序の依存関係の管理 