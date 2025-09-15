import Image from 'next/image';
import { getPartners } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export async function OurPartners() {
  const partners = await getPartners();
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">Our Partners & Affiliations</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            We are proud to be associated with leading organizations in the tourism industry and government bodies, ensuring the highest standards of service and credibility.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {partners.map(partner => (
            <div key={partner.id} className="text-center">
              <div className="bg-card p-6 rounded-lg flex justify-center items-center h-32 mb-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={150}
                  height={75}
                  className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  data-ai-hint="company logo"
                />
              </div>
              <h3 className="font-semibold text-lg">{partner.name}</h3>
              <p className="text-sm text-muted-foreground">{partner.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
