# データベース設計

## テーブル構成

### achievement_categories（実績カテゴリテーブル）
- id: uuid (PK)
- name: text (カテゴリ名)
- description: text (カテゴリの説明)
- display_order: integer (表示順)
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

### achievements（実績テーブル）
- id: uuid (PK)
- category_id: uuid (FK -> achievement_categories.id) NOT NULL
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

## カテゴリ管理

### カテゴリの役割
- 実績を論理的なグループに分類
- ユーザーの実績探索を容易にする
- 実績の管理と整理を効率化

### カテゴリの特徴
- 各実績は必ず1つのカテゴリに属する
- カテゴリの表示順は一意の整数値で管理
- カテゴリ名は必須、説明は任意
- 全ユーザーが参照可能

### 標準カテゴリ
1. 日常生活（display_order: 1）
   - 毎日の生活の中での小さな達成
2. 健康（display_order: 2）
   - 健康的な生活習慣に関する実績
3. 学習（display_order: 3）
   - 新しいスキルや知識の習得
4. 仕事（display_order: 4）
   - 職場やキャリアでの成長
5. 趣味（display_order: 5）
   - 趣味や特技の上達
6. 社会貢献（display_order: 6）
   - コミュニティへの貢献
7. 人間関係（display_order: 7）
   - 家族や友人との関係づくり
8. マイルストーン（display_order: 8）
   - 人生の重要な節目

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

### achievement_categories
```sql
-- 全ユーザーがカテゴリを参照可能
CREATE POLICY "全ユーザーがカテゴリを参照可能" ON achievement_categories
  FOR SELECT TO authenticated
  USING (true);
```

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
- カテゴリ名は必須
- カテゴリの説明は任意
- 実績は必ずいずれかのカテゴリに属する（NOT NULL制約）
- カテゴリの表示順は一意（UNIQUE制約）
- タイトルは必須
- 説明文は任意
- タイムスタンプは自動的にUTC時間で記録
- ユーザーは同じ実績を複数回達成できない
- カスタム実績は作成者のユーザーIDが必須

## 初期データ（カテゴリ）
```sql
INSERT INTO achievement_categories (name, description, display_order) VALUES
  ('日常生活', '毎日の生活の中での小さな達成', 1),
  ('健康', '健康的な生活習慣に関する実績', 2),
  ('学習', '新しいスキルや知識の習得', 3),
  ('仕事', '職場やキャリアでの成長', 4),
  ('趣味', '趣味や特技の上達', 5),
  ('社会貢献', 'コミュニティへの貢献', 6),
  ('人間関係', '家族や友人との関係づくり', 7),
  ('マイルストーン', '人生の重要な節目', 8);
```

## 今後の拡張予定
1. シテゴリごとの達成率の集計機能
2. カテゴリ別のポイント計算ルール
3. カテゴリ間の関連付け機能
4. カテゴリごとのバッジやアイコン
5. シェア機能の追加
6. 実績の達成条件の自動チェック機能
7. 実績の達成順序の依存関係の管理 