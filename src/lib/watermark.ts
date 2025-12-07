import sharp from 'sharp';

export async function getWatermarkedBase64(imageUrl: string, watermarkText: string = 'CONFIDENTIAL'): Promise<string> {
    try {
        // 1. Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // 2. Prepare the watermark tile (SVG)
        // We create a pattern similar to the client-side canvas
        const size = 300;
        const fontSize = 16;
        const color = 'rgba(255, 255, 255, 0.3)'; // Slightly more visible on varying backgrounds, semi-transparent white
        // Or dark: rgba(0,0,0,0.3). Client used rgba(200, 200, 200, 0.4) -> light gray
        const svgColor = 'rgba(200, 200, 200, 0.5)';

        // SVG wrapper. We use a pattern of text.
        // We need to escape the text for XML
        const safeText = watermarkText.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });

        const svgImage = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <style>
                .text { fill: ${svgColor}; font-family: sans-serif; font-weight: bold; font-size: ${fontSize}px; }
            </style>
            <!-- Center rotation point is 150,150 -->
            <text x="150" y="150" text-anchor="middle" class="text" transform="rotate(-45 150 150)">${safeText}</text>
            <text x="150" y="180" text-anchor="middle" class="text" transform="rotate(-45 150 150)">DO NOT DISTRIBUTE</text>
        </svg>
        `;

        const watermarkBuffer = Buffer.from(svgImage);

        // 3. Process with Sharp
        const image = sharp(inputBuffer);
        const metadata = await image.metadata();

        // Resize if the image is huge to save bandwidth/processing? 
        // User asked for "same encoded image", maybe keep quality high but reasonably sized for web.
        // Let's ensure it's not absolutely massive (e.g. > 1920px width) if it's just for display.
        // But for "documents" readability is key. Let's keep original dimensions or cap at 1500px width.
        const width = metadata.width || 0;
        if (width > 1500) {
            image.resize({ width: 1500 });
        }

        const outputBuffer = await image
            .composite([{
                input: watermarkBuffer,
                tile: true, // Tile the watermark across the entire image
            }])
            .toFormat('jpeg', { quality: 85 }) // Convert to efficient JPEG
            .toBuffer();

        // 4. Convert to base64
        const base64 = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
        return base64;

    } catch (error) {
        console.error("Error generating watermarked image:", error);
        // Fallback or rethrow? 
        // If we fail, maybe return the original URL? 
        // But user explicitly wanted protection.
        // Let's return a placeholder or empty string to indicate failure, or throw.
        throw error;
    }
}
