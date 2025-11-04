
import { CreatePackageForm } from '@/components/manage/forms/CreatePackageForm';

export default function CreatePackagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold !font-headline">Create New Package</h1>
        <p className="text-muted-foreground mt-2">Enter basic details to create a new package, then continue editing its information.</p>
      </div>
      <CreatePackageForm />
    </div>
  );
}
