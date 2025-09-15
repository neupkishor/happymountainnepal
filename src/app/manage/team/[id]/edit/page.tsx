
import { getTeamMemberById } from '@/lib/db';
import { TeamMemberForm } from '@/components/manage/TeamMemberForm';
import { notFound } from 'next/navigation';

type EditTeamMemberPageProps = {
  params: { id: string };
};

export default async function EditTeamMemberPage({ params }: EditTeamMemberPageProps) {
  const member = await getTeamMemberById(params.id);

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Edit Team Member</h1>
        <p className="text-muted-foreground mt-2">
          Update the details for {member.name}.
        </p>
      </div>
      <TeamMemberForm member={member} />
    </div>
  );
}
