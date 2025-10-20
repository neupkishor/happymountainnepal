'use client';
import Link from 'next/link';
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
  TableCell, // Imported TableCell
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { BlogTableRow } from '@/components/manage/BlogTableRow';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const fetchPosts = async () => {
      setLoading(true);
      const blogPostsRef = collection(firestore, 'blogPosts');
      const q = query(blogPostsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
      setLoading(false);
    };
    fetchPosts();
  }, [firestore]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold !font-headline">Blog Posts</h1>
        <Button asChild>
          <Link href="/manage/blog/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Blog Posts</CardTitle>
          <CardDescription>
            Here you can create, edit, and manage all blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Skeleton className="w-full h-10" />
                  </TableCell>
                </TableRow>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <BlogTableRow key={post.id} post={post} />
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}