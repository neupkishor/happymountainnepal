
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getActivitiesByAccountId } from '@/lib/db';
import type { Activity } from '@/lib/types'; // Corrected import for Activity
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
import { Activity as ActivityIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActivityPageProps = {
    params: Promise<{
        accountId: string;
    }>
}

export default function AccountActivityPage({ params }: ActivityPageProps) {
  const { accountId } = use(params);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const fetchedActivities = await getActivitiesByAccountId(accountId);
        setActivities(fetchedActivities);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [accountId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
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
        <div className='mb-4'>
            <Button asChild variant="outline" size="sm">
                <Link href="/manage/accounts">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Accounts
                </Link>
            </Button>
        </div>
        <CardTitle>User Activity</CardTitle>
        <CardDescription className="font-mono text-xs break-all">
          Showing activities for account: {accountId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Badge>{activity.activityName}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono break-all whitespace-pre-wrap">
                    {activity.activityName === 'page_view' ? activity.activityInfo.path : JSON.stringify(activity.activityInfo)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{activity.fromIp}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {activity.activityTime?.toDate ? formatDistanceToNow(activity.activityTime.toDate(), { addSuffix: true }) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <ActivityIcon className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Activities Found</h3>
            <p>This user has not performed any tracked activities yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
