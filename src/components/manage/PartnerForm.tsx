
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { type Partner } from '@/lib/types';
import { addPartner, updatePartner } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  logo: z.string().url({ message: "Please enter a valid logo URL." }),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerFormProps {
  partner?: Partner;
}

export function PartnerForm({ partner }: PartnerFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: partner || {
      name: '',
      description: '',
      logo: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (partner) {
          await updatePartner(partner.id, values);
          toast({ title: 'Success', description: 'Partner updated.' });
        } else {
          await addPartner(values);
          toast({ title: 'Success', description: 'Partner created.' });
        }
      } catch (error) {
        console.error("Failed to save partner:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save partner. Please try again.',
        });
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Nepal Tourism Board" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Official tourism body of Nepal."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {partner ? 'Update Partner' : 'Create Partner'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    