import { BlogPostForm } from '@/components/manage/forms/BlogPostForm';
import { BlogPost } from '@/lib/types';

export default function CreateBlogPostPage() {
  // Create a new empty blog post object for the form
  const newPost: BlogPost = {
    id: '', // Empty ID indicates this is a new post
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: 'Admin',
    authorPhoto: 'https://picsum.photos/seed/admin-avatar/400/400',
    date: new Date().toISOString(),
    image: '',
    status: 'draft',
    metaInformation: '',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Create New Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to create a new blog post.
        </p>
      </div>
      <BlogPostForm post={newPost} />
    </div>
  );
}