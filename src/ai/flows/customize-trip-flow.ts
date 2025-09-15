
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

export async function customizeTrip(
  input: CustomizeTripInput
): Promise<CustomizeTripOutput> {
  return customizeTripFlow(input);
}

const tripPrompt = ai.definePrompt({
  name: 'tripCustomizationPrompt',
  input: { schema: CustomizeTripInputSchema },
  output: { schema: CustomizeTripOutputSchema },
  prompt: `You are an expert travel agent for "Happy Mountain Nepal", specializing in treks and tours in the Himalayas. Your goal is to create a personalized trip for the user by asking a series of clarifying questions.

You will have a conversation with a potential customer. The conversation is provided as a series of turns. Your job is to respond with the next question to ask.

**Conversation Rules:**

1.  **First Turn Analysis:** The very first user message contains their initial interests and contact information.
    *   **VALIDATE:** Check if at least an email or a phone number is present. A valid phone number must include a country code.
    *   **If INVALID:** Your 'nextQuestion' must politely ask for the missing contact information. For example: "Thank you for your interest! It looks like you forgot to provide a contact method. Could you please provide an email or a phone number with a country code?" Do NOT move on. Set 'isFinished' to false.
    *   **If VALID:** Ask a relevant follow-up question to understand their needs better. Examples: "What is your fitness level (e.g., beginner, moderate, expert)?", "Are you interested in a specific region like Everest or Annapurna?", "What's your ideal trip duration?".

2.  **Sequential Questioning:** After the initial validation, ask one question at a time to gather more details. Aim for a total of 3-5 questions to build a complete picture.
    *   Good follow-up questions could be about: group size, specific interests (culture, photography), budget, travel dates, etc.
    *   Keep questions friendly and concise.

3.  **Finishing the Conversation:**
    *   Once you have gathered enough information (usually after 3-5 user responses), you must end the conversation.
    *   To end, set 'isFinished' to true.
    *   For the 'nextQuestion', provide a friendly closing message, summarizing that you have all you need. Example: "Thank you! We have everything we need to create your personalized plan and will be in touch shortly."

**Current Conversation:**
{{#each this}}
  **{{role}}**: {{text}}
{{/each}}
`,
});

const customizeTripFlow = ai.defineFlow(
  {
    name: 'customizeTripFlow',
    inputSchema: CustomizeTripInputSchema,
    outputSchema: CustomizeTripOutputSchema,
  },
  async (conversation) => {
    const llmResponse = await tripPrompt(conversation);
    const output = llmResponse.output;

    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    
    // Safety check to ensure the flow finishes eventually
    const userQuestionCount = conversation.filter(
      (m) => m.role === 'user'
    ).length;
    if (userQuestionCount >= 5 && !output.isFinished) {
        output.isFinished = true;
        output.nextQuestion = "Thank you! We have everything we need to create your personalized plan and will be in touch shortly.";
    }

    return output;
  }
);
