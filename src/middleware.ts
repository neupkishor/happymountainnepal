
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createAccountIfNotExists, logActivity } from './lib/db';

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

  // If no cookie, create a new account
  if (!accountId) {
    accountId = uuidv4();
    response.cookies.set(COOKIE_NAME, accountId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Fire-and-forget: don't block the request for this
    createAccountIfNotExists(accountId, ip).catch(console.error);
  }

  // Log page view activity
  // Fire-and-forget
  logActivity({
    accountId,
    activityName: 'page_view',
    activityInfo: {
        path: pathname,
        userAgent: request.headers.get('user-agent') || 'unknown',
    },
    fromIp: ip,
  }).catch(console.error);


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
