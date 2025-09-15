'use server';

/**
 * @fileOverview A flow that suggests image optimization prompts for a given image.
 *
 * - getImageOptimizationSuggestions - A function that suggests image optimization prompts.
 * - ImageOptimizationSuggestionsInput - The input type for the getImageOptimizationSuggestions function.
 * - ImageOptimizationSuggestionsOutput - The return type for the getImageOptimizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageOptimizationSuggestionsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageOptimizationSuggestionsInput = z.infer<typeof ImageOptimizationSuggestionsInputSchema>;

const ImageOptimizationSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggested prompts for optimizing the image.'),
});
export type ImageOptimizationSuggestionsOutput = z.infer<typeof ImageOptimizationSuggestionsOutputSchema>;

export async function getImageOptimizationSuggestions(input: ImageOptimizationSuggestionsInput): Promise<ImageOptimizationSuggestionsOutput> {
  return imageOptimizationSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageOptimizationSuggestionsPrompt',
  input: {schema: ImageOptimizationSuggestionsInputSchema},
  output: {schema: ImageOptimizationSuggestionsOutputSchema},
  prompt: `You are an expert image optimization consultant. Given an image, you will provide a list of text prompts that can be used with image editing tools to optimize the image for web use.

  Here is the image:

  {{media url=imageDataUri}}

  Provide at least three suggestions. The suggestions should be specific and actionable.
  `,
});

const imageOptimizationSuggestionsFlow = ai.defineFlow(
  {
    name: 'imageOptimizationSuggestionsFlow',
    inputSchema: ImageOptimizationSuggestionsInputSchema,
    outputSchema: ImageOptimizationSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
