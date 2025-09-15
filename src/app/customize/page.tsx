
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  customizeTrip,
  CustomizeTripInput,
} from '@/ai/flows/customize-trip-flow';
import { Loader2, Bot, User, Wand2, Send, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  conversation: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      text: z.string(),
    })
  ),
  currentUserInput: z.string(),
  email: z.string().email({ message: 'Please enter a valid email.' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomizePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conversation: [
        {
          role: 'model',
          text: 'What kind of travel or trek are you looking for?',
        },
      ],
      currentUserInput: '',
      email: '',
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'conversation',
  });

  const handleSkip = async () => {
    form.setValue('currentUserInput', 'User skipped the question.');
    await handleSubmit();
  };

  const handleSubmit = async (values?: FormValues) => {
    const currentValues = values || form.getValues();
    const userInput = currentValues.currentUserInput.trim();

    if (!userInput) return;

    setIsLoading(true);

    const newConversation: CustomizeTripInput = [
      ...currentValues.conversation,
      { role: 'user', text: userInput },
    ];
    append({ role: 'user', text: userInput });
    form.reset({ ...currentValues, currentUserInput: '' });


    try {
      const result = await customizeTrip(newConversation);

      append({ role: 'model', text: result.nextQuestion });

      if (result.isFinished) {
        setIsFinished(true);
      }
    } catch (error) {
      console.error('AI Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'There was a problem communicating with the AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinalSubmit = async (values: FormValues) => {
    console.log("Final submission payload:", {
      email: values.email,
      conversation: values.conversation,
    });
    
    toast({
        title: "Inquiry Sent!",
        description: "Thank you for your message. We'll get back to you with a custom plan shortly.",
    });

    // Reset the entire experience
    form.reset({
      conversation: [{ role: 'model', text: 'What kind of travel or trek are you looking for?' }],
      currentUserInput: '',
      email: '',
    });
    setIsFinished(false);
  };


  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Wand2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold !font-headline mt-4">
            Create Your Dream Trip with AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Answer a few questions and let our AI craft the perfect itinerary just for you.
          </p>
        </div>

        <Card>
            <CardContent className="p-6 space-y-6">
                {fields.map((field, index) => (
                    <div
                    key={field.id}
                    className={cn(
                        'flex items-start gap-4',
                        field.role === 'user' ? 'justify-end' : ''
                    )}
                    >
                    {field.role === 'model' && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback>
                            <Bot className="h-5 w-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}

                    <div
                        className={cn(
                        'rounded-lg px-4 py-3 max-w-[80%] text-sm',
                        field.role === 'model'
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        )}
                    >
                        {field.text}
                    </div>

                    {field.role === 'user' && (
                        <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground">
                        <AvatarFallback>
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                            <AvatarFallback>
                                <Bot className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-3 bg-muted text-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
            </CardContent>
           
            <CardFooter>
            {isFinished ? (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="w-full space-y-4">
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Your Email</FormLabel>
                                <p className='text-xs text-muted-foreground'>Enter your email so we can send you the personalized plan.</p>
                                <FormControl>
                                    <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input placeholder="you@example.com" {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get My Custom Plan'}
                        </Button>
                    </form>
                </Form>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full flex items-center gap-2">
                        <FormField
                        control={form.control}
                        name="currentUserInput"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                            <FormControl>
                                <Input
                                {...field}
                                placeholder="Type your answer..."
                                autoComplete="off"
                                disabled={isLoading}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                        <Button type="submit" size="icon" disabled={isLoading}>
                            <Send className="h-5 w-5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={isLoading}
                        >
                            Skip
                        </Button>
                    </form>
                </Form>
            )}

            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
