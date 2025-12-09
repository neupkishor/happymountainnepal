
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import redirects from './redirects.json';

const COOKIE_NAME = 'temp_account';
const MANAGER_COOKIE_NAME = 'manager_auth';
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
  const managerCookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;

  if (!managerCookie) {
    return false;
  }

  try {
    const { username, password } = JSON.parse(managerCookie);

    // Read manager credentials from manager.json
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const managersFilePath = join(process.cwd(), 'manager.json');
    const managersData = await readFile(managersFilePath, 'utf-8');
    const managers = JSON.parse(managersData);

    // Check if credentials match
    const manager = managers.find(
      (m: { username: string; password: string }) =>
        m.username === username && m.password === password
    );

    return !!manager;
  } catch (error) {
    console.error('Manager auth validation error:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
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

  // Handle redirects from the JSON file
  const foundRedirect = redirects.find((r: any) => r.source === pathname);

  if (foundRedirect) {
    const statusCode = foundRedirect.permanent ? 308 : 307;

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
              destination: foundRedirect.destination,
              permanent: foundRedirect.permanent,
            },
          }),
        }).catch(err => console.error('Failed to log redirect:', err));
      } catch (error) {
        console.error('Error logging redirect:', error);
      }
    }

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

    // Use setTimeout to make it truly non-blocking
    setTimeout(async () => {
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
        }).catch(err => console.error('Failed to log request:', err));
      } catch (error) {
        console.error('Error logging request:', error);
      }
    }, 0);
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
