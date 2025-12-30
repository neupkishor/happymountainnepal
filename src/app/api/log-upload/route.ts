
import { NextRequest, NextResponse } from 'next/server';
import { logFileUpload } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, url, uploadedBy, type, tags, size, meta } = body;

        if (!name || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // All uploads from here are from NeupCDN
        await logFileUpload({
            name,
            url,
            uploadedBy: uploadedBy || 'admin',
            type: type || 'application/octet-stream',
            size: size || 0,
            tags: tags || ['general'],
            meta: meta || [],
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
