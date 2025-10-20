
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
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import type { Account } from '@/lib/types';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const accountsRef = collection(firestore, 'accounts');
        const q = query(accountsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        setAccounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)));
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load accounts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [firestore]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>
            List of user accounts with email and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Users</CardTitle>
        <CardDescription>
           List of user accounts with email and password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accounts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{ (account as any).fullName || 'N/A'}</TableCell>
                   <TableCell>{ (account as any).email || 'N/A'}</TableCell>
                  <TableCell>
                    {account.createdAt?.toDate ? formatDistanceToNow(account.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Accounts Yet</h3>
            <p>New user accounts will appear here as they are created.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
