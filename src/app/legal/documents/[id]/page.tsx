
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getLegalDocumentById } from '@/lib/db';
import { FileText, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DocumentViewer } from './viewer';

export default async function LegalDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
        redirect('/legal/documents/gate');
    }

    const document = await getLegalDocumentById(id);

    if (!document) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
                        <Link href="/legal/documents">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Documents
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold mt-2 flex items-center gap-2">
                        <FileText className="h-8 w-8 text-primary" />
                        {document.title}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Authorized access for: <span className="font-semibold text-foreground">{userEmail}</span>
                    </p>
                </div>

                <div className="relative bg-muted/20 border rounded-lg overflow-hidden">
                    <DocumentViewer url={document.url} email={userEmail} />
                </div>
            </div>
        </div>
    );
}
