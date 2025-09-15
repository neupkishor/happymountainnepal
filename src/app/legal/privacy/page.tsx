export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto py-16">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold !font-headline">Privacy Policy</h1>
                    <p className="mt-4 text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="prose prose-lg max-w-none text-foreground">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to Happy Mountain Nepal. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                    </p>
                    
                    <h2>2. Information We Collect</h2>
                    <p>
                        We may collect personal information such as your name, email address, and phone number when you fill out our contact or booking forms. We also collect non-personal information, such as browser type and pages visited, to improve our website.
                    </p>

                    <h2>3. Use of Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul>
                        <li>Respond to your inquiries and fulfill your requests.</li>
                        <li>Process your bookings and payments.</li>
                        <li>Send you marketing and promotional communications.</li>
                        <li>Improve our website and services.</li>
                    </ul>

                    <h2>4. Security of Your Information</h2>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information.
                    </p>

                    <h2>5. Contact Us</h2>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact us at info@happymountainnepal.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
