
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { WishlistProvider } from '@/context/WishlistContext';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { HeaderV3 as Header } from '@/components/layout/HeaderV3';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Chatbot } from '@/components/Chatbot'; // New import
import 'quill/dist/quill.snow.css'; // Import Quill's CSS
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { PageViewTracker } from '@/lib/client-logger';

export const metadata: Metadata = {
  title: {
    default: 'Happy Mountain Nepal',
    template: '%s | Happy Mountain Nepal',
  },
  description: 'Explore the best treks and tours in the Himalayas.',
  alternates: {
    canonical: 'https://happymountainnepal.com',
    languages: {
      'en': 'https://happymountainnepal.com',
      'x-default': 'https://happymountainnepal.com',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Happy Mountain Nepal",
    "url": "https://happymountainnepal.com",
    "logo": "https://neupgroup.com/content/p3happymountainnepal/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+977-984-3725521",
      "contactType": "customer service"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ProgressBar />
        <FirebaseClientProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen">
              <div className="relative z-50">
                <Header />
              </div>
              <main className="flex-grow pt-16">{children}</main>
              <ConditionalFooter />
            </div>
            <Chatbot />
            <Toaster />
            <PageViewTracker />
          </WishlistProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
