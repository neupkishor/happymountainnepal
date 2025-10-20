
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { TeamTableRow } from '@/components/manage/TeamTableRow';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { TeamMember } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamListPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchTeamMembers = async () => {
      setLoading(true);
      const teamMembersRef = collection(firestore, 'teamMembers');
      const q = query(teamMembersRef);
      const querySnapshot = await getDocs(q);
      setTeamMembers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
      setLoading(false);
    };
    fetchTeamMembers();
  }, [firestore]);


  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold !font-headline">Team Members</h1>
        <Button asChild>
          <Link href="/manage/team/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Member
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Team</CardTitle>
          <CardDescription>
            Here you can add, edit, or remove team members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((member) => (
                  <TeamTableRow key={member.id} member={member} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
