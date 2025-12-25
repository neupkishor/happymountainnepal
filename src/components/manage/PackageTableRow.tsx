
'use client';

import Link from 'next/link';
import type { Tour } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DeletePackageDialog } from '@/components/manage/DeletePackageDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface PackageTableRowProps {
  tour: Tour;
}

export function PackageManagementCard({ tour }: PackageTableRowProps) {
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

  const displayStatus = tour.status || 'draft';

  return (
    <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <div className="relative h-16 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image src={tour.mainImage?.url || 'https://placehold.co/600x400'} alt={tour.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <Link href={`/manage/packages/${tour.id}`} className="font-medium hover:underline line-clamp-1">{tour.name}</Link>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                    <span>{Array.isArray(tour.region) ? tour.region.join(', ') : tour.region}</span>
                    <span>&bull;</span>
                    <span>{tour.duration} days</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(displayStatus)} className="hidden sm:inline-flex">
                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                </Badge>
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
                    <Link href={`/manage/packages/${tour.id}/basics`}>Edit</Link>
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
            </div>
        </CardContent>
    </Card>
  );
}
