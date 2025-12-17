import { NextRequest, NextResponse } from 'next/server';
import type { SessionData } from '@/lib/session-utils';
import { readBaseFile, writeBaseFile, baseFileExists } from '@/lib/base';

// GET - List all sessions
export async function GET(request: NextRequest) {
    try {
        try {
            const sessions: SessionData[] = await readBaseFile('session.json');
            return NextResponse.json({ sessions }, { status: 200 });
        } catch (error) {
            // File doesn't exist or is invalid
            return NextResponse.json({ sessions: [] }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

// DELETE - Invalidate a session
export async function DELETE(request: NextRequest) {
    try {
        const { session_id } = await request.json();

        if (!session_id) {
            return NextResponse.json(
                { error: 'session_id is required' },
                { status: 400 }
            );
        }

        try {
            const sessions: SessionData[] = await readBaseFile('session.json');

            // Find and invalidate the session
            const sessionIndex = sessions.findIndex(s => s.session_id === session_id);

            if (sessionIndex === -1) {
                return NextResponse.json(
                    { error: 'Session not found' },
                    { status: 404 }
                );
            }

            // Set isExpired to 1
            sessions[sessionIndex].isExpired = 1;

            // Write back to file
            await writeBaseFile('session.json', sessions);

            return NextResponse.json(
                { success: true, message: 'Session invalidated successfully' },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error reading session file:', error);
            return NextResponse.json(
                { error: 'Session file not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error invalidating session:', error);
        return NextResponse.json(
            { error: 'Failed to invalidate session' },
            { status: 500 }
        );
    }
}
