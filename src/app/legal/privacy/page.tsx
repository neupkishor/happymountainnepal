import { AdminPageControl } from '@/components/admin/AdminPageControl';
import { getLegalContent } from '@/lib/db/sqlite';
import Image from 'next/image';

export default async function PrivacyPolicyPage() {
    const data = await getLegalContent('privacy');
    const content = data?.content || `
        <h2>1. Introduction</h2>
        <p>Welcome to Happy Mountain Nepal. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
        <h2>2. Information We Collect</h2>
        <p>We may collect personal information such as your name, email address, and phone number when you fill out our contact or booking forms. We also collect non-personal information, such as browser type and pages visited, to improve our website.</p>
        <h2>3. Use of Your Information</h2>
        <p>We use the information we collect to: respond to your inquiries, process bookings, send marketing communications, and improve our services.</p>
        <h2>4. Security of Your Information</h2>
        <p>We use administrative, technical, and physical security measures to help protect your personal information.</p>
        <h2>5. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at info@happymountainnepal.com.</p>
    `;
    const lastUpdated = data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();

    return (
        <article>
            <AdminPageControl editPath="/manage/legal/privacy" />
            <header className="relative h-[30vh] md:h-[40vh] w-full bg-slate-900">
                <Image
                    src="https://cdn.neupgroup.com/p3happymountainnepal/logo.png"
                    alt="Privacy Policy"
                    fill
                    className="object-contain p-12 opacity-20"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                <div className="container mx-auto h-full flex flex-col justify-end pb-12 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold !font-headline text-white">Privacy Policy</h1>
                    <p className="mt-4 text-white/90">Last updated: {lastUpdated}</p>
                </div>
            </header>

            <div className="container mx-auto py-12">
                <div className="max-w-3xl mx-auto">
                    <div
                        className="formatted-content max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </article>
    );
}
