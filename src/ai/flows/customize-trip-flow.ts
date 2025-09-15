
'use server';

/**
 * @fileOverview An AI flow for creating customized trip itineraries.
 *
 * - customizeTrip - A function that handles the conversation for trip customization.
 * - CustomizeTripInput - The input type for the customizeTrip function.
 * - CustomizeTripOutput - The return type for the customizeTrip function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConversationPartSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const CustomizeTripInputSchema = z.array(ConversationPartSchema);
export type CustomizeTripInput = z.infer<typeof CustomizeTripInputSchema>;

const CustomizeTripOutputSchema = z.object({
  nextQuestion: z.string().describe('The next question for the user.'),
  isFinished: z
    .boolean()
    .describe(
      'Set to true when you have enough information to create an itinerary.'
    ),
});
export type CustomizeTripOutput = z.infer<typeof CustomizeTripOutputSchema>;

// Exported wrapper function to be called from the client
export async function customizeTrip(
  input: CustomizeTripInput
): Promise<CustomizeTripOutput> {
  return customizeTripFlow(input);
}

const customizeTripFlow = ai.defineFlow(
  {
    name: 'customizeTripFlow',
    inputSchema: CustomizeTripInputSchema,
    outputSchema: CustomizeTripOutputSchema,
  },
  async (conversation) => {
    const userQuestionCount = conversation.filter(
      (m) => m.role === 'user'
    ).length;

    // Define the prompt with handlebars
    const tripPrompt = ai.definePrompt({
      name: 'tripCustomizationPrompt',
      input: { schema: CustomizeTripInputSchema },
      output: { schema: CustomizeTripOutputSchema },
      prompt: `You are an expert travel agent for "Happy Mountain Nepal", specializing in treks and tours in the Himalayas. Your goal is to create a personalized trip for the user. You must ask clarifying questions one by one to gather the necessary information.

      Follow these steps:
      1. The user has provided their initial interests and contact information in a single field. The AI should parse this information. This is their first message in the conversation history.
      2. Based on the user's response, ask a relevant follow-up question. Examples: "What is your fitness level (e.g., beginner, moderate, expert)?", "Are you interested in a specific region like Everest or Annapurna?", "What's your ideal trip duration?".
      3. After the second user response, ask a third question. The third question should be "Do you have any other specific requests or remarks (e.g., interest in cultural sites, photography, dietary needs)?".
      4. After the third user response, ask the final question: "How many individuals are you planning to travel with?".
      5. After the fourth user response, you have enough information. Set 'isFinished' to true and for the 'nextQuestion', provide a summary and thank the user, like: "Thank you! We have everything we need to create your personalized plan."

      Keep your questions concise and friendly. Ask only one question at a time.
      
      This is the current state of the conversation:
      {{#each this}}
        **{{role}}**: {{text}}
      {{/each}}
      `,
    });

    const llmResponse = await tripPrompt(conversation);
    const output = llmResponse.output;

    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    
    // An additional check to ensure we finish after the 4th user question.
    if (userQuestionCount >= 4) {
        output.isFinished = true;
        output.nextQuestion = "Thank you! We have everything we need to create your personalized plan.";
    }

    return output;
  }
);
