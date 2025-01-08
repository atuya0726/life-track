-- 既存の実績データをクリア
TRUNCATE TABLE achievements CASCADE;

-- 基本的な実績データの挿入
INSERT INTO achievements (id, title, description, custom_achievement, created_at, updated_at) VALUES
  -- 初心者向け実績
  (gen_random_uuid(), 'はじめの一歩', 'Life Trackを初めて利用する', false, NOW(), NOW()),
  (gen_random_uuid(), 'プロフィール達人', 'プロフィールを完全に設定する', false, NOW(), NOW()),
  (gen_random_uuid(), '継続は力なり', '7日連続でログインする', false, NOW(), NOW()),
  
  -- 生活習慣に関する実績
  (gen_random_uuid(), '早起きマスター', '5日連続で朝6時前に起床する', false, NOW(), NOW()),
  (gen_random_uuid(), '健康的な食生活', '1週間連続で朝食を摂る', false, NOW(), NOW()),
  (gen_random_uuid(), '運動習慣', '1週間で合計150分以上の運動を行う', false, NOW(), NOW()),
  
  -- 学習に関する実績
  (gen_random_uuid(), '読書家', '1ヶ月で5冊以上の本を読む', false, NOW(), NOW()),
  (gen_random_uuid(), '語学マスター', '外国語の学習を30日間継続する', false, NOW(), NOW()),
  (gen_random_uuid(), 'オンライン学習者', 'オンライン講座を1つ完了する', false, NOW(), NOW()),
  
  -- 仕事に関する実績
  (gen_random_uuid(), 'タスクマスター', '1日のTODOリストをすべて完了する', false, NOW(), NOW()),
  (gen_random_uuid(), '時間管理の達人', '1週間連続でポモドーロテクニックを実践する', false, NOW(), NOW()),
  (gen_random_uuid(), 'プレゼンテーション上手', '10人以上の前でプレゼンテーションを行う', false, NOW(), NOW()),
  
  -- 趣味に関する実績
  (gen_random_uuid(), '写真家', '1週間連続で写真を撮影する', false, NOW(), NOW()),
  (gen_random_uuid(), '料理人', '新しいレシピを5つマスターする', false, NOW(), NOW()),
  (gen_random_uuid(), '旅行者', '新しい場所を3つ訪れる', false, NOW(), NOW()),
  
  -- 社会貢献に関する実績
  (gen_random_uuid(), 'ボランティア精神', 'ボランティア活動に参加する', false, NOW(), NOW()),
  (gen_random_uuid(), 'エコフレンドリー', '1週間連続でエコバッグを使用する', false, NOW(), NOW()),
  (gen_random_uuid(), '地域貢献', '地域のイベントに参加する', false, NOW(), NOW()),
  
  -- チャレンジ実績
  (gen_random_uuid(), 'コンフォートゾーン突破', '普段やらないことにチャレンジする', false, NOW(), NOW()),
  (gen_random_uuid(), '目標達成者', '設定した目標を3つ達成する', false, NOW(), NOW()); 