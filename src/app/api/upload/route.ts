import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { logFileUpload } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const compress = formData.get('compress') === 'true';
        const uploadType = (formData.get('uploadType') as string) || 'server';
        const serverPath = (formData.get('serverPath') as string) || '';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, '-');
        const extension = originalName.split('.').pop();
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const fileName = `${nameWithoutExt}-${timestamp}.${extension}`;

        // Determine if it's an image
        const isImage = file.type.startsWith('image/');

        let finalBuffer = buffer;
        let finalFileName = fileName;

        // Compress if requested and it's an image
        if (compress && isImage) {
            try {
                // Compress image using sharp
                finalBuffer = await sharp(buffer)
                    .resize(1920, 1920, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({ quality: 85 })
                    .toBuffer();

                // Change extension to .jpg
                finalFileName = `${nameWithoutExt}-${timestamp}.jpg`;
            } catch (error) {
                console.error('Compression error:', error);
                // If compression fails, use original
            }
        }

        if (uploadType === 'api') {
            // Upload to external API (e.g., Cloudinary, S3, etc.)
            // For now, we'll use a placeholder - you can integrate your preferred service
            try {
                // Example: Upload to Cloudinary or similar service
                // const uploadResult = await cloudinary.uploader.upload(...)

                // Placeholder: For demonstration, we'll return a mock URL
                // In production, replace this with actual API upload logic
                const mockApiUrl = `https://api.example.com/uploads/${finalFileName}`;

                // Log to database
                await logFileUpload({
                    url: mockApiUrl,
                    fileName: finalFileName,
                    fileType: compress && isImage ? 'image/jpeg' : file.type,
                    userId: 'admin',
                    category: 'general',
                });

                return NextResponse.json({
                    success: true,
                    url: mockApiUrl,
                    fileName: finalFileName,
                    compressed: compress && isImage,
                    uploadType: 'api'
                });
            } catch (error) {
                console.error('API upload error:', error);
                return NextResponse.json(
                    { error: 'API upload failed' },
                    { status: 500 }
                );
            }
        } else {
            // Upload to server
            // Determine upload directory based on serverPath
            const uploadDir = serverPath
                ? join(process.cwd(), 'public', serverPath)
                : join(process.cwd(), 'public');

            // Create directory if it doesn't exist
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            const filePath = join(uploadDir, finalFileName);
            await writeFile(filePath, finalBuffer);

            // Generate public URL
            const url = serverPath
                ? `/${serverPath}/${finalFileName}`
                : `/${finalFileName}`;

            // Log to database
            await logFileUpload({
                url,
                fileName: finalFileName,
                fileType: compress && isImage ? 'image/jpeg' : file.type,
                userId: 'admin',
                category: 'general',
            });

            return NextResponse.json({
                success: true,
                url,
                fileName: finalFileName,
                compressed: compress && isImage,
                uploadType: 'server',
                serverPath: serverPath || 'public'
            });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
