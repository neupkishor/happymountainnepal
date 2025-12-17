
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { matchRedirectEdge } from '@/lib/redirects-edge'; // Use the Edge-safe version

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

// Validate manager auth
async function isManagerAuthenticated(request: NextRequest): Promise<boolean> {
  const sessionId = request.cookies.get(`${SESSION_COOKIE_PREFIX}id`)?.value;
  const sessionKey = request.cookies.get(`${SESSION_COOKIE_PREFIX}key`)?.value;
  const deviceId = request.cookies.get(`${SESSION_COOKIE_PREFIX}device`)?.value;
  const managerCookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;

  if (!managerCookie && (!sessionId || !sessionKey || !deviceId)) return false;

  try {
    const cookies = [];
    if (managerCookie) cookies.push(`${MANAGER_COOKIE_NAME}=${managerCookie}`);
    if (sessionId) cookies.push(`${SESSION_COOKIE_PREFIX}id=${sessionId}`);
    if (sessionKey) cookies.push(`${SESSION_COOKIE_PREFIX}key=${sessionKey}`);
    if (deviceId) cookies.push(`${SESSION_COOKIE_PREFIX}device=${deviceId}`);

    const response = await fetch(`${request.nextUrl.origin}/api/manager-auth`, {
      method: 'GET',
      headers: { Cookie: cookies.join('; ') },
    });

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Manager auth validation error:', error);
    return false;
  }
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

  // -----------------------------
  // 1️⃣ HTTPS enforcement for /manage
  // -----------------------------
  if (pathname.startsWith('/manage')) {
    if (request.nextUrl.protocol !== 'https:') {
      const redirectUrl = new URL('/manage/login', origin);
      redirectUrl.searchParams.set('unsafe', '1'); // pass warning flag

      // Invalidate cookies
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
      response.cookies.set(MANAGER_COOKIE_NAME, '', { maxAge: 0, path: '/' });
      response.cookies.set(`${SESSION_COOKIE_PREFIX}id`, '', { maxAge: 0, path: '/' });
      response.cookies.set(`${SESSION_COOKIE_PREFIX}key`, '', { maxAge: 0, path: '/' });
      response.cookies.set(`${SESSION_COOKIE_PREFIX}device`, '', { maxAge: 0, path: '/' });

      return response;
    }
  }

  // -----------------------------
  // 2️⃣ Get or create temp account cookie
  // -----------------------------
  let accountId = request.cookies.get(COOKIE_NAME)?.value;
  let isNewAccount = false;
  if (!accountId) {
    accountId = uuidv4();
    isNewAccount = true;
  }

  // -----------------------------
  // 3️⃣ Handle redirects
  // -----------------------------
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
            metadata: {
              destination: matchResult.destination,
              permanent: matchResult.permanent,
            },
          }),
        }).catch(err => console.error('Failed to log redirect:', err))
      );
    }

    return NextResponse.redirect(new URL(matchResult.destination, request.url), statusCode);
  }


  // -----------------------------
  // 4️⃣ Paywall for /legal/documents
  // -----------------------------
  if (pathname === '/legal/documents' && !request.cookies.has('user_email')) {
    const url = request.nextUrl.clone();
    url.pathname = '/legal/documents/gate';
    return NextResponse.redirect(url);
  }

  // -----------------------------
  // 5️⃣ Manager authentication
  // -----------------------------
  if (pathname.startsWith('/manage') && pathname !== '/manage/login') {
    const isAuthenticated = await isManagerAuthenticated(request);
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/manage/login';
      return NextResponse.redirect(url);
    }
  }

  // -----------------------------
  // 6️⃣ Response & set temp account cookie
  // -----------------------------
  const response = NextResponse.next();
  if (isNewAccount) {
    response.cookies.set(COOKIE_NAME, accountId, {
      httpOnly: true,
      secure: true,   // always secure
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // -----------------------------
  // 7️⃣ Logging
  // -----------------------------
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
