import { getBlogPostBySlug } from '@/lib/db';
import BlogPostClient from './blog-post-client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next'; // Import Metadata type
import { Timestamp } from 'firebase/firestore';
import { headers } from 'next/headers';

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
  
  const serializablePost = {
    ...post,
    date: post.date instanceof Timestamp ? post.date.toDate().toISOString() : post.date,
  };


  return {
    title: serializablePost.title,
    description: serializablePost.excerpt,
    alternates: {
      canonical: `https://happymountainnepal.com/blog/${serializablePost.slug}`, // Replace with your actual domain
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
      publishedTime: new Date(serializablePost.date).toISOString(),
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
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }
  
  // Convert timestamp for client component
  const serializablePost = {
      ...post,
      date: post.date instanceof Timestamp ? post.date.toDate().toISOString() : post.date,
  };

  const headersList = headers();
  const tempUserId = headersList.get('x-temp-account-id') || 'NotAvailable';

  return <BlogPostClient post={serializablePost} tempUserId={tempUserId} />;
}
