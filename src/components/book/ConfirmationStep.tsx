
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function ConfirmationStep() {
    return (
        <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold !font-headline">Thank You!</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                Your custom trip inquiry has been submitted successfully. Our travel experts will review your request and get back to you with a personalized quote and itinerary within 24-48 hours.
            </p>
            <div className="mt-8 flex gap-4">
                <Button asChild>
                    <Link href="/tours">
                        Explore More Tours
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/">
                        Back to Homepage
                    </Link>
                </Button>
            </div>
        </div>
    )
}
