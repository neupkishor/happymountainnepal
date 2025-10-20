import { getBlogPostBySlug } from '@/lib/db';
import BlogPostClient from './blog-post-client';
import { notFound } from 'next/navigation';
import { Metadata } from 'next'; // Import Metadata type

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

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://happymountainnepal.com/blog/${post.slug}`, // Replace with your actual domain
      languages: {
        'en': `https://happymountainnepal.com/blog/${post.slug}`,
        'x-default': `https://happymountainnepal.com/blog/${post.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://happymountainnepal.com/blog/${post.slug}`,
      images: [
        {
          url: post.image,
          alt: post.title,
        },
      ],
      type: 'article',
      siteName: 'Happy Mountain Nepal',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}