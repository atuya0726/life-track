'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

type Achievement = {
  id: string;
  title: string;
  description: string;
};

interface DatabaseUserAchievement {
  id: string;
  achievement: Achievement;
  achieved_at: string;
  points_at_achievement: number;
}

type SortOrder = 'asc' | 'desc';

export default function UserAchievements() {
  const [achievements, setAchievements] = useState<DatabaseUserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadUserAchievements() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ユーザーが見つかりません');

        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            achievement:achievements!inner (
              id,
              title,
              description
            ),
            achieved_at,
            points_at_achievement
          `)
          .eq('user_id', user.id)
          .order('achieved_at', { ascending: false });

        if (error) throw error;

        const formattedData = (data || []).map(item => ({
          id: item.id,
          achievement: item.achievement[0] || item.achievement,
          achieved_at: item.achieved_at,
          points_at_achievement: item.points_at_achievement
        })) as DatabaseUserAchievement[];

        setAchievements(formattedData);
      } catch (e) {
        console.error('実績の読み込みエラー:', e);
        setError(e instanceof Error ? e.message : '実績の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadUserAchievements();
  }, [supabase]);

  const sortedAchievements = [...achievements].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return (a.points_at_achievement - b.points_at_achievement) * multiplier;
  });

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-xl text-gray-600 dark:text-gray-300">読み込み中...</div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <div className="text-red-600 dark:text-red-400">{error}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            あなたの実績
          </h2>
          <div className="flex gap-4">
            <button
              onClick={toggleSortOrder}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <span className="mr-2">ポイント順</span>
              <span className="text-primary-600 dark:text-primary-400">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            </button>
            <Link
              href="/achievements"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              実績を探す
            </Link>
          </div>
        </div>
        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6">
          総獲得ポイント: {achievements.reduce((sum, a) => sum + a.points_at_achievement, 0)}
        </div>
        <div className="space-y-4">
          {sortedAchievements.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              まだ実績を達成していません。新しい実績にチャレンジしてみましょう！
            </p>
          ) : (
            sortedAchievements.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {item.achievement.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {item.achievement.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      達成日: {new Date(item.achieved_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    +{item.points_at_achievement}pt
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 
