import { NextRequest, NextResponse } from 'next/server';
import { logFileUpload } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, url, uploadedBy, type, category, size } = body;

        if (!name || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // NeupCDN uploads come through this route from UploadDialog
        await logFileUpload({
            name,
            url, // Direct URL from NeupCDN
            location: 'NeupCDN',
            uploadedBy: uploadedBy || 'admin',
            type: type || 'application/octet-stream',
            category: category || 'general',
            size: size || 0,
            meta: [],
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
