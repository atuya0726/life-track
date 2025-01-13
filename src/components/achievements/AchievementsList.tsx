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
  category: {
    id: string;
    name: string;
    description: string;
  } | null;
};

type Category = {
  id: string;
  name: string;
  description: string;
  display_order: number;
};

type ErrorResponse = {
  message: string;
};

type AchievementWithCategory = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  custom_achievement: boolean;
  category: {
    id: string;
    name: string;
    description: string;
  };
};

type FormattedAchievement = {
  id: string;
  title: string;
  description: string;
  points: number;
  achieved: boolean;
  achievementCount: number;
  totalUsers: number;
  category: {
    id: string;
    name: string;
    description: string;
  };
};

export default function AchievementsList() {
  const [achievements, setAchievements] = useState<FormattedAchievement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [sortOrder, setSortOrder] = useState<'points_desc' | 'points_asc' | 'date'>('points_desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    if (totalUsers === 0) return 10;
    const achievementRate = achievementCount / totalUsers;
    const basePoints = Math.round(100 * (1 - achievementRate));
    return Math.max(basePoints, 10);
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('achievement_categories')
          .select('*')
          .order('display_order');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);
      } catch (e) {
        console.error('カテゴリの読み込みエラー:', e);
      }
    }

    loadCategories();
  }, [supabase]);

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
            custom_achievement,
            category:achievement_categories!inner (
              id,
              name,
              description
            )
          `)
          .order('created_at', { ascending: false }) as { data: AchievementWithCategory[] | null, error: any };
        
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
        const formattedAchievements = (achievementsData || [])
          .filter((achievement): achievement is AchievementWithCategory => 
            achievement !== null && achievement.category !== null
          )
          .map(achievement => ({
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
            category: {
              id: achievement.category.id,
              name: achievement.category.name,
              description: achievement.category.description
            }
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

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category?.id === selectedCategory
  );

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortOrder) {
      case 'points_desc':
        return b.points - a.points;
      case 'points_asc':
        return a.points - b.points;
      case 'date':
        return 0; // date順は既にAPIで処理済み
      default:
        return 0;
    }
  });

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ← ダッシュボードへ戻る
          </Link>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <option value="all">すべてのカテゴリ</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'points_desc' | 'points_asc' | 'date')}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <option value="points_desc">ポイント順（高い順）</option>
              <option value="points_asc">ポイント順（低い順）</option>
              <option value="date">新着順</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {sortedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {achievement.title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300">
                  {achievement.category?.name || 'カテゴリなし'}
                </span>
              </div>
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
                    ? "px-4 py-2 bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
                    : "px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
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
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        points={modalState.points}
        achievementId={modalState.achievementId}
        mode={modalState.mode}
      />
    </>
  );
} 
