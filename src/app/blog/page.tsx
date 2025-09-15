import { blogPosts } from '@/lib/data';
import { BlogCard } from '@/components/BlogCard';

export default function BlogPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">Travel Journal</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Guides, stories, and practical advice from our adventures in the Himalayas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
        {/* Add more cards for a better look */}
         {blogPosts.map((post, index) => (
          <BlogCard key={`${post.id}-${index}`} post={{...post, id: `${post.id}-${index}`}} />
        ))}
      </div>
    </div>
  );
}
