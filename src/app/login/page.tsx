import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Life Track
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            人生の実績を記録しよう
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            アカウントをお持ちでない方はこちら
          </Link>
        </div>
      </div>
    </div>
  );
} 