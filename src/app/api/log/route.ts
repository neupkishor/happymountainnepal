import { NextRequest, NextResponse } from 'next/server';
import { createLog } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            cookieId,
            pageAccessed,
            resourceType,
            method,
            statusCode,
            referrer,
            userAgent,
            ipAddress,
            isBot,
            metadata
        } = body;

        if (!cookieId || !pageAccessed || !resourceType || !userAgent) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await createLog({
            cookieId,
            pageAccessed,
            resourceType,
            method,
            statusCode,
            referrer,
            userAgent,
            ipAddress,
            isBot,
            metadata,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Log creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create log' },
            { status: 500 }
        );
    }
}
