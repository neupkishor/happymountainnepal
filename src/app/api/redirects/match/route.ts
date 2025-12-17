
import { NextRequest, NextResponse } from 'next/server';
import { matchRedirect } from '@/lib/redirect-matcher'; // This now uses the Node.js version

// GET - Match a path against redirects
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        if (!path) {
            return NextResponse.json(
                { error: 'path parameter is required' },
                { status: 400 }
            );
        }

        const matchResult = await matchRedirect(path);

        return NextResponse.json(matchResult || { matched: false }, { status: 200 });

    } catch (error) {
        console.error('Error matching redirect:', error);
        return NextResponse.json(
            { error: 'Failed to match redirect' },
            { status: 500 }
        );
    }
}
