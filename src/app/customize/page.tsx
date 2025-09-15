
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, ArrowRight, Wand2, Check, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  conversation: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      text: z.string(),
    })
  ),
  currentUserInput: z.string().min(1, 'Please provide an answer.').optional(),
  contactInfo: z.string().min(1, 'Please provide your email or phone number.'),
  initialInterest: z.string().min(10, 'Please tell us a bit more about your desired trip.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomizePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isInitialStep, setIsInitialStep] = useState(true);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conversation: [],
      currentUserInput: '',
      contactInfo: '',
      initialInterest: '',
    },
  });

  const conversation = form.watch('conversation');
  const currentQuestion = isInitialStep ? {
      role: 'model',
      text: 'What kind of travel or trek are you looking for?',
    } : conversation[conversation.length - 1];

  const questionNumber = conversation.filter(q => q.role === 'model').length;

  const handleSkip = async () => {
    form.setValue('currentUserInput', 'User skipped the question.');
    await handleAiSubmit();
  };

  const handleInitialSubmit = async (values: FormValues) => {
    setIsLoading(true);

    const initialUserMessage = `Initial interest: ${values.initialInterest}. Contact Info: ${values.contactInfo}`;

    const newConversation: CustomizeTripInput = [{ role: 'user', text: initialUserMessage }];
    
    try {
      const result = await customizeTrip(newConversation);
      form.setValue('conversation', [
        ...newConversation, 
        { role: 'model', text: result.nextQuestion }
      ]);
      setIsInitialStep(false);
    } catch (error) {
       console.error('AI Error:', error);
       toast({
         variant: 'destructive',
         title: 'Error',
         description: 'There was a problem starting the customization. Please try again.',
       });
    } finally {
        setIsLoading(false);
    }
  }
  
  const onSubmit = async (values: FormValues) => {
    if (isInitialStep) {
        await handleInitialSubmit(values);
    } else if (isFinished) {
        await handleFinalSubmit(values);
    } else {
        await handleAiSubmit();
    }
  }

  const handleAiSubmit = async () => {
    // Manually trigger validation for currentUserInput
    const isInputValid = await form.trigger('currentUserInput');
    if (!isInputValid) return;

    const currentValues = form.getValues();
    const userInput = currentValues.currentUserInput!.trim();

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
        description: 'There was a problem communicating with the AI. Please try again.',
      });
      form.setValue('conversation', currentValues.conversation);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinalSubmit = async (values: FormValues) => {
    console.log("Final submission payload:", {
      conversation: values.conversation,
    });
    
    toast({
        title: "Inquiry Sent!",
        description: "Thank you for your message. We'll get back to you with a custom plan shortly.",
    });

    // Reset the entire experience
    form.reset({
      conversation: [],
      currentUserInput: '',
      contactInfo: '',
      initialInterest: '',
    });
    setIsFinished(false);
    setIsInitialStep(true);
  };

  return (
    <div className="container mx-auto py-16">
      <div className="max-w-2xl w-full">
        <div className="text-left mb-8">
          <Wand2 className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold !font-headline mt-4">
            Create Your Dream Trip
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Let our AI craft the perfect itinerary just for you.
          </p>
        </div>

        <FormProvider {...form}>
         <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-6"
        >
            {isInitialStep ? (
                <div className="space-y-6">
                    <div>
                        <span className="text-primary font-semibold flex items-center gap-2">
                           Start Here <ArrowRight className="h-4 w-4" />
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold !font-headline mt-1">
                            {currentQuestion.text}
                        </h2>
                         <p className="text-muted-foreground mt-2">Tell us your ideas. Are you looking for a challenging trek, a cultural tour, a family vacation, or something else?</p>
                    </div>
                    <FormField
                        control={form.control}
                        name="initialInterest"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="e.g., 'I want a 10-day moderate trek in the Annapurna region with great mountain views and some cultural experiences.'"
                                    autoComplete="off"
                                    disabled={isLoading}
                                    className="text-lg bg-card"
                                    rows={5}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactInfo"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contact Info</FormLabel>
                            <FormControl>
                                <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Your email and/or phone number" {...field} className="pl-10 bg-card" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Customization'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ) : isFinished ? (
                 <div className="space-y-6 text-center">
                    <Check className="mx-auto h-12 w-12 text-green-500 bg-green-100 rounded-full p-2" />
                     <h2 className="text-2xl font-bold !font-headline">All Set!</h2>
                    <p className="text-muted-foreground">{currentQuestion.text}</p>
                    <p className="text-sm text-muted-foreground">Our team will review your responses and get back to you with a personalized plan.</p>
                    <Button type="submit" className="w-full sm:w-auto">
                        Finish
                    </Button>
                 </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <span className="text-primary font-semibold flex items-center gap-2">
                           Question {questionNumber} <ArrowRight className="h-4 w-4" />
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
                                className="text-lg h-12 bg-card"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className='flex items-center gap-4'>
                        <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
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
      </div>
    </div>
  );
}
