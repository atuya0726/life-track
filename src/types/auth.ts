import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードは少なくとも1つの小文字、大文字、数字を含む必要があります'
    ),
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上である必要があります')
    .max(20, 'ユーザー名は20文字以下である必要があります'),
});

export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export type SignUpForm = z.infer<typeof signUpSchema>;
export type LoginForm = z.infer<typeof loginSchema>; 