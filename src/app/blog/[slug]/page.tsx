
import { getPostBySlug } from '@/lib/db/sqlite';
import BlogPostClient from './blog-post-client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { AdminPageControl } from '@/components/admin/AdminPageControl';
import { BlogPost } from '@/lib/types';

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const serializablePost = post;

  return {
    title: serializablePost.title,
    description: serializablePost.excerpt,
    alternates: {
      canonical: `https://happymountainnepal.com/blog/${serializablePost.slug}`,
      languages: {
        'en': `https://happymountainnepal.com/blog/${serializablePost.slug}`,
        'x-default': `https://happymountainnepal.com/blog/${serializablePost.slug}`,
      },
    },
    openGraph: {
      title: serializablePost.title,
      description: serializablePost.excerpt,
      url: `https://happymountainnepal.com/blog/${serializablePost.slug}`,
      images: [
        {
          url: serializablePost.image,
          alt: serializablePost.title,
        },
      ],
      type: 'article',
      siteName: 'Happy Mountain Nepal',
      publishedTime: new Date(serializablePost.date as string).toISOString(),
      authors: [serializablePost.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: serializablePost.title,
      description: serializablePost.excerpt,
      images: [serializablePost.image],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Use the post directly as it's already a BlogPost from getPostBySlug
  const serializablePost = post;

  const headersList = await headers();
  const tempUserId = headersList.get('x-temp-account-id') || 'NotAvailable';

  return (
    <>
      <AdminPageControl editPath={`/manage/blog/${post.id}`} />
      <BlogPostClient post={serializablePost} tempUserId={tempUserId} />
    </>
  );
}
