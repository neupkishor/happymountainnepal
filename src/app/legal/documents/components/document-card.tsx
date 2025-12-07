'use client';

import { useEffect, useState } from 'react';

interface DocumentViewerProps {
    url: string;
    email: string;
    deviceId: string;
}

export function DocumentViewer({ url, email, deviceId }: DocumentViewerProps) {
    const [finalImage, setFinalImage] = useState<string>("");

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/watermark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, email, deviceId }),
            });

            const data = await res.json();
            setFinalImage(data.image);
        }
        load();
    }, [url, email, deviceId]);

    return (
        <div
            className="relative w-full bg-white overflow-hidden bg-muted/20"
            style={{ height: "100%", width: "100%" }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
        >
            {/* Secure Background Image Implementation */}
            {finalImage ? (
                <div
                    className="w-full h-full absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none select-none"
                    style={{
                        backgroundImage: `url(${finalImage})`,
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                    }}
                />
            ) : (
                // Fallback / Loading
                <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">
                    <div className="h-8 w-8 bg-muted-foreground/20 rounded-full" />
                </div>
            )}

            {/* Transparent blocker */}
            <div className="absolute inset-0 z-20" />

        </div>
    );
}
