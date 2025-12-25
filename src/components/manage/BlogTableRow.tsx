
'use client';

import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteBlogPostDialog } from './DeleteBlogPostDialog';
import { Badge } from '../ui/badge';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface BlogTableRowProps {
  post: BlogPost;
}

export function BlogManagementCard({ post }: BlogTableRowProps) {
  const displayDate = post.date instanceof Timestamp
    ? post.date.toDate().toLocaleDateString()
    : typeof post.date === 'string'
      ? new Date(post.date).toLocaleDateString()
      : "N/A";

  const getStatusVariant = (status: BlogPost['status']) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative h-16 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/manage/blog/${post.id}/edit`} className="font-medium hover:underline line-clamp-1">{post.title}</Link>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span>By {post.author}</span>
            <span>&bull;</span>
            <span>{displayDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(post.status)} className="hidden sm:inline-flex">
              {post.status}
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
                  <Link href={`/blog/${post.slug}`} target="_blank">View Public Page</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/manage/blog/${post.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
