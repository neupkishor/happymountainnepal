import { NextRequest, NextResponse } from 'next/server';
import { logFileUpload } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileName, url, userId, fileType, category } = body;

        if (!fileName || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await logFileUpload({
            fileName,
            url,
            userId: userId || 'admin',
            fileType: fileType || 'application/octet-stream',
            category: category || 'general',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Log upload error:', error);
        return NextResponse.json(
            { error: 'Failed to log upload' },
            { status: 500 }
        );
    }
}
