import AdminDashboard from '@/components/admin/AdminDashboard';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  try {
    // ユーザー認証とロールチェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/');
    }

    // ユーザーの権限を確認
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // if (error || !userData || userData.role !== 'admin') {
    //   redirect('/dashboard');
    // }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">管理者画面</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AdminDashboard />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Admin page error:', error);
    redirect('/');
  }
} 