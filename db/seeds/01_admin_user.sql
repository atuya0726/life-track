-- admin権限を持つユーザーのseeder
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- auth.usersテーブルにadminユーザーを作成
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('adminpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO admin_user_id;

  -- usersテーブルにadminユーザーの追加情報を作成
  INSERT INTO public.users (
    id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@example.com',
    'admin',
    NOW(),
    NOW()
  );

  -- RLSポリシーのためのadminロールを作成（必要な場合）
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT FROM pg_roles WHERE rolname = 'admin'
    ) THEN
      CREATE ROLE admin;
    END IF;
  END $$;

  -- adminロールに必要な権限を付与
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
  GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin;

END $$; 