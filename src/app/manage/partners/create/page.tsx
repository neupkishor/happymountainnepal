
import { PartnerForm } from '@/components/manage/PartnerForm';

export default function CreatePartnerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold !font-headline">Add New Partner</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to add a new partner or affiliation.
        </p>
      </div>
      <PartnerForm />
    </div>
  );
}

    