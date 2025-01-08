'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import UserAchievements from './UserAchievements';

export default function DashboardContent() {
  const supabase = createClientComponentClient();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>
            <div className="flex gap-4">
              <Link
                href="/achievements"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                実績一覧へ
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            新しい実績にチャレンジしよう
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            実績一覧から新しい目標を見つけて、チャレンジを始めましょう。
          </p>
          <Link
            href="/achievements"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            実績を探す
          </Link>
        </div>

        <UserAchievements />
      </main>
    </div>
  );
} 