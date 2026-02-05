import { LocationsClient } from './LocationsClient';

export const metadata = {
    title: 'All Destinations | Happy Mountain Nepal',
    description: 'Explore our wide range of trekking and tour destinations across Nepal, Tibet, and Bhutan.',
};

export default function LocationsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-[40vh] bg-muted flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                {/* Fallback pattern or generic mountain image if available */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center" />
                
                <div className="relative z-20 text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 !font-headline">
                        Explore Destinations
                    </h1>
                    <p className="text-lg text-white/90 max-w-2xl mx-auto">
                        Find your next adventure in the Himalayas. From popular trekking regions to hidden gems.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <LocationsClient />
            </div>
        </div>
    );
}
