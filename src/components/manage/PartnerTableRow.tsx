
'use client';

import Link from 'next/link';
import type { Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DeletePartnerDialog } from '@/components/manage/DeletePartnerDialog';

interface PartnerTableRowProps {
  partner: Partner;
}

export function PartnerTableRow({ partner }: PartnerTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={partner.logo} alt={partner.name} className="object-contain" />
            <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{partner.name}</span>
        </div>
      </TableCell>
      <TableCell>{partner.description}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/manage/partners/${partner.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeletePartnerDialog partner={partner}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeletePartnerDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

    