
'use server';
/**
 * @fileOverview An AI flow for searching tours and generating contextual information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firestore } from '@/lib/firebase-server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Tour } from '@/lib/types';

const SearchInputSchema = z.string();
const SearchOutputSchema = z.object({
  tours: z.array(z.any()), // We'll use any for now as Tour type is complex for Zod.
  context: z.string().describe("A markdown-formatted text providing context about the search term, including location, climbing info, and gear lists."),
});

export async function searchToursAndGenerateContext(term: string): Promise<z.infer<typeof SearchOutputSchema>> {
  return searchToursFlow(term);
}

const contextPrompt = ai.definePrompt({
  name: 'generateSearchContextPrompt',
  input: { schema: z.object({ term: z.string() }) },
  output: { schema: z.string() }, // The output is just a string of markdown
  prompt: `You are a helpful travel guide assistant for a Himalayan trekking company. The user has searched for "{{term}}".

Provide a helpful, engaging, and informative overview about this topic in markdown format.

Include the following sections if relevant:
- A brief introduction to the location or activity.
- Information on "How to Climb" or "How to Get There".
- A "Gear List" with essential items.

Keep the tone encouraging and professional. Do not invent information if the topic is obscure.`,
});

const searchToursFlow = ai.defineFlow(
  {
    name: 'searchToursFlow',
    inputSchema: SearchInputSchema,
    outputSchema: SearchOutputSchema,
  },
  async (term) => {
    // Run both tasks in parallel
    const [toursPromise, contextPromise] = await Promise.allSettled([
      // Task 1: Search Firestore
      (async () => {
        const packagesRef = collection(firestore, 'packages');
        // A simple case-insensitive search requires more complex setup (like a third-party service).
        // For now, we'll rely on a lowercase 'searchKeywords' field. We need to add this field to our data.
        const searchTermLower = term.toLowerCase();
        const q = query(
            packagesRef, 
            where('searchKeywords', 'array-contains', searchTermLower),
            limit(20)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tour[];
      })(),
      
      // Task 2: Generate Context with AI
      (async () => {
        const llmResponse = await contextPrompt({ term });
        return llmResponse.output || `Information about ${term} is not available at the moment.`;
      })()
    ]);

    const tours = toursPromise.status === 'fulfilled' ? toursPromise.value : [];
    const context = contextPromise.status === 'fulfilled' ? contextPromise.value : `An error occurred while fetching information about "${term}".`;

    if (toursPromise.status === 'rejected') {
        console.error("Firestore search failed:", toursPromise.reason);
    }

    return { tours, context };
  }
);
