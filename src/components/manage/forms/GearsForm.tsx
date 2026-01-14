'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
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
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { type Tour, type GearItem, type ImageWithCaption } from '@/lib/types';
import { updateTour, logError } from '@/lib/db';
import { useTransition, useState } from 'react';
import { Loader2, PlusCircle, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';
import { MediaLibraryDialog } from '../MediaLibraryDialog';
import Image from 'next/image';
import { Reorder } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const gearItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    image: z.string().optional(),
    provided: z.boolean().default(false),
});

export const gearsFormSchema = z.object({
    gears: z.array(gearItemSchema),
});

type FormValues = z.infer<typeof gearsFormSchema>;

interface GearsFormProps {
    tour: Tour;
}

export function GearsForm({ tour }: GearsFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const pathname = usePathname();
    const [mediaPickerOpen, setMediaPickerOpen] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });

    const form = useFormContext<FormValues>();

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "gears",
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                await updateTour(tour.id, values);
                toast({ title: 'Success', description: 'Gears updated successfully.' });
            } catch (error: any) {
                logError({ message: `Failed to update gears for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values } });
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not save changes. Please try again.',
                });
            }
        });
    };

    const handleImageSelect = (images: ImageWithCaption[]) => {
        if (mediaPickerOpen.index !== null && images.length > 0) {
            const currentGear = form.getValues(`gears.${mediaPickerOpen.index}`);
            update(mediaPickerOpen.index, { ...currentGear, image: images[0].url });
        }
        setMediaPickerOpen({ isOpen: false, index: null });
    };

    return (
        <>
            <Card>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Gears & Equipment</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ id: uuidv4(), name: '', provided: false })}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card/50">
                                            {/* Image Preview/Select */}
                                            <div className="flex-shrink-0">
                                                <FormField
                                                    control={form.control}
                                                    name={`gears.${index}.image`}
                                                    render={({ field }) => (
                                                        <div
                                                            className="relative w-24 h-24 bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border overflow-hidden group"
                                                            onClick={() => setMediaPickerOpen({ isOpen: true, index })}
                                                        >
                                                            {field.value ? (
                                                                <>
                                                                    <Image src={field.value} alt="Gear" fill className="object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <ImageIcon className="text-white h-6 w-6" />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center p-2">
                                                                    <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                                                    <span className="text-[10px] text-muted-foreground">Add Photo</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            {/* Info Fields */}
                                            <div className="flex-grow space-y-3">
                                                <div className="flex gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`gears.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-grow">
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Item Name (e.g., Down Jacket)" disabled={isPending} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isPending} className="text-muted-foreground hover:text-destructive shrink-0">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name={`gears.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Description (Optional)" disabled={isPending} className="text-sm" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`gears.${index}.provided`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel className="cursor-pointer">
                                                                    Provided by us
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Check if this item is provided by the company.
                                                                </FormDescription>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {fields.length === 0 && (
                                        <div className="text-center py-10 border border-dashed rounded-lg">
                                            <p className="text-muted-foreground">No gears added yet.</p>
                                            <Button type="button" variant="link" onClick={() => append({ id: uuidv4(), name: '', provided: false })}>Add your first gear item</Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => append({ id: uuidv4(), name: '', provided: false })}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Another Item
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Gears
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <MediaLibraryDialog
                isOpen={mediaPickerOpen.isOpen}
                onClose={() => setMediaPickerOpen({ isOpen: false, index: null })}
                onSelect={handleImageSelect}
                defaultTags={['general', 'background']} // Using general tags as default
            />
        </>
    );
}
