
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { matchRedirectEdge } from '@/lib/redirects-edge';
import { getManagerData, getSessionData } from '@/lib/base';
import type { SessionData } from '@/lib/session-utils';

const COOKIE_NAME = 'temp_account';
const MANAGER_COOKIE_NAME = 'manager_auth';
const SESSION_COOKIE_PREFIX = 'manager_session_';
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

function isManagerAuthenticated(request: NextRequest): boolean {
  console.log('[Auth] Checking manager authentication in middleware...');
  
  const sessionId = request.cookies.get(`${SESSION_COOKIE_PREFIX}id`)?.value;
  const sessionKey = request.cookies.get(`${SESSION_COOKIE_PREFIX}key`)?.value;
  const deviceId = request.cookies.get(`${SESSION_COOKIE_PREFIX}device`)?.value;
  const managerCookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;
  
  console.log(`[Auth] Found cookies: session=${!!sessionId}, legacy=${!!managerCookie}`);

  if (sessionId && sessionKey && deviceId) {
    try {
      const sessions: SessionData[] = getSessionData();
      const session = sessions.find(s => 
        s.session_id === sessionId &&
        s.session_key === sessionKey &&
        s.device_id === deviceId
      );

      if (session) {
        if (session.isExpired === 1) {
          console.log('[Auth] Session found but marked as expired.');
          return false;
        }
        const expiresAt = new Date(session.expires_at);
        if (expiresAt > new Date()) {
          console.log('[Auth] Valid session found.');
          return true;
        }
        console.log('[Auth] Session found but has expired by date.');
      }
    } catch (e) {
      console.log('[Auth] Could not read session data file, falling back to legacy cookie.');
    }
  }

  if (managerCookie) {
    try {
      const { username, password } = JSON.parse(managerCookie);
      const managers = getManagerData();
      const manager = managers.find(
        (m: { username: string; password: string }) =>
          m.username === username && m.password === password
      );
      if (manager) {
        console.log('[Auth] Valid legacy cookie found.');
        return true;
      }
    } catch (e) {
      console.log('[Auth] Error parsing legacy manager cookie.');
      return false;
    }
  }

  console.log('[Auth] No valid session or cookie found.');
  return false;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname, origin } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ?? '127.0.0.1';
  const referrer = request.headers.get('referer') || undefined;
  const method = request.method;

  const shouldLog = !pathname.startsWith('/_next') && pathname !== '/favicon.ico';
  const isBotRequest = isBot(userAgent);

  // 1. HTTPS enforcement
  if (pathname.startsWith('/manage') && pathname !== '/manage/login') {
    if (request.nextUrl.protocol !== 'https:' && process.env.NODE_ENV=="production") {
      const redirectUrl = new URL('/', origin);
      redirectUrl.searchParams.set('loginError', 'unsafeProtocol');

      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
      response.cookies.set(MANAGER_COOKIE_NAME, '', { maxAge: 0, path: '/' });
      response.cookies.set(`${SESSION_COOKIE_PREFIX}id`, '', { maxAge: 0, path: '/' });
      response.cookies.set(`${SESSION_COOKIE_PREFIX}key`, '', { maxAge: 0, path: '/' });
      response.cookies.set(`${SESSION_COOKIE_PREFIX}device`, '', { maxAge: 0, path: '/' });

      return response;
    }
  }

  // 2. Temp account cookie
  let accountId = request.cookies.get(COOKIE_NAME)?.value;
  let isNewAccount = false;
  if (!accountId) {
    accountId = uuidv4();
    isNewAccount = true;
  }

  // 3. Redirects
  const matchResult = matchRedirectEdge(pathname);
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
  if (pathname === '/legal/documents' && !request.cookies.has('user_email')) {
    const url = request.nextUrl.clone();
    url.pathname = '/legal/documents/gate';
    return NextResponse.redirect(url);
  }

  // 5. Manager authentication
  if (pathname.startsWith('/manage') && pathname !== '/manage/login') {
    if (!isManagerAuthenticated(request)) {
      console.log(`[Auth] Redirecting unauthenticated user to /manage/login`);
      const url = request.nextUrl.clone();
      url.pathname = '/manage/login';
      return NextResponse.redirect(url);
    }
  }

  // 6. Response & set temp account cookie
  const response = NextResponse.next();
  if (isNewAccount) {
    response.cookies.set(COOKIE_NAME, accountId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // 7. Logging
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
          statusCode: 200,
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
