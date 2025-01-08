'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  points: number;
  achievementId: string;
  mode: 'achieve' | 'cancel';
}

export default function AchievementModal({
  isOpen,
  onClose,
  title,
  points,
  achievementId,
  mode,
}: AchievementModalProps) {
  const supabase = createClientComponentClient<Database>();

  const handleConfirm = async (share: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      if (mode === 'achieve') {
        // 実績を達成
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievementId,
            achieved_at: new Date().toISOString(),
            points_at_achievement: points
          });

        if (insertError) throw insertError;

        if (share) {
          const shareText = `🎉 実績「${title}」を達成しました！ +${points}ポイント獲得！\n\n#LifeTrack #実績解除`;
          const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
          window.open(shareUrl, '_blank');
        }
      } else {
        // 実績を取り消し
        const { error: deleteError } = await supabase
          .from('user_achievements')
          .delete()
          .eq('user_id', user.id)
          .eq('achievement_id', achievementId);

        if (deleteError) throw deleteError;
      }

      onClose();
      window.location.reload(); // 実績リストを更新
    } catch (e) {
      console.error('実績の処理エラー:', e);
      alert(e instanceof Error ? e.message : '実績の処理に失敗しました');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {mode === 'achieve' ? '実績達成の確認' : '実績の取り消し'}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {mode === 'achieve'
                      ? `「${title}」を達成しますか？ +${points}ポイント獲得できます！`
                      : `「${title}」の達成を取り消しますか？ ${points}ポイントが減少します。`}
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                    onClick={onClose}
                  >
                    キャンセル
                  </button>
                  {mode === 'achieve' && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 dark:bg-blue-900/20 px-4 py-2 text-sm font-medium text-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 focus:outline-none"
                      onClick={() => handleConfirm(true)}
                    >
                      達成してシェア
                    </button>
                  )}
                  <button
                    type="button"
                    className={mode === 'achieve'
                      ? "inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                      : "inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                    }
                    onClick={() => handleConfirm(false)}
                  >
                    {mode === 'achieve' ? '達成' : '取り消し'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 