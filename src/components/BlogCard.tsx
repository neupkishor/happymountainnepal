import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import type { BlogPost } from '@/lib/types'; // Added missing import
import { Badge } from './ui/badge';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const displayDate = post.date instanceof Timestamp ? post.date.toDate().toLocaleDateString() : post.date;

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0">
          <Image
            src={post.image}
            alt={post.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="travel blog"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.map(tag => (
                <Link key={tag} href={`/blog?tags=${encodeURIComponent(tag)}`} onClick={(e) => e.stopPropagation()}>
                    <Badge variant="secondary" className="hover:bg-primary/20">{tag}</Badge>
                </Link>
              ))}
            </div>
          )}
          <CardTitle className="text-lg font-bold !font-headline mb-2 leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="text-xs text-muted-foreground">
            <span>By {post.author}</span> &bull; <span>{displayDate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
