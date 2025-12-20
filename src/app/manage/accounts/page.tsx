
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, User, Bot, Clock } from 'lucide-react';
import { getAccounts, getAnonymousUsers } from '@/lib/db';
import type { Account } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// Define a unified user type
type DisplayUser = {
  id: string;
  identifier: string; // email for permanent, cookieId for temporary
  type: 'Permanent' | 'Temporary';
  lastSeen: string; // ISO string date
};


export default function AccountsPage() {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [permanentAccounts, anonymousUsers] = await Promise.all([
          getAccounts(),
          getAnonymousUsers(),
        ]);

        const permanentDisplayUsers: DisplayUser[] = permanentAccounts.map(acc => ({
            id: acc.id,
            identifier: acc.email,
            type: 'Permanent',
            lastSeen: (acc.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        }));
        
        const anonymousDisplayUsers: DisplayUser[] = anonymousUsers.map(anon => ({
            id: anon.id,
            identifier: anon.id,
            type: 'Temporary',
            lastSeen: anon.lastSeen
        }));

        // Combine and sort by last seen date
        const allUsers = [...permanentDisplayUsers, ...anonymousDisplayUsers];
        allUsers.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
        
        setUsers(allUsers);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
           A combined list of registered users and anonymous visitors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
            <Card className="text-center py-12">
                <p className="text-destructive">{error}</p>
            </Card>
        ) : users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Identifier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs break-all">
                    {user.identifier}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.type === 'Permanent' ? 'default' : 'secondary'}>
                        {user.type === 'Permanent' ? <User className="h-3 w-3 mr-1" /> : <Bot className="h-3 w-3 mr-1" />}
                        {user.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                     <div className='flex items-center gap-1 text-muted-foreground'>
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Users Found</h3>
            <p>User and visitor data will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
