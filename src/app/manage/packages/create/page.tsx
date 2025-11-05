'use client';

import { CreatePackageForm } from '@/components/manage/forms/CreatePackageForm';
import { ImportTourForm } from '@/components/manage/forms/ImportTourForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function CreatePackagePage() {
  const [importedData, setImportedData] = useState(null);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Create New Package</h1>
        <p className="text-muted-foreground mt-2">
          Start by either importing details automatically or creating a package manually.
        </p>
      </div>

      <Tabs defaultValue="import">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">
            <Wand2 className="mr-2 h-4 w-4" /> Import with AI
          </TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>
        <TabsContent value="import">
          <ImportTourForm setImportedData={setImportedData} />
        </TabsContent>
        <TabsContent value="manual">
          <CreatePackageForm importedData={importedData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
