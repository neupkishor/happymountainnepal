
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ImportTourInputSchema = z.object({
  url: z.string().url(),
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
export type ImportTourOutput = z.infer<typeof ImportTourOutputSchema>;

export async function importTourFromUrl(input: ImportTourInput): Promise<ImportTourOutput> {
  return importTourFlow(input);
}

const importPrompt = ai.definePrompt({
  name: 'importTourPrompt',
  input: { schema: ImportTourInputSchema },
  output: { schema: ImportTourOutputSchema },
  prompt: `You are an expert travel data extractor. Your task is to scrape the content from the provided URL and extract the details of the tour package into a structured JSON format.

Analyze the entire page content to find the following information:
- **name**: The main title of the trek or tour.
- **description**: A short summary of the experience.
- **duration**: The total number of days for the trip.
- **difficulty**: The difficulty level (must be one of: Easy, Moderate, Strenuous, Challenging).
- **region**: The geographical area(s), like "Everest" or "Annapurna".
- **itinerary**: A day-by-day breakdown, including the day number, title, and description for each day.
- **inclusions**: A list of services included in the price.
- **exclusions**: A list of services not included in the price.

Strictly adhere to the output schema. If some information is not available, provide a reasonable default or an empty array.

Scrape this URL: {{{url}}}
`,
});

const importTourFlow = ai.defineFlow(
  {
    name: 'importTourFlow',
    inputSchema: ImportTourInputSchema,
    outputSchema: ImportTourOutputSchema,
  },
  async (input) => {
    const llmResponse = await importPrompt(input);
    const output = llmResponse.output;

    if (!output) {
      throw new Error('Failed to get a structured response from the AI model.');
    }
    
    // Here you could add post-processing logic if needed,
    // e.g., cleaning up extracted text, ensuring data consistency, etc.

    return output;
  }
);
