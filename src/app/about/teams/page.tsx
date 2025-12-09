'use client';

import { TeamMemberCard } from '@/components/TeamMemberCard';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy as firestoreOrderBy } from 'firebase/firestore';
import type { TeamMember, TeamGroup } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

export default function TeamsPage() {
  const firestore = useFirestore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch team members
        const membersQuery = collection(firestore, 'teamMembers');
        const membersSnapshot = await getDocs(membersQuery);
        const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));

        // Fetch team groups
        const groupsQuery = query(collection(firestore, 'teamGroups'), firestoreOrderBy('orderIndex', 'asc'));
        const groupsSnapshot = await getDocs(groupsQuery);
        const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamGroup));

        setTeamMembers(members);
        setTeamGroups(groups);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [firestore]);

  const getMembersInGroup = (groupId: string | null) => {
    return teamMembers
      .filter(m => (m.groupId || null) === groupId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  };

  const ungroupedMembers = getMembersInGroup(null);

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
          <div className="space-y-16">
            {/* Display grouped members */}
            {teamGroups.map((group) => {
              const groupMembers = getMembersInGroup(group.id);
              if (groupMembers.length === 0) return null;

              return (
                <div key={group.id} className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold !font-headline">{group.name}</h2>
                    {group.description && (
                      <p className="mt-2 text-muted-foreground">{group.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                    {groupMembers.map((member) => (
                      <Link key={member.id} href={`/about/teams/${member.slug}`}>
                        <TeamMemberCard member={member} />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Display ungrouped members */}
            {ungroupedMembers.length > 0 && (
              <div className="space-y-8">
                {teamGroups.length > 0 && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold !font-headline">Our Team</h2>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                  {ungroupedMembers.map((member) => (
                    <Link key={member.id} href={`/about/teams/${member.slug}`}>
                      <TeamMemberCard member={member} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {teamMembers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No team members to display yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
