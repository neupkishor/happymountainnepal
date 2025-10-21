'use client';

import { ProfileForm } from '@/components/manage/forms/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Company Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your site-wide company information, such as contact details and public stats.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
