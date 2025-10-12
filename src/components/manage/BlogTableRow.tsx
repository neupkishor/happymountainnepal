
'use client';

import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
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
import { DeleteBlogPostDialog } from './DeleteBlogPostDialog';
import { Badge } from '../ui/badge';
import { Timestamp } from 'firebase/firestore';

interface BlogTableRowProps {
  post: BlogPost;
}

export function BlogTableRow({ post }: BlogTableRowProps) {
  const displayDate = post.date instanceof Timestamp ? post.date.toDate().toLocaleDateString() : post.date;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{post.title}</div>
        <div className="text-xs text-muted-foreground">{post.slug}</div>
      </TableCell>
      <TableCell>{post.author}</TableCell>
      <TableCell>
        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
          {post.status}
        </Badge>
      </TableCell>
      <TableCell>{displayDate}</TableCell>
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
              <Link href={`/blogs/${post.slug}`} target="_blank">View Public Page</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/manage/blogs/${post.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteBlogPostDialog post={post}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteBlogPostDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
