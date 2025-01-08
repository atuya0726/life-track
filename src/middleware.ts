import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 認証が必要なページへのアクセス
  if (!session && (
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/achievements')
  )) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 認証済みユーザーのログイン・新規登録ページへのアクセス
  if (session && (
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/signup')
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/achievements/:path*',
    '/login',
    '/signup',
  ],
}; 