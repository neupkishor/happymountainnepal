'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PaymentSettings, Tour } from '@/lib/types';

function ManagePaymentContent() {
    const searchParams = useSearchParams();
    const packageId = searchParams.get('package');

    const [settings, setSettings] = useState<PaymentSettings>({
        id: 'wire-transfer-settings',
        bankName: '',
        accountName: '',
        accountNumber: '',
        swiftCode: '',
        iban: '',
        bankAddress: '',
        additionalInstructions: '',
        updatedAt: new Date().toISOString(),
    });
    const [packageInfo, setPackageInfo] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        fetchSettings();
        if (packageId) {
            fetchPackageInfo();
        }
    }, [packageId]);

    const fetchPackageInfo = async () => {
        if (!packageId) return;
        try {
            const response = await fetch(`/api/tours/${packageId}`);
            if (response.ok) {
                const data = await response.json();
                setPackageInfo(data);
            }
        } catch (error) {
            console.error('Error fetching package info:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/payment/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching payment settings:', error);
            setMessage({ type: 'error', text: 'Failed to load payment settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/payment/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Payment settings updated successfully!' });
                await fetchSettings(); // Refresh to get updated timestamp
            } else {
                throw new Error('Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating payment settings:', error);
            setMessage({ type: 'error', text: 'Failed to update payment settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof PaymentSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading payment settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Settings</h1>
                <p className="text-slate-600">
                    Manage bank transfer information displayed on the checkout page
                </p>
            </div>

            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                >
                    <div className="flex items-center">
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className="font-medium">{message.text}</span>
                    </div>
                </div>
            )}

            {packageId && packageInfo && (
                <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Checkout Link for {packageInfo.name}
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">
                        Share this link with customers to complete their booking with wire transfer payment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 bg-white rounded-lg border border-slate-300 p-3 font-mono text-sm overflow-x-auto">
                            {typeof window !== 'undefined' && `${window.location.origin}/checkout?method=wire-transfer&package=${packageId}`}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const link = `${window.location.origin}/checkout?method=wire-transfer&package=${packageId}`;
                                navigator.clipboard.writeText(link);
                                setCopySuccess(true);
                                setTimeout(() => setCopySuccess(false), 2000);
                            }}
                            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {copySuccess ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Link
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                        💡 Tip: Make sure to save your payment settings below before sharing this link with customers.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                <div className="space-y-6">
                    {/* Bank Name */}
                    <div>
                        <label htmlFor="bankName" className="block text-sm font-semibold text-slate-700 mb-2">
                            Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="bankName"
                            value={settings.bankName}
                            onChange={(e) => handleChange('bankName', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., Nepal Bank Limited"
                            required
                        />
                    </div>

                    {/* Account Name */}
                    <div>
                        <label htmlFor="accountName" className="block text-sm font-semibold text-slate-700 mb-2">
                            Account Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="accountName"
                            value={settings.accountName}
                            onChange={(e) => handleChange('accountName', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g., Happy Mountain Nepal Pvt. Ltd."
                            required
                        />
                    </div>

                    {/* Account Number */}
                    <div>
                        <label htmlFor="accountNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                            Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="accountNumber"
                            value={settings.accountNumber}
                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-colors"
                            placeholder="e.g., 1234567890"
                            required
                        />
                    </div>

                    {/* SWIFT Code and IBAN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="swiftCode" className="block text-sm font-semibold text-slate-700 mb-2">
                                SWIFT Code
                            </label>
                            <input
                                type="text"
                                id="swiftCode"
                                value={settings.swiftCode}
                                onChange={(e) => handleChange('swiftCode', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-colors"
                                placeholder="e.g., NBLNPKKA"
                            />
                        </div>

                        <div>
                            <label htmlFor="iban" className="block text-sm font-semibold text-slate-700 mb-2">
                                IBAN
                            </label>
                            <input
                                type="text"
                                id="iban"
                                value={settings.iban}
                                onChange={(e) => handleChange('iban', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-colors"
                                placeholder="e.g., NP12NBLNPKKA1234567890"
                            />
                        </div>
                    </div>

                    {/* Bank Address */}
                    <div>
                        <label htmlFor="bankAddress" className="block text-sm font-semibold text-slate-700 mb-2">
                            Bank Address
                        </label>
                        <textarea
                            id="bankAddress"
                            value={settings.bankAddress}
                            onChange={(e) => handleChange('bankAddress', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            placeholder="e.g., Thamel, Kathmandu, Nepal"
                        />
                    </div>

                    {/* Additional Instructions */}
                    <div>
                        <label htmlFor="additionalInstructions" className="block text-sm font-semibold text-slate-700 mb-2">
                            Additional Instructions
                        </label>
                        <textarea
                            id="additionalInstructions"
                            value={settings.additionalInstructions}
                            onChange={(e) => handleChange('additionalInstructions', e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            placeholder="Any additional instructions for customers making wire transfers..."
                        />
                        <p className="mt-2 text-sm text-slate-500">
                            This will be displayed as special instructions on the checkout page
                        </p>
                    </div>
                </div>

                {/* Last Updated */}
                {settings.updatedAt && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                            Last updated: {typeof settings.updatedAt === 'string'
                                ? new Date(settings.updatedAt).toLocaleString()
                                : settings.updatedAt.toDate().toLocaleString()}
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/30"
                    >
                        {saving ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>

            {/* Preview Link */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 mb-2 font-medium">
                    Preview checkout page:
                </p>
                <p className="text-sm text-blue-700">
                    <code className="bg-white px-2 py-1 rounded border border-blue-200">
                        /checkout?method=wire-transfer&package=[package-id]
                    </code>
                </p>
            </div>
        </div>
    );
}

export default function ManagePaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading payment settings...</p>
                </div>
            </div>
        }>
            <ManagePaymentContent />
        </Suspense>
    );
}
