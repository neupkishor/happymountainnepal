import { NextRequest, NextResponse } from 'next/server';

// Sessions API - No longer used with simple cookie authentication
// Kept for backward compatibility but returns empty data

// GET - List all sessions (returns empty array)
export async function GET(request: NextRequest) {
    return NextResponse.json({ sessions: [] }, { status: 200 });
}

// DELETE - Invalidate a session (no-op)
export async function DELETE(request: NextRequest) {
    return NextResponse.json(
        { success: true, message: 'Session management is disabled. Using cookie-based authentication.' },
        { status: 200 }
    );
}
