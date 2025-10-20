
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
import { PartnerTableRow } from '@/components/manage/PartnerTableRow';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Partner } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PartnersListPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchPartners = async () => {
      setLoading(true);
      const partnersRef = collection(firestore, 'partners');
      const q = query(partnersRef);
      const querySnapshot = await getDocs(q);
      setPartners(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner)));
      setLoading(false);
    };
    fetchPartners();
  }, [firestore]);


  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold !font-headline">Partners & Affiliations</h1>
        <Button asChild>
          <Link href="/manage/partners/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Partner
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Partners</CardTitle>
          <CardDescription>
            Here you can add, edit, or remove company partners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Description</TableHead>
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
                partners.map((partner) => (
                  <PartnerTableRow key={partner.id} partner={partner} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
