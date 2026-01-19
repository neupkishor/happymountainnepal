'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { PaymentSettings, Tour } from '@/lib/types';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
    const [packageInfo, setPackageInfo] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const method = searchParams.get('method');
    const packageId = searchParams.get('package');

    useEffect(() => {
        // Redirect if required parameters are missing
        if (!method || !packageId) {
            router.push('/');
            return;
        }

        // Only support wire-transfer for now
        if (method !== 'wire-transfer') {
            router.push('/');
            return;
        }

        // Fetch payment settings and package info
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch payment settings
                const paymentRes = await fetch('/api/payment/settings');
                if (!paymentRes.ok) throw new Error('Failed to fetch payment settings');
                const paymentData = await paymentRes.json();
                setPaymentSettings(paymentData);

                // Fetch package info
                const packageRes = await fetch(`/api/tours/${packageId}`);
                if (!packageRes.ok) throw new Error('Package not found');
                const packageData = await packageRes.json();
                setPackageInfo(packageData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [method, packageId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading checkout information...</p>
                </div>
            </div>
        );
    }

    if (error || !paymentSettings || !packageInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
                    <p className="text-slate-600 mb-6">{error || 'Unable to load checkout information'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Complete Your Booking</h1>
                    <p className="text-lg text-slate-600">Wire Transfer Payment Instructions</p>
                </div>

                {/* Package Information Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Package Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Package Name</p>
                            <p className="text-lg font-semibold text-slate-900">{packageInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Duration</p>
                            <p className="text-lg font-semibold text-slate-900">{packageInfo.duration} Days</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Base Price</p>
                            <p className="text-lg font-semibold text-blue-600">${packageInfo.price}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Difficulty</p>
                            <p className="text-lg font-semibold text-slate-900">{packageInfo.difficulty}</p>
                        </div>
                    </div>
                </div>

                {/* Bank Information Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <svg className="w-7 h-7 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Bank Transfer Information
                    </h2>

                    <div className="space-y-6">
                        {paymentSettings.bankName && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 mb-1">Bank Name</p>
                                <p className="text-lg font-semibold text-slate-900">{paymentSettings.bankName}</p>
                            </div>
                        )}

                        {paymentSettings.accountName && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 mb-1">Account Name</p>
                                <p className="text-lg font-semibold text-slate-900">{paymentSettings.accountName}</p>
                            </div>
                        )}

                        {paymentSettings.accountNumber && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 mb-1">Account Number</p>
                                <p className="text-lg font-mono font-semibold text-slate-900">{paymentSettings.accountNumber}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentSettings.swiftCode && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500 mb-1">SWIFT Code</p>
                                    <p className="text-lg font-mono font-semibold text-slate-900">{paymentSettings.swiftCode}</p>
                                </div>
                            )}

                            {paymentSettings.iban && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500 mb-1">IBAN</p>
                                    <p className="text-lg font-mono font-semibold text-slate-900">{paymentSettings.iban}</p>
                                </div>
                            )}
                        </div>

                        {paymentSettings.bankAddress && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-sm font-medium text-slate-500 mb-1">Bank Address</p>
                                <p className="text-base text-slate-900">{paymentSettings.bankAddress}</p>
                            </div>
                        )}

                        {paymentSettings.additionalInstructions && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <p className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Additional Instructions
                                </p>
                                <p className="text-base text-slate-700 whitespace-pre-wrap">{paymentSettings.additionalInstructions}</p>
                            </div>
                        )}
                    </div>

                    {/* Important Notice */}
                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Important Notice
                        </h3>
                        <ul className="space-y-2 text-sm text-amber-900">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Please include your booking reference or package name in the transfer description</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>After completing the transfer, please send us the payment confirmation</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Your booking will be confirmed once we receive and verify the payment</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => router.push(`/tours/${packageInfo.slug}`)}
                            className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                        >
                            Back to Package
                        </button>
                        <button
                            onClick={() => router.push('/contact')}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                        >
                            Contact Us for Confirmation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
