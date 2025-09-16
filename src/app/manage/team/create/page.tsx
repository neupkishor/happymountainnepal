

import { TeamMemberForm } from '@/components/manage/TeamMemberForm';

export default function CreateTeamMemberPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Create New Team Member</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to add a new person to the team.
        </p>
      </div>
      <TeamMemberForm />
    </div>
  );
}

    