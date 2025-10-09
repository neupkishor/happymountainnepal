
import { getBlogPostById } from '@/lib/db';
import { BlogPostForm } from '@/components/manage/BlogPostForm';
import { notFound } from 'next/navigation';

type EditBlogPostPageProps = {
  params: { id: string };
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const post = await getBlogPostById(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Edit Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Editing "{post.title}".
        </p>
      </div>
      <BlogPostForm post={post} />
    </div>
  );
}
