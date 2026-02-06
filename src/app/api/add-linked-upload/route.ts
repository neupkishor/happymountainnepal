export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { logFileUpload, checkFileUploadByUrl } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, name } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const exists = await checkFileUploadByUrl(url);
        if (exists) {
            return NextResponse.json({ error: 'File with this URL already exists' }, { status: 409 });
        }

        let imageUrl: URL;
        try {
            imageUrl = new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        let imageSize = 0;
        let contentType = 'image/jpeg';

        try {
            const imageResponse = await fetch(url, { method: 'HEAD' });

            if (imageResponse.ok) {
                imageSize = Number(imageResponse.headers.get('content-length') || 0);
                contentType = imageResponse.headers.get('content-type') || contentType;
            } else {
                const getResponse = await fetch(url);
                const arrayBuffer = await getResponse.arrayBuffer();
                imageSize = arrayBuffer.byteLength;
                contentType = getResponse.headers.get('content-type') || contentType;
            }
        } catch {
            // allowed to fail silently
        }

        const urlFilename = imageUrl.pathname.split('/').pop();
        const finalName = name || urlFilename || 'Linked Image';

        await logFileUpload({
            name: finalName,
            url,
            uploadedBy: 'admin',
            type: contentType,
            size: imageSize,
            tags: ['general'],
            meta: [],
        });

        return NextResponse.json({
            success: true,
            data: { name: finalName, url, size: imageSize, type: contentType },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to add linked upload' },
            { status: 500 }
        );
    }
}
