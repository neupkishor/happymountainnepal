import { getTeamMembers, getTeamMemberBySlug } from '@/lib/db';
import Image from 'next/image';

type TeamMemberPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const teamMembers = await getTeamMembers();
  return teamMembers.map(member => ({
    slug: member.slug,
  }));
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = params;
  const member = await getTeamMemberBySlug(slug);

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
