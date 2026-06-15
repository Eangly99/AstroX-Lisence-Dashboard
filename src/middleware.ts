import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

  // Redirect main-- branch deploy to canonical production domain
  const host = req.headers.get('host') || '';
  if (host === 'main--astrox-lisence-dash.netlify.app') {
    const canonicalUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, 'https://astrox-lisence-dash.netlify.app');
    return Response.redirect(canonicalUrl, 301);
  }

  // Redirect to signin if not logged in and trying to access app
  if (!isLoggedIn && !isAuthPage) {
    const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
    return Response.redirect(signInUrl);
  }

  // Redirect to dashboard if logged in and trying to access signin page
  if (isLoggedIn && isAuthPage) {
    const dashboardUrl = new URL('/dashboard', req.nextUrl.origin);
    return Response.redirect(dashboardUrl);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
