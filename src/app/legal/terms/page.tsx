export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold !font-headline">Terms of Service</h1>
                    <p className="mt-4 text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="prose prose-lg max-w-none text-foreground">
                    <h2>1. Agreement to Terms</h2>
                    <p>
                        By using our website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>
                    
                    <h2>2. Booking and Payments</h2>
                    <p>
                        All bookings are subject to availability. A deposit is required to secure your booking. The final payment schedule will be communicated to you upon booking confirmation. Cancellation policies apply and will be detailed in your booking agreement.
                    </p>

                    <h2>3. Your Responsibilities</h2>
                    <p>
                        You are responsible for ensuring you are in good health for your chosen trek or tour. You must have adequate travel insurance covering medical emergencies, evacuation, and trip cancellation.
                    </p>

                    <h2>4. Limitation of Liability</h2>
                    <p>
                        Happy Mountain Nepal is not liable for any injury, damage, loss, or delay that may occur due to factors beyond our control, including but not limited to natural disasters, political instability, or personal illness.
                    </p>

                    <h2>5. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this site.
                    </p>
                </div>
            </div>
        </div>
    );
}
