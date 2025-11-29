
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

const ImportBlogInputSchema = z.object({
  url: z.string().url(),
});

const ImportBlogOutputSchema = z.object({
  title: z.string().describe('The main title of the blog post.'),
  content: z.string().describe('The full content of the blog post, formatted as clean HTML.'),
  excerpt: z.string().describe('A brief, engaging summary of the post, typically one or two paragraphs.'),
  author: z.string().describe('The name of the author.'),
  image: z.string().url().describe('The URL of the main featured image for the blog post.'),
});

export type ImportBlogInput = z.infer<typeof ImportBlogInputSchema>;
export type ImportedBlogData = z.infer<typeof ImportBlogOutputSchema>;

export async function importBlogPost(input: ImportBlogInput): Promise<ImportedBlogData> {
  return importBlogFlow(input);
}

const importPrompt = ai.definePrompt({
  name: 'importBlogPostPrompt',
  input: { schema: z.object({ content: z.string() }) },
  output: { schema: ImportBlogOutputSchema },
  prompt: `You are an expert content extractor. Your task is to analyze the provided HTML content of a blog post and extract its key details into a structured JSON format.

Analyze the content to find the following information:
- **title**: The main headline of the article.
- **content**: The full body of the post. Convert it to clean, semantic HTML. Ensure all images, paragraphs, and headings are preserved.
- **excerpt**: A concise summary of the article.
- **author**: The name of the person who wrote the post.
- **image**: The absolute URL of the main featured image.

Strictly adhere to the output schema. If some information is not available, provide a reasonable default or an empty string.

Analyze this content:
---
{{{content}}}
---
`,
});

const importBlogFlow = ai.defineFlow(
  {
    name: 'importBlogPostFlow',
    inputSchema: ImportBlogInputSchema,
    outputSchema: ImportBlogOutputSchema,
  },
  async (input) => {
    let contentToAnalyze = '';
    
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
