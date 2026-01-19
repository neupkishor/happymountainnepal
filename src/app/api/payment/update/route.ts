import { NextRequest, NextResponse } from 'next/server';
import { updatePaymentSettings } from '@/lib/db/payment';
import type { PaymentSettings } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as PaymentSettings;

        // Validate required fields
        if (!body.bankName || !body.accountName || !body.accountNumber) {
            return NextResponse.json(
                { error: 'Bank name, account name, and account number are required' },
                { status: 400 }
            );
        }

        // Extract only the fields we want to update
        const { id, updatedAt, ...settingsToUpdate } = body;

        await updatePaymentSettings(settingsToUpdate);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return NextResponse.json(
            { error: 'Failed to update payment settings' },
            { status: 500 }
        );
    }
}
