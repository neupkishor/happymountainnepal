
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, FormProvider } from 'react-hook-form';
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
import { Loader2, ArrowRight, Wand2, Mail, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  conversation: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      text: z.string(),
    })
  ),
  currentUserInput: z.string().min(1, 'Please provide an answer.'),
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

  const conversation = form.watch('conversation');
  const currentQuestion = conversation[conversation.length - 1];
  const questionNumber = conversation.filter(q => q.role === 'model').length;


  const handleSkip = async () => {
    form.setValue('currentUserInput', 'User skipped the question.');
    await handleSubmit();
  };

  const handleSubmit = async (values?: FormValues) => {
    // Manually trigger validation for currentUserInput
    const isInputValid = await form.trigger('currentUserInput');
    if (!isInputValid) return;

    const currentValues = values || form.getValues();
    const userInput = currentValues.currentUserInput.trim();

    setIsLoading(true);

    const newConversation: CustomizeTripInput = [
      ...currentValues.conversation,
      { role: 'user', text: userInput },
    ];
    
    form.setValue('conversation', newConversation);
    form.reset({ ...currentValues, conversation: newConversation, currentUserInput: '' });


    try {
      const result = await customizeTrip(newConversation);

      form.setValue('conversation', [
        ...newConversation, 
        { role: 'model', text: result.nextQuestion }
      ]);
      
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
       // If there's an error, revert conversation to not show the user's failed input
      form.setValue('conversation', currentValues.conversation);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinalSubmit = async (values: FormValues) => {
    const isEmailValid = await form.trigger('email');
    if (!isEmailValid) return;

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
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Wand2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold !font-headline mt-4">
            Create Your Dream Trip
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Let our AI craft the perfect itinerary just for you.
          </p>
        </div>

        <Card className="overflow-hidden">
        <FormProvider {...form}>
         <form 
            onSubmit={isFinished ? form.handleSubmit(handleFinalSubmit) : form.handleSubmit(handleSubmit)} 
            className="p-6 md:p-8"
        >
            {isFinished ? (
                 <div className="space-y-6 text-center">
                    <Check className="mx-auto h-12 w-12 text-green-500 bg-green-100 rounded-full p-2" />
                     <h2 className="text-2xl font-bold !font-headline">Almost there!</h2>
                    <p className="text-muted-foreground">{currentQuestion.text}</p>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="you@example.com" {...field} className="pl-10 text-center" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get My Custom Plan'}
                    </Button>
                 </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <span className="text-primary font-semibold flex items-center gap-2">
                           {questionNumber} <ArrowRight className="h-4 w-4" />
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold !font-headline mt-1">
                            {currentQuestion.text}
                        </h2>
                    </div>
                    <FormField
                    control={form.control}
                    name="currentUserInput"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="Type your answer here..."
                                autoComplete="off"
                                disabled={isLoading}
                                className="text-lg h-12"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className='flex items-center gap-4'>
                        <Button type="submit" size="lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Proceed'}
                            <Check className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={isLoading}
                        >
                            Skip
                        </Button>
                    </div>
                </div>
            )}
            </form>
        </FormProvider>
        </Card>
      </div>
    </div>
  );
}
