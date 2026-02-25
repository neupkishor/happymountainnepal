import { AdminPageControl } from '@/components/admin/AdminPageControl';
import { getLegalContent } from '@/lib/db/sqlite';
import Image from 'next/image';

export default async function TermsOfServicePage() {
    const data = await getLegalContent('terms');
    const content = data?.content || `
        <h2>1. Agreement to Terms</h2>
        <p>By using our website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        <h2>2. Booking and Payments</h2>
        <p>All bookings are subject to availability. A deposit is required to secure your booking. The final payment schedule will be communicated to you upon booking confirmation. Cancellation policies apply and will be detailed in your booking agreement.</p>
        <h2>3. Your Responsibilities</h2>
        <p>You are responsible for ensuring you are in good health for your chosen trek or tour. You must have adequate travel insurance covering medical emergencies, evacuation, and trip cancellation.</p>
        <h2>4. Limitation of Liability</h2>
        <p>Happy Mountain Nepal is not liable for any injury, damage, loss, or delay that may occur due to factors beyond our control, including but not limited to natural disasters, political instability, or personal illness.</p>
        <h2>5. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this site.</p>
    `;
    const lastUpdated = data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();

    return (
        <article>
            <AdminPageControl editPath="/manage/legal/terms" />
            <header className="relative h-[30vh] md:h-[40vh] w-full bg-slate-900">
                <Image
                    src="https://cdn.neupgroup.com/p3happymountainnepal/logo.png"
                    alt="Terms of Service"
                    fill
                    className="object-contain p-12 opacity-20"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                <div className="container mx-auto h-full flex flex-col justify-end pb-12 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold !font-headline text-white">Terms of Service</h1>
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
