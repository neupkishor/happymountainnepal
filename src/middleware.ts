
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redirects from './redirects.json'; // Import the JSON file directly

const COOKIE_NAME = 'temp_account';
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Handle redirects from the JSON file
  const foundRedirect = redirects.find(r => r.source === pathname);

  if (foundRedirect) {
    const statusCode = foundRedirect.permanent ? 308 : 307;
    return NextResponse.redirect(new URL(foundRedirect.destination, request.url), statusCode);
  }

  // Paywall for /legal/documents
  if (pathname === '/legal/documents') {
    if (!request.cookies.has('user_email')) {
      const url = request.nextUrl.clone();
      url.pathname = '/legal/documents/gate';
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  let accountId = request.cookies.get(COOKIE_NAME)?.value;
  // Use x-forwarded-for header to get the client IP, or a fallback
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  let isNewAccount = false;

  // If no cookie, generate a new accountId
  if (!accountId) {
    accountId = uuidv4();
    isNewAccount = true;
  }

  // If it was a new account, set the cookie in the response.
  if (isNewAccount) {
    response.cookies.set(COOKIE_NAME, accountId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
