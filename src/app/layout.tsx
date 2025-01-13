import './globals.css';
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://life-track.vercel.app';

export const metadata: Metadata = {
  title: 'Life Track - 人生の実績を記録しよう',
  description: 'あなたの人生の大切な瞬間を実績として記録し、振り返ることができます。新しい挑戦の動機づけにもなります。',
  openGraph: {
    title: 'Life Track - 人生の実績を記録しよう',
    description: 'あなたの人生の大切な瞬間を実績として記録し、振り返ることができます。新しい挑戦の動機づけにもなります。',
    url: baseUrl,
    siteName: 'Life Track',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life Track - 人生の実績を記録しよう',
    description: 'あなたの人生の大切な瞬間を実績として記録し、振り返ることができます。新しい挑戦の動機づけにもなります。',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
} 
