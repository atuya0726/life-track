import Link from 'next/link';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Life Track
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            新規登録して実績を記録しよう
          </p>
        </div>

        <SignUpForm />

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            すでにアカウントをお持ちの方はこちら
          </Link>
        </div>
      </div>
    </div>
  );
} 