import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const MANAGER_COOKIE_NAME = 'manager_auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Read manager credentials from manager.json
        const managersFilePath = join(process.cwd(), 'manager.json');
        const managersData = await readFile(managersFilePath, 'utf-8');
        const managers = JSON.parse(managersData);

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
            secure: true, // HTTPS only
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
