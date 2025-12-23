import { getBlogPostById } from '@/lib/db';
import { BlogPostForm } from '@/components/manage/forms/BlogPostForm';
import { notFound } from 'next/navigation';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  // Convert Firestore Timestamp to ISO string for client component serialization
  const serializablePost = {
    ...post,
    date: post.date instanceof Timestamp ? post.date.toDate().toISOString() : post.date,
  };

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