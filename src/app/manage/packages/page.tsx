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
import { PackageTableRow } from '@/components/manage/PackageTableRow';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Tour } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PackagesListPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchTours = async () => {
      setLoading(true);
      const packagesRef = collection(firestore, 'packages');
      const q = query(packagesRef);
      const querySnapshot = await getDocs(q);
      setTours(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour)));
      setLoading(false);
    };
    fetchTours();
  }, [firestore]);


  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold !font-headline">Tour Packages</h1>
        <Button asChild>
          <Link href="/manage/packages/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Package
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Packages</CardTitle>
          <CardDescription>
            Here you can add, edit, or remove tour packages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  <TableHead key="name">Package Name</TableHead>,
                  <TableHead key="region">Region</TableHead>,
                  <TableHead key="duration">Duration</TableHead>,
                  <TableHead key="status">Status</TableHead>,
                  <TableHead key="actions" className="text-right">Actions</TableHead>,
                ]}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                tours.map((tour) => (
                  <PackageTableRow key={tour.id} tour={tour} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}