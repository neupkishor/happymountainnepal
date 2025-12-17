
import { NextRequest, NextResponse } from 'next/server';
import { readBaseFile } from '@/lib/base';
import { matchRedirect } from '@/lib/redirect-matcher';

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

        try {
            const redirects = await readBaseFile('redirects.json');
            const matchResult = matchRedirect(path, redirects as any);

            return NextResponse.json(matchResult || { matched: false }, { status: 200 });
        } catch (error) {
            // No redirects file or invalid
            return NextResponse.json({ matched: false }, { status: 200 });
        }
    } catch (error) {
        console.error('Error matching redirect:', error);
        return NextResponse.json(
            { error: 'Failed to match redirect' },
            { status: 500 }
        );
    }
}
