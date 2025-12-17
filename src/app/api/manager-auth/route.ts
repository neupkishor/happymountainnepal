
import { NextRequest, NextResponse } from 'next/server';
import { createSession, type SessionData } from '@/lib/session-utils';
import { readBaseFile, writeBaseFile } from '@/lib/base';

const MANAGER_COOKIE_NAME = 'manager_auth';
const SESSION_COOKIE_PREFIX = 'manager_session_';

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

        // Get manager credentials from base storage or environment variable (production)
        let managers;

        try {
            // Try reading from base storage first (for local development)
            managers = await readBaseFile('manager.json');
        } catch (fileError) {
            // Fall back to environment variable (for production)
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
                console.error('Manager credentials not found in base storage or environment variable');
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

        // Create new session
        const session = createSession(username);

        // Save session to base storage
        try {
            let sessions: SessionData[] = [];

            // Try to read existing sessions
            try {
                sessions = await readBaseFile('session.json');
                if (!Array.isArray(sessions)) {
                    sessions = [];
                }
            } catch {
                // File doesn't exist or is invalid, start fresh
                sessions = [];
            }

            // Add new session
            sessions.push(session);

            // Write back to file
            await writeBaseFile('session.json', sessions);
        } catch (error) {
            console.error('Failed to save session:', error);
            // Continue anyway - cookies will still work
        }

        // Create response with success
        const response = NextResponse.json(
            { success: true, message: 'Authentication successful' },
            { status: 200 }
        );

        // Set session cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        response.cookies.set(`${SESSION_COOKIE_PREFIX}id`, session.session_id, cookieOptions);
        response.cookies.set(`${SESSION_COOKIE_PREFIX}key`, session.session_key, cookieOptions);
        response.cookies.set(`${SESSION_COOKIE_PREFIX}device`, session.device_id, cookieOptions);

        // Keep the old cookie for backward compatibility
        response.cookies.set(MANAGER_COOKIE_NAME, JSON.stringify({ username, password }), cookieOptions);

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
    // Get session cookies to invalidate the session
    const sessionId = request.cookies.get(`${SESSION_COOKIE_PREFIX}id`)?.value;
    const sessionKey = request.cookies.get(`${SESSION_COOKIE_PREFIX}key`)?.value;
    const deviceId = request.cookies.get(`${SESSION_COOKIE_PREFIX}device`)?.value;

    // Invalidate session in base storage if session cookies exist
    if (sessionId && sessionKey && deviceId) {
        try {
            const sessions: SessionData[] = await readBaseFile('session.json');

            // Find and invalidate the session
            const sessionIndex = sessions.findIndex(
                (s) =>
                    s.session_id === sessionId &&
                    s.session_key === sessionKey &&
                    s.device_id === deviceId
            );

            if (sessionIndex !== -1) {
                sessions[sessionIndex].isExpired = 1;
                await writeBaseFile('session.json', sessions);
            }
        } catch (error) {
            console.error('Failed to invalidate session in base storage:', error);
            // Continue with logout even if session invalidation fails
        }
    }

    const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
    );

    // Clear all cookies
    response.cookies.delete(MANAGER_COOKIE_NAME);
    response.cookies.delete(`${SESSION_COOKIE_PREFIX}id`);
    response.cookies.delete(`${SESSION_COOKIE_PREFIX}key`);
    response.cookies.delete(`${SESSION_COOKIE_PREFIX}device`);

    return response;
}
