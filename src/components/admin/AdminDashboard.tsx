'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import Papa from 'papaparse';

type Achievement = {
  id: string;
  title: string;
  description: string;
  category_id: string;
  custom_achievement: boolean;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
};

type NewAchievement = Omit<Achievement, 'id' | 'created_at'>;

export default function AdminDashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newAchievement, setNewAchievement] = useState<NewAchievement>({
    title: '',
    description: '',
    category_id: '',
    custom_achievement: false,
  });
  
  const supabase = createClientComponentClient<Database>();

  // ドラッグ&ドロップハンドラー
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) {
      setMessage({
        type: 'error',
        text: 'ファイルをアップロードしてください。'
      });
      return;
    }

    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({
        type: 'error',
        text: '拡張子が.csvのファイルのみアップロード可能です。'
      });
      return;
    }

    await processCSVFile(file);
  };

  // CSVファイル処理
  const processCSVFile = async (file: File) => {
    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.data.length === 0) {
              setMessage({
                type: 'error',
                text: 'CSVファイルにデータが含まれていません。'
              });
              return;
            }

            // 必須カラムの存在チェック
            const requiredColumns = ['タイトル', '説明', 'カテゴリー'];
            const missingColumns = requiredColumns.filter(col => !results.meta.fields?.includes(col));
            
            if (missingColumns.length > 0) {
              setMessage({
                type: 'error',
                text: `必須カラムが不足しています: ${missingColumns.join(', ')}`
              });
              return;
            }

            const { error } = await supabase
              .from('achievements')
              .insert(
                results.data.map((row: any) => ({
                  title: row.タイトル,
                  description: row.説明,
                  category_id: categories.find(c => c.name === row.カテゴリー)?.id,
                  custom_achievement: false
                }))
              );

            if (error) throw error;

            // 実績一覧を再取得
            const { data: achievementsData } = await supabase
              .from('achievements')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (achievementsData) {
              setAchievements(achievementsData);
            }

            setMessage({
              type: 'success',
              text: `${results.data.length}件の実績を追加しました。`
            });
          } catch (error) {
            console.error('Import error:', error);
            setMessage({
              type: 'error',
              text: '実績の追加中にエラーが発生しました。'
            });
          }
        },
        error: (error: Error) => {
          console.error('CSV parse error:', error);
          setMessage({
            type: 'error',
            text: 'CSVファイルの解析中にエラーが発生しました。'
          });
        }
      });
    } catch (error) {
      console.error('File read error:', error);
      setMessage({
        type: 'error',
        text: 'ファイルの読み込み中にエラーが発生しました。'
      });
    } finally {
      setLoading(false);
    }
  };

  // 実績とカテゴリーの一覧を取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // カテゴリーの取得
        const { data: categoriesData } = await supabase
          .from('achievement_categories')
          .select('*')
          .order('display_order');
        
        if (categoriesData) {
          setCategories(categoriesData);
        }

        // 実績の取得
        const { data: achievementsData } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (achievementsData) {
          setAchievements(achievementsData);
        }
      } catch (error) {
        console.error('Data fetch error:', error);
        setMessage({
          type: 'error',
          text: 'データの取得中にエラーが発生しました。'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 新規実績の追加
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert([newAchievement])
        .select()
        .single();

      if (error) throw error;

      setAchievements([data, ...achievements]);
      setNewAchievement({
        title: '',
        description: '',
        category_id: '',
        custom_achievement: false,
      });
      setMessage({
        type: 'success',
        text: '実績を追加しました。'
      });
    } catch (error) {
      console.error('Add achievement error:', error);
      setMessage({
        type: 'error',
        text: '実績の追加中にエラーが発生しました。'
      });
    } finally {
      setLoading(false);
    }
  };

  // 実績の削除
  const handleDeleteAchievement = async (id: string) => {
    if (!window.confirm('この実績を削除してもよろしいですか？')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAchievements(achievements.filter(achievement => achievement.id !== id));
      setMessage({
        type: 'success',
        text: '実績を削除しました。'
      });
    } catch (error) {
      console.error('Delete achievement error:', error);
      setMessage({
        type: 'error',
        text: '実績の削除中にエラーが発生しました。'
      });
    } finally {
      setLoading(false);
    }
  };

  // CSVエクスポート機能
  const handleExportCSV = () => {
    try {
      // 実績データをCSV用に整形
      const csvData = achievements.map(achievement => ({
        タイトル: achievement.title,
        説明: achievement.description,
        カテゴリー: categories.find(c => c.id === achievement.category_id)?.name || 'Unknown'
      }));

      // CSVデータの生成
      const csv = Papa.unparse(csvData, {
        header: true,
        delimiter: ',',
      });

      // BOMを追加して文字化けを防ぐ
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
      
      // ダウンロードリンクの作成
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `achievements.csv`;
      
      // ダウンロードの実行
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({
        type: 'success',
        text: 'CSVファイルのエクスポートが完了しました。'
      });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({
        type: 'error',
        text: 'CSVファイルのエクスポートに失敗しました。'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">実績管理</h2>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
              disabled:opacity-50 disabled:cursor-not-allowed text-xl"
            disabled={loading || achievements.length === 0}
          >
            CSVエクスポート
          </button>
        </div>
        
        {/* メッセージ表示 */}
        {message && (
          <div className={`p-4 rounded-md mb-6 text-xl ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* CSVドロップゾーン */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-8 p-8 border-2 border-dashed rounded-lg text-center transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600'
            }`}
        >
          <div className="text-xl text-gray-600 dark:text-gray-300">
            <p className="mb-2">CSVファイルをドラッグ&ドロップ</p>
            <p className="text-sm text-gray-500">または</p>
            <label className="mt-2 inline-block cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && processCSVFile(e.target.files[0])}
                className="hidden"
              />
              <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                inline-block text-xl">
                ファイルを選択
              </span>
            </label>
          </div>
        </div>

        {/* CSVフォーマットの説明 */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            CSVファイルのフォーマット
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            以下のカラムを含むCSVファイルを使用してください：
          </p>
          <ul className="list-disc list-inside text-xl text-gray-600 dark:text-gray-300">
            <li>タイトル（実績のタイトル）</li>
            <li>説明（実績の説明）</li>
            <li>カテゴリー（カテゴリー名）</li>
          </ul>
        </div>

        {/* 実績一覧 */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">実績一覧</h3>
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white">
                      {achievement.title}
                    </h4>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">
                      {achievement.description}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xl font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {categories.find(c => c.id === achievement.category_id)?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="text-xl text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    disabled={loading}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 