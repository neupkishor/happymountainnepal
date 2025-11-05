'use client';

import { CreatePackageForm } from '@/components/manage/forms/CreatePackageForm';
import { ImportTourForm } from '@/components/manage/forms/ImportTourForm';
import { useState } from 'react';

export default function CreatePackagePage() {
  const [importedData, setImportedData] = useState(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold !font-headline">Create New Package</h1>
        <p className="text-muted-foreground mt-2">
          Use the AI importer to automatically fill in the details, or create a package manually below.
        </p>
      </div>

      {/* AI Importer Section */}
      <ImportTourForm setImportedData={setImportedData} />
      
      {/* Divider and Manual Form */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
            <span className="bg-background px-2 text-sm text-muted-foreground">Or Enter Manually</span>
        </div>
      </div>
      
      <CreatePackageForm importedData={importedData} />
    </div>
  );
}
