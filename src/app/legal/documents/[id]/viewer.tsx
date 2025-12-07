
'use client';

import { useEffect, useState } from 'react';

interface DocumentViewerProps {
    url: string;
    email: string;
}

export function DocumentViewer({ url, email }: DocumentViewerProps) {
    const [watermarkPattern, setWatermarkPattern] = useState<string>('');

    useEffect(() => {
        // Create a canvas to generate the watermark pattern
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.rotate((-45 * Math.PI) / 180);
            ctx.font = '16px sans-serif';
            ctx.fillStyle = 'rgba(200, 200, 200, 0.4)'; // Light gray, semi-transparent
            ctx.textAlign = 'center';
            ctx.fillText(email, 0, size / 2);
            ctx.fillText('DO NOT DISTRIBUTE', 0, (size / 2) + 20);

            // Draw again for better coverage after rotation
            ctx.fillText(email, -size / 2, size);
            ctx.fillText('DO NOT DISTRIBUTE', -size / 2, size + 20);
        }
        setWatermarkPattern(canvas.toDataURL());
    }, [email]);

    return (
        <div
            className="relative w-full overflow-hidden bg-white"
            style={{ minHeight: '600px' }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
        >
            {/* The Document Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={url}
                alt="Protected Document"
                className="w-full h-auto block pointer-events-none select-none relative z-0"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />

            {/* Watermark Overlay */}
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    backgroundImage: `url(${watermarkPattern})`,
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* Interaction Barrier (Transparent Overlay) */}
            <div
                className="absolute inset-0 z-20"
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }}
            ></div>

            {/* CSS-based extra protection using pseudo-element technique if needed, but the divs above cover it */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-30 overflow-hidden">
                <div className="transform -rotate-45 text-4xl font-black text-gray-500 whitespace-nowrap">
                    {/* Fallback large watermark */}
                    {Array(20).fill(`${email} - NO DISTRIBUTION `).join(' ')}
                </div>
            </div>
        </div>
    );
}
