import { getTeamMemberBySlug } from '@/lib/db';
import TeamMemberClient from './team-member-client';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type TeamMemberPageProps = {
  params: {
    slug: string;
  };
};

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const member = await getTeamMemberBySlug(params.slug);

  if (!member) {
    notFound();
  }

  return <TeamMemberClient member={member} />;
}