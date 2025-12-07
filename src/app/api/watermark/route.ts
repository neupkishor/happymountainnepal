import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
    try {
        const { url, email } = await req.json();
        const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        // Fetch original image
        const res = await fetch(url);
        const originalBuffer = Buffer.from(await res.arrayBuffer());

        // Read size
        const meta = await sharp(originalBuffer).metadata();
        const width = meta.width || 1200;
        const height = meta.height || 1600;

        // SVG pattern (repeated watermark)
        const svg = `
        <svg width="${width}" height="${height}">
            <defs>
                <pattern id="wm" width="400" height="400" patternUnits="userSpaceOnUse">
                    <text
                        x="0"
                        y="150"
                        fill="rgba(112, 112, 112, 0.50)"
                        font-size="24"
                        font-weight="bold"
                        font-family="Times New Roman"
                        transform="rotate(-25 0,150)">
                        <tspan x="20" dy="0">DO NOT DISTRIBUTE</tspan>
                    </text>
                    <text
                        x="0"
                        y="150"
                        fill="rgba(112, 112, 112, 0.50)"
                        font-size="20"
                        font-weight="100"
                        font-family="Arial"
                        transform="rotate(-25 0,150)">
                        <tspan x="20" dy="24">${email}</tspan>
                        <tspan x="20" dy="24">${timestamp}</tspan>
                    </text>
                </pattern>

            </defs>

            <rect width="100%" height="100%" fill="url(#wm)" />
        </svg>`;


        const watermark = Buffer.from(svg);

        // Composite (burn watermark into the document)
        const output = await sharp(originalBuffer)
            .composite([
                {
                    input: watermark,
                    top: 0,
                    left: 0,
                },
            ])
            .png()
            .toBuffer();

        const base64 = `data:image/png;base64,${output.toString("base64")}`;

        return NextResponse.json({ image: base64 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Failed" }, { status: 500 });
    }
}
