import { NextRequest, NextResponse } from 'next/server';
import { logFileUpload, checkFileUploadByUrl } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, name } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Check for duplicates
        const exists = await checkFileUploadByUrl(url);
        if (exists) {
            return NextResponse.json({ error: 'File with this URL already exists' }, { status: 409 });
        }

        // Validate URL format
        let imageUrl: URL;
        try {
            imageUrl = new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Fetch the image to get metadata
        let imageSize = 0;
        let contentType = 'image/jpeg'; // default

        try {
            const imageResponse = await fetch(url, {
                method: 'HEAD', // Use HEAD to get headers without downloading the full file
            });

            if (!imageResponse.ok) {
                // If HEAD fails, try GET
                const getResponse = await fetch(url);
                if (!getResponse.ok) {
                    throw new Error(`Failed to fetch image: ${getResponse.status}`);
                }

                // Get the actual content
                const arrayBuffer = await getResponse.arrayBuffer();
                imageSize = arrayBuffer.byteLength;
                contentType = getResponse.headers.get('content-type') || 'image/jpeg';
            } else {
                // Get size from Content-Length header
                const contentLength = imageResponse.headers.get('content-length');
                imageSize = contentLength ? parseInt(contentLength, 10) : 0;
                contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            }
        } catch (fetchError) {
            console.error('Error fetching image:', fetchError);
            // Continue anyway, we'll just have size as 0
        }

        // Extract filename from URL if name not provided
        const urlPath = imageUrl.pathname;
        const urlFilename = urlPath.substring(urlPath.lastIndexOf('/') + 1);
        const finalName = name || urlFilename || 'Linked Image';

        // Log the upload to database
        await logFileUpload({
            name: finalName,
            url: url,
            uploadedBy: 'admin',
            type: contentType,
            size: imageSize,
            tags: ['general'], // Treated as a general upload
            meta: [], // No special metadata to indicate it was linked
        });

        return NextResponse.json({
            success: true,
            data: {
                name: finalName,
                url,
                size: imageSize,
                type: contentType,
            }
        });
    } catch (error) {
        console.error('Add linked upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to add linked upload' },
            { status: 500 }
        );
    }
}
