
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const email = formData.get('email');

        if (!email || typeof email !== 'string') {
            return new NextResponse('Email is required', { status: 400 });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new NextResponse('Invalid email address', { status: 400 });
        }

        // Use nextUrl.clone() to preserve the correct host/origin in production
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/legal/documents';
        const response = NextResponse.redirect(redirectUrl, 303); // 303 See Other is correct for POST->GET redirect

        // Set the cookie
        // Secure means it should only be sent over HTTPS (good for prod, localhost might be lenient)
        // HttpOnly means JS can't access it (good for security)
        response.cookies.set('user_email', email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
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
