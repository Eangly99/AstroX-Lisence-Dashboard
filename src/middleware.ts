import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

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
