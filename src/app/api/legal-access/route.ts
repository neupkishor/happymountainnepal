
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const email = formData.get('email');
        const returnTo = formData.get('returnTo');

        if (!email || typeof email !== 'string') {
            return new NextResponse('Email is required', { status: 400 });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new NextResponse('Invalid email address', { status: 400 });
        }

        // Use the returnTo parameter to construct the redirect path
        // This ensures we always redirect to the correct path regardless of domain
        const redirectPath = (returnTo && typeof returnTo === 'string') ? returnTo : '/legal/documents';

        // Get the host from the request headers to preserve the original domain
        // This prevents redirecting to 0.0.0.0 and keeps users on the same domain
        const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';

        // Construct the full redirect URL with the correct host
        const redirectUrl = new URL(redirectPath, `${protocol}://${host}`);
        // Add a verification token so middleware knows the user just authenticated
        // This prevents the middleware from redirecting back to the gate before the cookie is set
        redirectUrl.searchParams.set('verified', 'true');

        const response = NextResponse.redirect(redirectUrl, 303); // 303 See Other is correct for POST->GET redirect

        // Set the cookie
        // Secure should be true only for HTTPS (not based on NODE_ENV)
        // HttpOnly means JS can't access it (good for security)
        const isHttps = protocol === 'https';

        response.cookies.set('user_email', email, {
            httpOnly: true,
            secure: isHttps, // Only secure over HTTPS
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
    } catch (error) {
        console.error('Error processing legal access request:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
