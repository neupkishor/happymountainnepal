'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { PaymentSettings, Tour, SiteProfile } from '@/lib/types';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
    const [packageInfo, setPackageInfo] = useState<Tour | null>(null);
    const [siteProfile, setSiteProfile] = useState<SiteProfile | null>(null);
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

                // Fetch site profile for WhatsApp number
                const profileRes = await fetch('/api/navigation-components');
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setSiteProfile(profileData);
                }
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading checkout information...</p>
                </div>
            </div>
        );
    }

    if (error || !paymentSettings || !packageInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="max-w-md w-full mx-4 bg-card rounded-2xl shadow-xl p-8 text-center border border-border">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold font-headline text-foreground mb-2">Error</h2>
                    <p className="text-muted-foreground mb-6">{error || 'Unable to load checkout information'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto container">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-2">Complete Your Booking</h1>
                    <p className="text-lg text-muted-foreground">Wire Transfer Payment Instructions</p>
                </div>

                {/* Package Information Card */}
                <div className="bg-card rounded-2xl shadow-lg p-6 mb-6 border border-border">
                    <h2 className="text-xl font-semibold font-headline text-foreground mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Package Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Package Name</p>
                            <p className="text-lg font-semibold text-foreground">{packageInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Duration</p>
                            <p className="text-lg font-semibold text-foreground">{packageInfo.duration} Days</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Base Price</p>
                            <p className="text-lg font-semibold text-primary">${packageInfo.price}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Difficulty</p>
                            <p className="text-lg font-semibold text-foreground">{packageInfo.difficulty}</p>
                        </div>
                    </div>
                </div>

                {/* Bank Information Card */}
                <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
                    <h2 className="text-2xl font-bold font-headline text-foreground mb-6 flex items-center">
                        <svg className="w-7 h-7 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Bank Transfer Information
                    </h2>

                    <div className="space-y-6">
                        {paymentSettings.bankName && (
                            <div className="bg-secondary rounded-xl p-4 border border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Bank Name</p>
                                <p className="text-lg font-semibold text-foreground">{paymentSettings.bankName}</p>
                            </div>
                        )}

                        {paymentSettings.accountName && (
                            <div className="bg-secondary rounded-xl p-4 border border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Account Name</p>
                                <p className="text-lg font-semibold text-foreground">{paymentSettings.accountName}</p>
                            </div>
                        )}

                        {paymentSettings.accountNumber && (
                            <div className="bg-secondary rounded-xl p-4 border border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                                <p className="text-lg font-mono font-semibold text-foreground">{paymentSettings.accountNumber}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentSettings.swiftCode && (
                                <div className="bg-secondary rounded-xl p-4 border border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">SWIFT Code</p>
                                    <p className="text-lg font-mono font-semibold text-foreground">{paymentSettings.swiftCode}</p>
                                </div>
                            )}

                            {paymentSettings.iban && (
                                <div className="bg-secondary rounded-xl p-4 border border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">IBAN</p>
                                    <p className="text-lg font-mono font-semibold text-foreground">{paymentSettings.iban}</p>
                                </div>
                            )}
                        </div>

                        {paymentSettings.bankAddress && (
                            <div className="bg-secondary rounded-xl p-4 border border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Bank Address</p>
                                <p className="text-base text-foreground">{paymentSettings.bankAddress}</p>
                            </div>
                        )}

                        {paymentSettings.additionalInstructions && (
                            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                                <p className="text-sm font-medium text-primary mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Additional Instructions
                                </p>
                                <p className="text-base text-foreground whitespace-pre-wrap">{paymentSettings.additionalInstructions}</p>
                            </div>
                        )}
                    </div>

                    {/* Important Notice */}
                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold font-headline text-amber-900 mb-3 flex items-center">
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
                            className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors border border-border"
                        >
                            Back to Package
                        </button>
                        <button
                            onClick={() => {
                                const whatsappNumber = siteProfile?.chatbot?.whatsappNumber;
                                if (whatsappNumber) {
                                    // Create pre-filled message with booking details
                                    const message = `Hello! I would like to confirm my booking for:\n\nPackage: ${packageInfo.name}\nDuration: ${packageInfo.duration} days\nPrice: $${packageInfo.price}\n\nI have completed the wire transfer and would like to send the payment confirmation.`;
                                    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappLink, '_blank');
                                } else {
                                    // Fallback to contact page if WhatsApp is not configured
                                    router.push('/contact');
                                }
                            }}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Contact Us for Confirmation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground font-medium">Loading checkout...</p>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
