import { blogPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return blogPosts.map(post => ({
    slug: post.slug,
  }));
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <header className="relative h-[40vh] md:h-[50vh] w-full">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
          data-ai-hint="travel landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold !font-headline text-white">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`} />
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{post.author}</span>
            </div>
            <span>&bull;</span>
            <time dateTime={post.date}>{post.date}</time>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-h3:font-headline prose-h3:text-2xl prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-ul:list-disc prose-ul:ml-6"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>
      </div>
    </article>
  );
}
