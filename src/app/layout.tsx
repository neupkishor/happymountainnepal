

'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/Footer';
import { WishlistProvider } from '@/context/WishlistContext';
import { ProgressProvider } from '@/providers/ProgressProvider';
import { HeaderV2 as Header } from '@/components/layout/HeaderV2';
import { usePathname } from 'next/navigation';

// Using a separate component for metadata to allow usePathname in the layout
// export const metadata: Metadata = {
//   title: 'Happy Mountain Nepal',
//   description: 'Explore the best treks and tours in the Himalayas.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isManagePage = pathname.startsWith('/manage');

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <title>Happy Mountain Nepal</title>
        <meta name="description" content="Explore the best treks and tours in the Himalayas." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ProgressProvider>
          <WishlistProvider>
            {isManagePage ? (
              <div className="min-h-screen bg-secondary/30">{children}</div>
            ) : (
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            )}
            <Toaster />
          </WishlistProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
