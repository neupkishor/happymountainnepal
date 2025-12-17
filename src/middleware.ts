
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_NAME = 'temp_account';
const MANAGER_COOKIE_NAME = 'manager_auth';
const SESSION_COOKIE_PREFIX = 'manager_session_';
const PUBLIC_FILE = /\.(.*)$/;

// Bot detection helper
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

// Helper to determine resource type
function getResourceType(pathname: string): 'page' | 'api' | 'static' {
  if (pathname.startsWith('/api')) return 'api';
  if (PUBLIC_FILE.test(pathname)) return 'static';
  return 'page';
}

// Helper to validate manager authentication
async function isManagerAuthenticated(request: NextRequest): Promise<boolean> {
  // Get session cookies
  const sessionId = request.cookies.get(`${SESSION_COOKIE_PREFIX}id`)?.value;
  const sessionKey = request.cookies.get(`${SESSION_COOKIE_PREFIX}key`)?.value;
  const deviceId = request.cookies.get(`${SESSION_COOKIE_PREFIX}device`)?.value;
  const managerCookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;

  // If no cookies at all, not authenticated
  if (!managerCookie && (!sessionId || !sessionKey || !deviceId)) {
    return false;
  }

  try {
    // Build cookie header with all available cookies
    const cookies = [];
    if (managerCookie) {
      cookies.push(`${MANAGER_COOKIE_NAME}=${managerCookie}`);
    }
    if (sessionId) {
      cookies.push(`${SESSION_COOKIE_PREFIX}id=${sessionId}`);
    }
    if (sessionKey) {
      cookies.push(`${SESSION_COOKIE_PREFIX}key=${sessionKey}`);
    }
    if (deviceId) {
      cookies.push(`${SESSION_COOKIE_PREFIX}device=${deviceId}`);
    }

    // Call the validation API endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/manager-auth`, {
      method: 'GET',
      headers: {
        'Cookie': cookies.join('; '),
      },
    });

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Manager auth validation error:', error);
    return false;
  }
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';
  const referrer = request.headers.get('referer') || undefined;
  const method = request.method;

  // Get or create cookie ID
  let accountId = request.cookies.get(COOKIE_NAME)?.value;
  let isNewAccount = false;

  if (!accountId) {
    accountId = uuidv4();
    isNewAccount = true;
  }

  const isBotRequest = isBot(userAgent);

  // Exclude Next.js internal routes from logging
  const shouldLog = !pathname.startsWith('/_next') && pathname !== '/favicon.ico';

  // Handle redirects - fetch from API to avoid Edge Runtime limitations
  try {
    const redirectsResponse = await fetch(`${request.nextUrl.origin}/api/redirects/match?path=${encodeURIComponent(pathname)}`);
    if (redirectsResponse.ok) {
      const matchResult = await redirectsResponse.json();

      if (matchResult?.matched) {
        const statusCode = matchResult.permanent ? 308 : 307;

        // Log redirect
        if (shouldLog) {
          try {
            await fetch(`${request.nextUrl.origin}/api/log`, {
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
            }).catch(err => console.error('Failed to log redirect:', err));
          } catch (error) {
            console.error('Error logging redirect:', error);
          }
        }

        return NextResponse.redirect(new URL(matchResult.destination, request.url), statusCode);
      }
    }
  } catch (error) {
    // Silently fail redirects to avoid breaking the middleware
    console.error('Redirect matching error:', error);
  }

  // Paywall for /legal/documents
  if (pathname === '/legal/documents') {
    if (!request.cookies.has('user_email')) {
      const url = request.nextUrl.clone();
      url.pathname = '/legal/documents/gate';
      return NextResponse.redirect(url);
    }
  }

  // Manager authentication gate for /manage routes
  if (pathname.startsWith('/manage') && pathname !== '/manage/login') {
    const isAuthenticated = await isManagerAuthenticated(request);

    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/manage/login';
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  // Set cookie if new account
  if (isNewAccount) {
    response.cookies.set(COOKIE_NAME, accountId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  // Log the request (non-blocking)
  if (shouldLog) {
    const resourceType = getResourceType(pathname);

    // Use event.waitUntil to ensure the logging request completes even after the response is sent
    const logPromise = async () => {
      try {
        await fetch(`${request.nextUrl.origin}/api/log`, {
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
        });
      } catch (error) {
        console.error('Error logging request:', error);
      }
    };

    event.waitUntil(logPromise());
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
