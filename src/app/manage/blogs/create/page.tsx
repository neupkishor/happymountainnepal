
'use server';
import { createBlogPost } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function CreateBlogPostPage() {
  
  const newPostId = await createBlogPost();

  if (newPostId) {
    redirect(`/manage/blogs/${newPostId}/edit`);
  } else {
    redirect(`/manage/blogs?error=creation-failed`);
  }

  return null;
}
