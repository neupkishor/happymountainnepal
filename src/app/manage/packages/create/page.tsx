
'use server';
import { createTour } from '@/lib/db';
import { redirect } from 'next/navigation';

// This is a server component that performs a server action
export default async function CreatePackagePage() {
  
  // This server action will create a new blank tour
  // and redirect the user to the first step of the edit flow.
  const newTourId = await createTour();

  if (newTourId) {
    redirect(`/manage/packages/${newTourId}/edit/basic-info`);
  } else {
    // Handle error case, maybe redirect to an error page
    // or back to the packages list with an error message.
    redirect(`/manage/packages?error=creation-failed`);
  }

  // This page will not render anything as it redirects immediately.
  // You could show a loading spinner here if the action takes time.
  return null;
}
