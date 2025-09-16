
import Link from 'next/link';
import { getErrors, SiteError } from '@/lib/db';
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ErrorsPage() {
  const errors = await getErrors();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold !font-headline">Site Errors</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Captured Errors</CardTitle>
          <CardDescription>
            Errors captured automatically from the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Error</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((error: SiteError) => (
                  <TableRow key={error.id}>
                    <TableCell className="font-medium max-w-sm truncate">{error.message}</TableCell>
                    <TableCell><Badge variant="outline">{error.pathname}</Badge></TableCell>
                    <TableCell>
                      {error.createdAt?.toDate ? formatDistanceToNow(error.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="ghost" size="sm">
                          <Link href={`/manage/site/errors/${error.id}`}>
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-16 text-muted-foreground">
                <ShieldAlert className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No Errors Captured</h3>
                <p>Everything looks healthy. Captured errors will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
