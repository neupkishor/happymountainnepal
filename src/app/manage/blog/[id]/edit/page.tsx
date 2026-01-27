
import { getPostById } from '@/lib/db/sqlite';
import { BlogPostForm } from '@/components/manage/forms/BlogPostForm';
import { notFound } from 'next/navigation';
import { BlogPost } from '@/lib/types';

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const post = getPostById(id);

  if (!post) {
    notFound();
  }

  // Ensure compatibility with BlogPost type
  const serializablePost = {
    ...post,
    date: post.createdAt,
    // tags are already parsed arrays from getPostById
  } as unknown as BlogPost;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Edit Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Editing "{post.title}".
        </p>
      </div>
      <BlogPostForm post={serializablePost} />
    </div>
  );
}