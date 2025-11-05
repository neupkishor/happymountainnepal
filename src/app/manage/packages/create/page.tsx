'use client';

import { CreatePackageForm } from '@/components/manage/forms/CreatePackageForm';
import { AIAssist } from '@/components/manage/AIAssist'; // Updated import
import { useState } from 'react';
import type { ImportedTourData } from '@/lib/types'; // Import the type

export default function CreatePackagePage() {
  const [importedData, setImportedData] = useState<ImportedTourData | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold !font-headline">Create New Package</h1>
        <p className="text-muted-foreground mt-2">
          Use the AI assistant to import details from a URL or text, or create a package manually below.
        </p>
      </div>

      {/* AI Assistant Section */}
      <AIAssist onDataImported={setImportedData} />
      
      {/* Divider */}
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
