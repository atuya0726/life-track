-- 既存のデータをクリア
TRUNCATE TABLE achievement_categories CASCADE;
TRUNCATE TABLE achievements CASCADE;

-- カテゴリの初期データ
INSERT INTO achievement_categories (id, name, description, display_order) VALUES
  ('c0f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1a', '日常生活', '毎日の生活の中での小さな達成', 1),
  ('c2f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1b', '健康', '健康的な生活習慣に関する実績', 2),
  ('c3f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1c', '学習', '新しいスキルや知識の習得', 3),
  ('c4f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1d', '仕事', '職場やキャリアでの成長', 4),
  ('c5f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1e', '趣味', '趣味や特技の上達', 5),
  ('c6f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1f', '社会貢献', 'コミュニティへの貢献', 6),
  ('c7f1d094-07d6-4c1a-9c1e-3b1f3e7b3d17', '人間関係', '家族や友人との関係づくり', 7),
  ('c8f1d094-07d6-4c1a-9c1e-3b1f3e7b3d18', 'マイルストーン', '人生の重要な節目', 8);

-- 実績の初期データ
INSERT INTO achievements (id, category_id, title, description, custom_achievement, created_at, updated_at) VALUES
  -- 初心者向け実績（日常生活カテゴリ）
  (gen_random_uuid(), 'c0f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1a', 'はじめの一歩', 'Life Trackを初めて利用する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c0f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1a', 'プロフィール達人', 'プロフィールを完全に設定する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c0f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1a', '継続は力なり', '7日連続でログインする', false, NOW(), NOW()),
  
  -- 健康カテゴリ
  (gen_random_uuid(), 'c2f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1b', '早起きマスター', '5日連続で朝6時前に起床する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c2f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1b', '健康的な食生活', '1週間連続で朝食を摂る', false, NOW(), NOW()),
  (gen_random_uuid(), 'c2f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1b', '運動習慣', '1週間で合計150分以上の運動を行う', false, NOW(), NOW()),
  
  -- 学習カテゴリ
  (gen_random_uuid(), 'c3f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1c', '読書家', '1ヶ月で5冊以上の本を読む', false, NOW(), NOW()),
  (gen_random_uuid(), 'c3f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1c', '語学マスター', '外国語の学習を30日間継続する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c3f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1c', 'オンライン学習者', 'オンライン講座を1つ完了する', false, NOW(), NOW()),
  
  -- 仕事カテゴリ
  (gen_random_uuid(), 'c4f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1d', 'タスクマスター', '1日のTODOリストをすべて完了する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c4f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1d', '時間管理の達人', '1週間連続でポモドーロテクニックを実践する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c4f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1d', 'プレゼンテーション上手', '10人以上の前でプレゼンテーションを行う', false, NOW(), NOW()),
  
  -- 趣味カテゴリ
  (gen_random_uuid(), 'c5f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1e', '写真家', '1週間連続で写真を撮影する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c5f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1e', '料理人', '新しいレシピを5つマスターする', false, NOW(), NOW()),
  (gen_random_uuid(), 'c5f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1e', '旅行者', '新しい場所を3つ訪れる', false, NOW(), NOW()),
  
  -- 社会貢献カテゴリ
  (gen_random_uuid(), 'c6f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1f', 'ボランティア精神', 'ボランティア活動に参加する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c6f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1f', 'エコフレンドリー', '1週間連続でエコバッグを使用する', false, NOW(), NOW()),
  (gen_random_uuid(), 'c6f1d094-07d6-4c1a-9c1e-3b1f3e7b3d1f', '地域貢献', '地域のイベントに参加する', false, NOW(), NOW()),
  
  -- 人間関係カテゴリ
  (gen_random_uuid(), 'c7f1d094-07d6-4c1a-9c1e-3b1f3e7b3d17', '家族の絆', '家族と週末を過ごす', false, NOW(), NOW()),
  (gen_random_uuid(), 'c7f1d094-07d6-4c1a-9c1e-3b1f3e7b3d17', '友情の輪', '新しい友人を作る', false, NOW(), NOW()),
  
  -- マイルストーンカテゴリ
  (gen_random_uuid(), 'c8f1d094-07d6-4c1a-9c1e-3b1f3e7b3d18', 'コンフォートゾーン突破', '普段やらないことにチャレンジする', false, NOW(), NOW()),
  (gen_random_uuid(), 'c8f1d094-07d6-4c1a-9c1e-3b1f3e7b3d18', '目標達成者', '設定した目標を3つ達成する', false, NOW(), NOW()); 