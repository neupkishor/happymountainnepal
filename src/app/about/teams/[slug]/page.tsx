
'use client';
import Image from 'next/image';
import { useFirestore, useDoc } from '@/firebase';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import type { TeamMember } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type TeamMemberPageProps = {
  params: {
    slug: string;
  };
};

export default function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = params;
  const firestore = useFirestore();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoadingId, setIsLoadingId] = useState(true);

  useEffect(() => {
    if (!firestore || !slug) return;
    const findMember = async () => {
      setIsLoadingId(true);
      const q = query(collection(firestore, 'teamMembers'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setMemberId(querySnapshot.docs[0].id);
      }
      setIsLoadingId(false);
    };
    findMember();
  }, [firestore, slug]);

  const memberRef = memberId ? doc(firestore, 'teamMembers', memberId) : null;
  const { data: member, isLoading: isLoadingMember } = useDoc<TeamMember>(memberRef);

  const isLoading = isLoadingId || isLoadingMember;

  if (isLoading || !member) {
     return (
        <div className="container mx-auto py-16">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
                <div className="md:col-span-1 flex justify-center">
                    <Skeleton className="rounded-full h-48 w-48" />
                </div>
                <div className="md:col-span-2 space-y-4">
                     <Skeleton className="h-8 w-1/2" />
                     <Skeleton className="h-6 w-1/4" />
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </div>
     )
  }

  return (
    <div className="container mx-auto py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-card p-8 rounded-lg shadow-lg">
            <div className="md:col-span-1 flex justify-center">
            <Image
                src={member.image}
                alt={member.name}
                width={200}
                height={200}
                className="rounded-full h-48 w-48 object-cover ring-4 ring-primary"
                data-ai-hint="portrait person"
            />
            </div>
            <div className="md:col-span-2">
            <h1 className="text-3xl font-bold !font-headline">{member.name}</h1>
            <p className="text-xl font-semibold text-primary mt-1">{member.role}</p>
            <p className="mt-4 text-muted-foreground">{member.bio}</p>
            </div>
        </div>
    </div>
  );
}
