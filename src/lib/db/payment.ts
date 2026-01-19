'use server';

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase-server';
import type { PaymentSettings } from '@/lib/types';

const PAYMENT_SETTINGS_DOC_ID = 'wire-transfer-settings';

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
    if (!firestore) return null;

    const docRef = doc(firestore, 'payment-settings', PAYMENT_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        // Return default settings if none exist
        return {
            id: PAYMENT_SETTINGS_DOC_ID,
            bankName: '',
            accountName: '',
            accountNumber: '',
            swiftCode: '',
            iban: '',
            bankAddress: '',
            additionalInstructions: '',
            updatedAt: new Date().toISOString(),
        };
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        updatedAt: data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
    } as PaymentSettings;
}

export async function updatePaymentSettings(
    settings: Omit<PaymentSettings, 'id' | 'updatedAt'>
): Promise<void> {
    if (!firestore) throw new Error('Database not available');

    const docRef = doc(firestore, 'payment-settings', PAYMENT_SETTINGS_DOC_ID);

    await setDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now(),
    }, { merge: true });
}
