import { getTeamMembers } from '@/lib/db';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import Link from 'next/link';

export default async function TeamsPage() {
  const teamMembers = await getTeamMembers();
  return (
    <div className="bg-background">
      <div className="container mx-auto py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Our Team</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Meet the passionate individuals who make your Himalayan adventures possible.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
          {teamMembers.map((member) => (
            <Link key={member.id} href={`/about/teams/${member.slug}`}>
              <TeamMemberCard member={member} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
