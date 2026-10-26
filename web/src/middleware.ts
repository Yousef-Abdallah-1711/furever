import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);
const publicRoutes = new Set(['login', 'forgot-password', 'accept-invite', 'no-access', 'mfa']);
const dashboardRoles = new Set(['clinic_staff', 'admin', 'super_admin']);

function localizedPath(pathname: string): { locale: string; route: string } {
  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = routing.locales.includes(segments[0] as (typeof routing.locales)[number]);
  return { locale: hasLocale ? segments[0] : routing.defaultLocale, route: (hasLocale ? segments.slice(1) : segments).join('/') };
}

function redirectWithCookies(request: NextRequest, pathname: string, response: NextResponse): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirected = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirected.cookies.set(cookie));
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = response.headers.get(header);
    if (value) redirected.headers.set(header, value);
  }
  return redirected;
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = intl(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured');
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { locale, route } = localizedPath(request.nextUrl.pathname);
  const segments = route.split('/').filter(Boolean);
  if (segments.length > 0 && publicRoutes.has(segments[0])) return response;
  const claimsResult = user ? await supabase.auth.getClaims() : null;
  const roleClaim = claimsResult?.data?.claims?.user_role;
  const role = typeof roleClaim === 'string' ? roleClaim : null;
  if (!user) return redirectWithCookies(request, `/${locale}/login`, response);
  if (!role || !dashboardRoles.has(role)) return redirectWithCookies(request, `/${locale}/no-access`, response);
  if (segments[0] === 'admin') {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.currentLevel !== 'aal2') return redirectWithCookies(request, `/${locale}/mfa`, response);
  }
  return response;
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
