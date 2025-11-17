
'use server';
/**
 * @fileOverview An AI flow for searching tours.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firestore } from '@/lib/firebase-server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Tour } from '@/lib/types';

const SearchInputSchema = z.string();
const SearchOutputSchema = z.object({
  tours: z.array(z.any()), // We'll use any for now as Tour type is complex for Zod.
});

export async function searchTours(term: string): Promise<z.infer<typeof SearchOutputSchema>> {
  return searchToursFlow(term);
}

const searchToursFlow = ai.defineFlow(
  {
    name: 'searchToursFlow',
    inputSchema: SearchInputSchema,
    outputSchema: SearchOutputSchema,
  },
  async (term) => {
    try {
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
      const tours = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tour[];
      
      return { tours };

    } catch (error) {
      console.error("Firestore search failed:", error);
      return { tours: [] };
    }
  }
);
