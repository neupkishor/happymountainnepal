'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';


const ImportTourInputSchema = z.object({
  url: z.string().url().optional(),
  text: z.string().min(50).optional(),
}).refine(data => data.url || data.text, {
  message: "Either 'url' or 'text' must be provided.",
});


const ItineraryItemSchema = z.object({
  day: z.number().int(),
  title: z.string(),
  description: z.string(),
});

const ImportTourOutputSchema = z.object({
  name: z.string().describe('The main name or title of the tour package.'),
  description: z.string().describe('A brief, engaging summary of the tour, typically one or two paragraphs.'),
  duration: z.number().int().describe('The total duration of the tour in days.'),
  difficulty: z.enum(['Easy', 'Moderate', 'Strenuous', 'Challenging']).describe('The difficulty rating of the tour.'),
  region: z.array(z.string()).describe('The primary geographical region(s) of the tour, e.g., ["Everest", "Khumbu"].'),
  itinerary: z.array(ItineraryItemSchema).describe('A day-by-day plan for the tour.'),
  inclusions: z.array(z.string()).describe('A list of what is included in the tour price.'),
  exclusions: z.array(z.string()).describe('A list of what is NOT included in the tour price.'),
});

export type ImportTourInput = z.infer<typeof ImportTourInputSchema>;
export type ImportedTourData = z.infer<typeof ImportTourOutputSchema>;

export async function importTourData(input: ImportTourInput): Promise<ImportedTourData> {
  return importTourFlow(input);
}

const importPrompt = ai.definePrompt({
  name: 'importTourDataPrompt',
  input: { schema: z.object({ content: z.string() }) },
  output: { schema: ImportTourOutputSchema },
  prompt: `You are an expert travel data extractor. Your task is to analyze the provided text content and extract the details of a tour package into a structured JSON format.

Analyze the content to find the following information:
- **name**: The main title of the trek or tour.
- **description**: A short summary of the experience.
- **duration**: The total number of days for the trip.
- **difficulty**: The difficulty level (must be one of: Easy, Moderate, Strenuous, Challenging).
- **region**: The geographical area(s), like "Everest" or "Annapurna".
- **itinerary**: A day-by-day breakdown, including the day number, title, and description for each day.
- **inclusions**: A list of services included in the price.
- **exclusions**: A list of services not included in the price.

Strictly adhere to the output schema. If some information is not available, provide a reasonable default or an empty array.

Analyze this text:
---
{{{content}}}
---
`,
});

const importTourFlow = ai.defineFlow(
  {
    name: 'importTourDataFlow',
    inputSchema: ImportTourInputSchema,
    outputSchema: ImportTourOutputSchema,
  },
  async (input) => {
    let contentToAnalyze = '';
    
    if (input.url) {
        try {
            const response = await fetch(input.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.statusText}`);
            }
            contentToAnalyze = await response.text();
        } catch (error: any) {
            console.error('Error fetching URL content:', error);
            throw new Error(`Could not fetch or parse data from URL. Details: ${error.message}`);
        }
    } else if (input.text) {
        contentToAnalyze = input.text;
    }

    if (!contentToAnalyze) {
      throw new Error('No content available to analyze.');
    }

    const llmResponse = await importPrompt({ content: contentToAnalyze });
    const output = llmResponse.output;

    if (!output) {
      throw new Error('Failed to get a structured response from the AI model.');
    }
    
    return output;
  }
);
