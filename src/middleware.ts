
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'temp_account';

// List of file extensions to exclude from the middleware
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

  const response = NextResponse.next();
  let accountId = request.cookies.get(COOKIE_NAME)?.value;
  const ip = request.ip ?? '127.0.0.1';
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
