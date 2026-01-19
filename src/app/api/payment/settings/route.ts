import { NextResponse } from 'next/server';
import { getPaymentSettings } from '@/lib/db/payment';

export async function GET() {
    try {
        const settings = await getPaymentSettings();

        if (!settings) {
            return NextResponse.json(
                { error: 'Payment settings not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment settings' },
            { status: 500 }
        );
    }
}
