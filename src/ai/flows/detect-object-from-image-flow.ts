
'use server';
/**
 * @fileOverview An AI flow to detect the primary object in an image.
 *
 * - detectObjectFromImage - A function that identifies the main object in an image.
 * - DetectObjectFromImageInput - The input type for the detectObjectFromImage function.
 * - DetectObjectFromImageOutput - The return type for the detectObjectFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectObjectFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image captured from the camera, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the response, e.g., "en" for English, "mr" for Marathi.'),
});
export type DetectObjectFromImageInput = z.infer<typeof DetectObjectFromImageInputSchema>;

const DetectObjectFromImageOutputSchema = z.object({
  objectName: z.string().describe('The name of the primary object identified in the image. This should be in the requested language if specified.'),
  contextualClues: z.string().optional().describe('Brief contextual clues about the identified object (e.g., category, typical use). This should be in the requested language if specified.'),
});
export type DetectObjectFromImageOutput = z.infer<typeof DetectObjectFromImageOutputSchema>;

export async function detectObjectFromImage(input: DetectObjectFromImageInput): Promise<DetectObjectFromImageOutput> {
  return detectObjectFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectObjectFromImagePrompt',
  input: {schema: DetectObjectFromImageInputSchema},
  output: {schema: DetectObjectFromImageOutputSchema},
  prompt: `You are an AI assistant specialized in identifying objects within images.
{{#if language}}Respond in {{language}}. If the language is 'mr' (Marathi), ensure the object name and contextual clues are in Marathi.{{/if}}
Analyze the provided image and identify the single, most prominent object.
Provide the name of this object.
If possible, also provide a few brief, relevant contextual clues about the object (e.g., "fruit", "electronic device", "kitchen utensil").
The object name and contextual clues must be in the requested language if specified.

Image: {{media url=imageDataUri}}`,
  // Using a model that supports image input. It's good to be explicit.
  // The global ai object in genkit.ts might have a default, but this ensures capability.
  // Ensure your project's configured model in genkit.ts (e.g., Gemini) supports multimodal input.
  // No specific model override needed here if the default in genkit.ts is already multimodal.
});

const detectObjectFromImageFlow = ai.defineFlow(
  {
    name: 'detectObjectFromImageFlow',
    inputSchema: DetectObjectFromImageInputSchema,
    outputSchema: DetectObjectFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to detect an object or provide a response.');
    }
    return output;
  }
);
