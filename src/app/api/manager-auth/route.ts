
import { NextRequest, NextResponse } from 'next/server';
import { getManagerData } from '@/lib/base-edge'; // Use the edge-safe fetcher

// Login endpoint
export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Get manager credentials from the API
        let managers: { username: string; password: string }[];
        try {
            managers = await getManagerData();
        } catch (fetchError) {
            console.error('Failed to fetch manager credentials:', fetchError);
            return NextResponse.json(
                { error: 'Could not retrieve manager credentials from the source.' },
                { status: 500 }
            );
        }

        // Check if credentials match
        const manager = managers.find(
            (m) => m.username === username && m.password === password
        );

        if (!manager) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Create response with success
        const response = NextResponse.json(
            { success: true, message: 'Authentication successful' },
            { status: 200 }
        );

        // Set simple credential cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        response.cookies.set('manager_username', username, cookieOptions);
        response.cookies.set('manager_password', password, cookieOptions);

        return response;
    } catch (error) {
        console.error('Manager auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
    const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
    );

    // Clear credential cookies
    response.cookies.delete('manager_username');
    response.cookies.delete('manager_password');

    return response;
}
