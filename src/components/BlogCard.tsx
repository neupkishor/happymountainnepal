'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const displayDate = post.date instanceof Timestamp ? post.date.toDate().toLocaleDateString() : post.date;

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl">
      {/* Clickable Image */}
      <CardHeader className="p-0">
        <Link href={`/blog/${post.slug}`} className="block">
          <Image
            src={post.image}
            alt={post.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            data-ai-hint="travel blog"
          />
        </Link>
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        {/* Tags - clickable to filter */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map(tag => (
              <Link key={tag} href={`/blog?tags=${encodeURIComponent(tag)}`}>
                <Badge variant="secondary" className="hover:bg-primary/20 cursor-pointer">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Clickable Title */}
        <Link href={`/blog/${post.slug}`}>
          <CardTitle className="text-lg font-bold !font-headline mb-2 leading-tight hover:text-primary transition-colors cursor-pointer">
            {post.title}
          </CardTitle>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <span>By {post.author}</span> &bull; <span>{displayDate}</span>
        </div>

        {/* Clickable Button */}
        <Button variant="ghost" size="sm" asChild className="group">
          <Link href={`/blog/${post.slug}`} className="flex items-center gap-1">
            Read More
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
