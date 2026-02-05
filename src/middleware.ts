
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { matchRedirectEdge } from '@/lib/redirects-edge';
import { getManagerData } from '@/lib/base-edge';

const COOKIE_NAME = 'temp_account';
const PUBLIC_FILE = /\.(.*)$/;

// Bot detection
function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /crawling/i,
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /baiduspider/i, /yandexbot/i, /facebookexternalhit/i,
    /twitterbot/i, /rogerbot/i, /linkedinbot/i,
    /embedly/i, /quora link preview/i, /showyoubot/i,
    /outbrain/i, /pinterest/i, /slackbot/i, /vkShare/i,
    /W3C_Validator/i, /redditbot/i, /applebot/i, /whatsapp/i,
    /flipboard/i, /tumblr/i, /bitlybot/i, /skypeuripreview/i,
    /nuzzel/i, /discordbot/i, /qwantify/i, /pinterestbot/i,
    /telegrambot/i, /semrushbot/i, /ahrefsbot/i, /dotbot/i,
  ];
  return botPatterns.some(pattern => pattern.test(userAgent));
}

// Resource type
function getResourceType(pathname: string): 'page' | 'api' | 'static' {
  if (pathname.startsWith('/api')) return 'api';
  if (PUBLIC_FILE.test(pathname)) return 'static';
  return 'page';
}

// Simple cookie-based authentication
async function isManagerAuthenticated(request: NextRequest): Promise<boolean> {
  const username = request.cookies.get('manager_username')?.value;
  const password = request.cookies.get('manager_password')?.value;

  if (!username || !password) {
    return false;
  }

  try {
    const managers = await getManagerData();
    const manager = managers.find(
      (m: { username: string; password: string }) =>
        m.username === username && m.password === password
    );

    return !!manager;
  } catch (e) {
    console.error('[Auth Middleware Error] Failed to validate manager credentials:', e);
    return false;
  }
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname, origin } = request.nextUrl;

  // Create a new headers object from the original request's headers
  const requestHeaders = new Headers(request.headers);

  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  const referrer = request.headers.get('referer') || undefined;
  const method = request.method;

  // 1. Temp account cookie
  let accountId = request.cookies.get(COOKIE_NAME)?.value;
  let isNewAccount = false;
  if (!accountId) {
    accountId = uuidv4();
    isNewAccount = true;
  }

  // Add the temp account ID to the request headers to be accessible by server components
  requestHeaders.set('x-temp-account-id', accountId);

  const shouldLog = !pathname.startsWith('/_next') && pathname !== '/favicon.ico';
  const isBotRequest = isBot(userAgent);

  // Create the base response with the new headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set the cookie on the response if it's a new account
  if (isNewAccount) {
    response.cookies.set(COOKIE_NAME, accountId, {
      httpOnly: true, // Make it httpOnly for security
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // 2. HTTPS enforcement
  if (pathname.startsWith('/manage') && pathname !== '/manage/login') {
    if (request.nextUrl.protocol !== 'https:' && process.env.NODE_ENV == "production") {
      const redirectUrl = new URL('/', origin);
      redirectUrl.searchParams.set('loginError', 'unsafeProtocol');

      const logoutResponse = NextResponse.redirect(redirectUrl);
      logoutResponse.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
      logoutResponse.cookies.set('manager_username', '', { maxAge: 0, path: '/' });
      logoutResponse.cookies.set('manager_password', '', { maxAge: 0, path: '/' });

      return logoutResponse;
    }
  }

  // 3. Redirects
  const matchResult = await matchRedirectEdge(pathname);
  if (matchResult?.matched) {
    const statusCode = matchResult.permanent ? 308 : 307;
    if (shouldLog) {
      event.waitUntil(
        fetch(`${origin}/api/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cookieId: accountId,
            pageAccessed: pathname,
            resourceType: 'redirect',
            method,
            statusCode,
            referrer,
            userAgent,
            ipAddress: ip,
            isBot: isBotRequest,
            metadata: { destination: matchResult.destination, permanent: matchResult.permanent },
          }),
        }).catch(err => console.error('Failed to log redirect:', err))
      );
    }
    return NextResponse.redirect(new URL(matchResult.destination, request.url), statusCode);
  }

  // 4. Legal documents paywall
  // MOVED TO PAGE LEVEL: The check is now done in /legal/documents/[id] and other pages
  // so that we can fetch the 'requireEmailProtection' setting from Firestore.
  // Middleware cannot easily fetch that dynamic setting.

  /*
  // Skip the check if there's a verification token (user just authenticated)
  const hasVerificationToken = request.nextUrl.searchParams.has('verified');

  if (pathname.startsWith('/legal/documents') && !pathname.startsWith('/legal/documents/gate') && !request.cookies.has('user_email') && !hasVerificationToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/legal/documents/gate';
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/legal/documents') && (request.cookies.has('user_email') || hasVerificationToken)) {

    // If they have the verification token, we'll let the request through
    // but we won't redirect - just continue processing
    // The verification token will be in the URL but that's okay
  }
  */

  // 5. Manager authentication
  if (pathname.startsWith('/manage') && pathname !== '/manage/login') {
    if (!await isManagerAuthenticated(request)) {
      const url = request.nextUrl.clone();
      url.pathname = '/manage/login';
      return NextResponse.redirect(url);
    }
  }

  // 6. Logging
  if (shouldLog) {
    const resourceType = getResourceType(pathname);
    event.waitUntil(
      fetch(`${origin}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cookieId: accountId,
          pageAccessed: pathname,
          resourceType,
          method,
          statusCode: response.status,
          referrer,
          userAgent,
          ipAddress: ip,
          isBot: isBotRequest,
        }),
      }).catch(err => console.error('Error logging request:', err))
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
