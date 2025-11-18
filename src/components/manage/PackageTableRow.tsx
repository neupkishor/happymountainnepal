
'use client';

import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DeletePackageDialog } from '@/components/manage/DeletePackageDialog';
import { Badge } from '@/components/ui/badge'; // Import Badge

interface PackageTableRowProps {
  tour: Tour;
}

export function PackageTableRow({ tour }: PackageTableRowProps) {
  const getStatusVariant = (status: Tour['status']) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'unpublished':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Ensure tour.status is a string, defaulting to 'draft' if undefined or null
  const displayStatus = tour.status || 'draft';

  return (
    <TableRow>
      {[
        (
          <TableCell key="name">
            <Link href={`/manage/packages/${tour.id}`} className="font-medium break-words hover:underline">{tour.name}</Link>
            <div className="text-xs text-muted-foreground break-all">{tour.id}</div>
          </TableCell>
        ),
        <TableCell key="region">{Array.isArray(tour.region) ? tour.region.join(', ') : tour.region}</TableCell>,
        <TableCell key="duration">{tour.duration} days</TableCell>,
        (
          <TableCell key="status">
            <Badge variant={getStatusVariant(displayStatus)}>
              {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
            </Badge>
          </TableCell>
        ),
        (
          <TableCell key="actions" className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/tours/${tour.slug}`} target="_blank">View Public Page</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/manage/packages/${tour.id}/edit/basic-info`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DeletePackageDialog tour={tour}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DeletePackageDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        ),
      ]}
    </TableRow>
  );
}
