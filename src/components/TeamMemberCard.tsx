import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { TeamMember } from '@/lib/types';

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="text-center flex flex-col items-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Image
        src={member.image}
        alt={member.name}
        width={128}
        height={128}
        className="rounded-full h-32 w-32 object-cover mb-4 ring-4 ring-primary/20"
        data-ai-hint="portrait person"
      />
      <CardHeader className="p-0">
        <CardTitle className="text-xl !font-headline">{member.name}</CardTitle>
        <CardDescription className="text-primary font-semibold">{member.role}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <p className="text-sm text-muted-foreground">{member.bio}</p>
      </CardContent>
    </Card>
  );
}
