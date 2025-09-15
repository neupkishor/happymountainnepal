
'use client';

import { useEffect, useState } from 'react';
import { getInquiries, Inquiry } from '@/lib/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
    const initialUserMessage = inquiry.conversation.find(c => c.role === 'user')?.text || 'No initial message found.';
    const contactInfoMatch = initialUserMessage.match(/Contact Info: (.+)/);
    const contactInfo = contactInfoMatch ? contactInfoMatch[1] : 'Not provided';
    const createdAt = inquiry.createdAt?.toDate ? formatDistanceToNow(inquiry.createdAt.toDate(), { addSuffix: true }) : 'N/A';

    return (
        <AccordionItem value={inquiry.id}>
            <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4 text-left">
                        <div className="font-medium truncate">{contactInfo}</div>
                        <Badge variant="outline" className="hidden sm:inline-flex">
                            {inquiry.conversation.length} messages
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground hidden md:block">
                        {createdAt}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="p-4 bg-secondary/50 rounded-md">
                     {inquiry.conversation.map((message, index) => (
                        <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            <span className="font-bold capitalize">{message.role}:</span>
                            <p className="ml-2 whitespace-pre-wrap">{message.text}</p>
                        </div>
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}


export default function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const fetchedInquiries = await getInquiries();
        setInquiries(fetchedInquiries);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load inquiries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
          <CardDescription>
            Here are the latest trip planning requests from customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Inquiries</CardTitle>
        <CardDescription>
          Here are the latest trip planning requests from customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inquiries.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {inquiries.map((inquiry) => (
                <InquiryRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Inquiries Yet</h3>
            <p>New inquiries will appear here as they are submitted.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

