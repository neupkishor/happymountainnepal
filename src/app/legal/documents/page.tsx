export default function LegalDocumentsPage() {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold !font-headline">Legal Documents</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Important legal documents and company information.
            </p>
          </div>
          <div className="prose prose-lg max-w-none text-foreground">
            <p>
                This page will contain information about our legal status, licenses, and other official documents. 
                Please check back later for updates.
            </p>
            {/* You can add links to PDF documents or display information here */}
          </div>
        </div>
      </div>
    );
  }
  