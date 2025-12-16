import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const MANAGER_COOKIE_NAME = 'manager_auth';

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

        // Get manager credentials from environment variable or file
        let managers;

        // First try environment variable (for production)
        if (process.env.MANAGER_CREDENTIALS) {
            try {
                managers = JSON.parse(process.env.MANAGER_CREDENTIALS);
            } catch (error) {
                console.error('Failed to parse MANAGER_CREDENTIALS:', error);
                return NextResponse.json(
                    { error: 'Server configuration error' },
                    { status: 500 }
                );
            }
        } else {
            // Fall back to file (for local development)
            try {
                const managersFilePath = join(process.cwd(), 'manager.json');
                const managersData = await readFile(managersFilePath, 'utf-8');
                managers = JSON.parse(managersData);
            } catch (error) {
                console.error('Failed to read manager credentials:', error);
                return NextResponse.json(
                    { error: 'Manager credentials not configured' },
                    { status: 500 }
                );
            }
        }

        // Check if credentials match
        const manager = managers.find(
            (m: { username: string; password: string }) =>
                m.username === username && m.password === password
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

        // Set httpOnly cookie with credentials (plain text as requested)
        response.cookies.set(MANAGER_COOKIE_NAME, JSON.stringify({ username, password }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

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

    // Clear the cookie
    response.cookies.delete(MANAGER_COOKIE_NAME);

    return response;
}

// Validation endpoint (for middleware)
export async function GET(request: NextRequest) {
    try {
        const managerCookie = request.cookies.get(MANAGER_COOKIE_NAME)?.value;

        if (!managerCookie) {
            return NextResponse.json({ valid: false }, { status: 200 });
        }

        const { username, password } = JSON.parse(managerCookie);

        // Get manager credentials from environment variable or file
        let managers;

        // First try environment variable (for production)
        if (process.env.MANAGER_CREDENTIALS) {
            try {
                managers = JSON.parse(process.env.MANAGER_CREDENTIALS);
            } catch (error) {
                console.error('Failed to parse MANAGER_CREDENTIALS:', error);
                return NextResponse.json({ valid: false }, { status: 200 });
            }
        } else {
            // Fall back to file (for local development)
            try {
                const managersFilePath = join(process.cwd(), 'manager.json');
                const managersData = await readFile(managersFilePath, 'utf-8');
                managers = JSON.parse(managersData);
            } catch (error) {
                console.error('Failed to read manager credentials:', error);
                return NextResponse.json({ valid: false }, { status: 200 });
            }
        }

        // Check if credentials match
        const manager = managers.find(
            (m: { username: string; password: string }) =>
                m.username === username && m.password === password
        );

        return NextResponse.json({ valid: !!manager }, { status: 200 });
    } catch (error) {
        console.error('Manager auth validation error:', error);
        return NextResponse.json({ valid: false }, { status: 200 });
    }
}
