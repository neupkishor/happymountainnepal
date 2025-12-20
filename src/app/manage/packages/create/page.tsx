'use client';

import { CreatePackageForm } from '@/components/manage/forms/CreatePackageForm';
import { useState } from 'react';
import type { ImportedTourData } from '@/lib/types';

export default function CreatePackagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold !font-headline">Create New Package</h1>
        <p className="text-muted-foreground mt-2">
          Create a package manually below.
        </p>
      </div>

      <CreatePackageForm importedData={null} />
    </div>
  );
}
