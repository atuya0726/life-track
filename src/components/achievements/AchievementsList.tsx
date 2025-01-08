'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import AchievementModal from './AchievementModal';
import { Database } from '@/types/database.types';

type Achievement = {
  id: string;
  title: string;
  description: string;
  points: number;
  achieved: boolean;
  achievementCount: number;
  totalUsers: number;
};

type ErrorResponse = {
  message: string;
};

export default function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [sortOrder, setSortOrder] = useState<'points' | 'date'>('points');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    points: number;
    achievementId: string;
    mode: 'achieve' | 'cancel';
  }>({
    isOpen: false,
    title: '',
    points: 0,
    achievementId: '',
    mode: 'achieve',
  });

  const supabase = createClientComponentClient<Database>();

  // ポイントを計算する関数
  const calculatePoints = (achievementCount: number, totalUsers: number): number => {
    if (totalUsers === 0) return 10; // デフォルトポイント
    
    // 達成率を計算（0から1の値）
    const achievementRate = achievementCount / totalUsers;
    
    // 基本ポイント（達成率が低いほど高得点）
    const basePoints = Math.round(100 * (1 - achievementRate));
    
    // 最小ポイントは10点
    return Math.max(basePoints, 10);
  };

  useEffect(() => {
    async function loadAchievements() {
      try {
        console.log('ユーザー情報の取得を開始');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ユーザーが見つかりません');
        console.log('ユーザー情報:', user);

        // 全実績を取得
        console.log('実績データの取得を開始');
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select(`
            id,
            title,
            description,
            created_at,
            custom_achievement
          `)
          .order('created_at', { ascending: false });
        
        console.log('実績データの取得結果:', { data: achievementsData, error: achievementsError });

        if (achievementsError) {
          console.error('実績データの取得エラー:', {
            message: achievementsError.message,
            details: achievementsError.details,
            hint: achievementsError.hint,
            code: achievementsError.code
          });
          throw new Error(`実績データの取得に失敗しました: ${achievementsError.message}`);
        }

        if (!achievementsData || achievementsData.length === 0) {
          console.log('実績データが空です');
          setAchievements([]);
          return;
        }

        // ユーザーの達成済み実績を取得
        console.log('ユーザーの達成済み実績の取得を開始');
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);

        console.log('ユーザーの達成済み実績:', { data: userAchievements, error: userAchievementsError });

        if (userAchievementsError) {
          console.error('ユーザー実績の取得エラー:', userAchievementsError);
          throw new Error('ユーザー実績の取得に失敗しました');
        }

        // ユーザー総数を取得
        console.log('ユーザー総数の取得を開始');
        const { count: totalUsers, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        console.log('ユーザー総数:', { count: totalUsers, error: usersError });

        if (usersError) {
          console.error('ユーザー総数の取得エラー:', usersError);
          throw new Error('ユーザー総数の取得に失敗しました');
        }

        // 各実績の達成数を一括で取得
        console.log('実績の達成数の取得を開始');
        const { data: achievementStats, error: statsError } = await supabase
          .from('user_achievements')
          .select('achievement_id');

        if (statsError) {
          console.error('実績の達成数取得エラー:', statsError);
          throw new Error('実績の達成数取得に失敗しました');
        }

        // 達成数をカウント
        const achievementCounts: { [key: string]: number } = {};
        achievementsData.forEach(achievement => {
          achievementCounts[achievement.id] = achievementStats?.filter(
            stat => stat.achievement_id === achievement.id
          ).length || 0;
        });

        // データを整形
        const formattedAchievements = achievementsData.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          points: calculatePoints(
            achievementCounts[achievement.id],
            totalUsers || 1
          ),
          achieved: userAchievements?.some(ua => ua.achievement_id === achievement.id) ?? false,
          achievementCount: achievementCounts[achievement.id],
          totalUsers: totalUsers || 1,
        }));

        console.log('整形済みの実績データ:', formattedAchievements);
        setAchievements(formattedAchievements);
      } catch (e) {
        console.error('実績の読み込みエラー:', e instanceof Error ? e.message : e);
        setError({ message: e instanceof Error ? e.message : '実績の読み込みに失敗しました' });
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, [sortOrder, supabase]);

  const handleAchievementClick = (
    achievementId: string,
    points: number,
    mode: 'achieve' | 'cancel'
  ) => {
    setModalState({
      isOpen: true,
      title: achievements.find(a => a.id === achievementId)?.title || '',
      points,
      achievementId,
      mode,
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-xl text-gray-600 dark:text-gray-300">読み込み中...</div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <div className="text-red-600 dark:text-red-400">{error.message}</div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ← ダッシュボードへ戻る
          </Link>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'points' | 'date')}
            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <option value="points">ポイント順</option>
            <option value="date">新着順</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {achievement.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {achievement.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div className="text-xl">{achievement.points}ポイント</div>
                  <div>達成率: {((achievement.achievementCount / achievement.totalUsers) * 100).toFixed(1)}%</div>
                </div>
                <button
                  onClick={() => handleAchievementClick(
                    achievement.id,
                    achievement.points,
                    achievement.achieved ? 'cancel' : 'achieve'
                  )}
                  className={achievement.achieved
                    ? "px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors cursor-pointer"
                    : "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  }
                >
                  {achievement.achieved ? '達成済み' : '達成'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AchievementModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        points={modalState.points}
        achievementId={modalState.achievementId}
        mode={modalState.mode}
      />
    </>
  );
} 