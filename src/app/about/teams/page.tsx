
'use client';

import { TeamMemberCard } from '@/components/TeamMemberCard';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TeamMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function TeamsPage() {
  const firestore = useFirestore();
  const membersQuery = collection(firestore, 'teamMembers');
  const { data: teamMembers, isLoading } = useCollection<TeamMember>(membersQuery);

  return (
    <div className="bg-background">
      <div className="container mx-auto py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Our Team</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Meet the passionate individuals who make your Himalayan adventures possible.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
            {teamMembers?.map((member) => (
              <Link key={member.id} href={`/about/teams/${member.slug}`}>
                <TeamMemberCard member={member} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
