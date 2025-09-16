
import Link from 'next/link';
import { getPartners } from '@/lib/db';
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
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { PartnerTableRow } from '@/components/manage/PartnerTableRow';

export default async function PartnersListPage() {
  const partners = await getPartners();

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
              {partners.map((partner) => (
                <PartnerTableRow key={partner.id} partner={partner} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    