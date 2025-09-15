import { teamMembers } from '@/lib/data';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import Image from 'next/image';

export default function AboutPage() {
  const founder = teamMembers.find(m => m.role.includes('Founder'));
  const otherMembers = teamMembers.filter(m => !m.role.includes('Founder'));

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Meet the Team</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            We are a team of passionate mountaineers, seasoned guides, and travel experts dedicated to providing you with an unforgettable Himalayan experience.
          </p>
        </div>

        {founder && (
          <div className="mb-20">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
              <div className="md:col-span-1 flex justify-center">
                <Image
                  src={founder.image}
                  alt={founder.name}
                  width={200}
                  height={200}
                  className="rounded-full h-48 w-48 object-cover ring-4 ring-primary"
                  data-ai-hint="portrait founder"
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold !font-headline">{founder.name}</h2>
                <p className="text-xl font-semibold text-primary mt-1">{founder.role}</p>
                <p className="mt-4 text-muted-foreground">{founder.bio}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold !font-headline">Our Experts</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
          {otherMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

       <div className="bg-secondary py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold !font-headline">Our Mission</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
              To share the majestic beauty of the Himalayas through safe, sustainable, and culturally respectful tourism, creating lifelong memories for our clients while supporting local communities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
