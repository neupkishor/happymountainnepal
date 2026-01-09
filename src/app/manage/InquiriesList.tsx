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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, MessageSquare, Phone, Send } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ContactInfo {
  email: string | null;
  phone: string | null;
  name?: string;
}

function extractContactInfo(inquiry: Inquiry): ContactInfo {
  let email: string | null = null;
  let phone: string | null = null;
  let name: string = 'Guest';

  if (inquiry.type === 'contact') {
    if (inquiry.data?.email) email = inquiry.data.email;
    if (inquiry.data?.phone) phone = inquiry.data.phone;
    if (inquiry.data?.name) name = inquiry.data.name;
  } else if (inquiry.type === 'customization') {
    const initialUserMessage = inquiry.conversation?.find(c => c.role === 'user')?.text || '';
    const contactInfoMatch = initialUserMessage.match(/Contact Info: (.+)/);

    if (contactInfoMatch) {
      const info = contactInfoMatch[1].trim();
      if (info.includes('@')) {
        const emailMatch = info.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        if (emailMatch) email = emailMatch[1];
      }

      const phoneClean = info.replace(/[^\d+]/g, '');
      if (phoneClean.length > 6 && !info.includes('@')) {
        phone = info;
      }
    }
  }

  return { email, phone, name };
}

function InquiryRow({ inquiry, onReply }: { inquiry: Inquiry, onReply: (contact: ContactInfo) => void }) {
  const isCustomization = inquiry.type === 'customization';
  const createdAt = inquiry.createdAt ? formatDistanceToNow(new Date(inquiry.createdAt as any), { addSuffix: true }) : 'N/A';
  const contactInfo = extractContactInfo(inquiry);

  const getPrimaryContactDisplay = () => {
    if (contactInfo.email) return contactInfo.email;
    if (contactInfo.phone) return contactInfo.phone;
    return contactInfo.name;
  };

  return (
    <AccordionItem value={inquiry.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-4 text-left">
            <div className="font-medium truncate">{getPrimaryContactDisplay()}</div>
            <Badge variant={isCustomization ? 'default' : 'secondary'} className="hidden sm:inline-flex items-center gap-1.5">
              {isCustomization ? <MessageSquare className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
              {isCustomization ? 'Custom Trip' : 'Contact Form'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground hidden md:block">
            {createdAt}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="p-4 bg-secondary/50 rounded-md space-y-4">
          {isCustomization ? (
            <div className="space-y-3">
              {inquiry.conversation?.map((message, index) => (
                <div key={index} className={`text-sm ${message.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span className="font-bold capitalize">{message.role}:</span>
                  <p className="ml-2 whitespace-pre-wrap">{message.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div><strong>From:</strong> {inquiry.data?.name} &lt;{inquiry.data?.email}&gt;</div>
              <div><strong>Subject:</strong> {inquiry.data?.subject}</div>
              <div className="pt-2 border-t mt-2">
                <p className="whitespace-pre-wrap">{inquiry.data?.message}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => onReply(contactInfo)}>
              <Send className="w-4 h-4 mr-2" />
              Reply Now
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null);

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

  const handleReplyClick = (contact: ContactInfo) => {
    if (contact.email && contact.phone) {
      setSelectedContact(contact);
      setReplyDialogOpen(true);
      return;
    }
    if (contact.email) {
      window.location.href = `mailto:${contact.email}?subject=Re: Your Inquiry to Happy Mountain Nepal`;
      return;
    }
    if (contact.phone) {
      openWhatsApp(contact.phone);
      return;
    }
    alert("No contact information found for this inquiry.");
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent("Hello! We received your inquiry at Happy Mountain Nepal.");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

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
    <>
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
                <InquiryRow key={inquiry.id} inquiry={inquiry} onReply={handleReplyClick} />
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

      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              This user provided both an email and a phone number. How would you like to reply?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => {
                if (selectedContact?.email) {
                  window.location.href = `mailto:${selectedContact.email}?subject=Re: Your Inquiry to Happy Mountain Nepal`;
                  setReplyDialogOpen(false);
                }
              }}
            >
              <Mail className="h-8 w-8" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => {
                if (selectedContact?.phone) {
                  openWhatsApp(selectedContact.phone);
                  setReplyDialogOpen(false);
                }
              }}
            >
              <MessageSquare className="h-8 w-8 text-green-600" />
              <span>WhatsApp</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
