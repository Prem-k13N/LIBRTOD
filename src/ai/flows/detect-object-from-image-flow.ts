
'use server';
/**
 * @fileOverview An AI flow to detect the primary object in an image, focusing on medicines.
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
  objectName: z.string().describe('The name of the primary object identified in the image, ideally the medicine name extracted from text. This should be in the requested language if specified.'),
  contextualClues: z.string().optional().describe('Brief contextual clues about the identified object (e.g., "blister pack of tablets", "bottle of liquid medicine", "medical cream tube"). This should be in the requested language if specified.'),
});
export type DetectObjectFromImageOutput = z.infer<typeof DetectObjectFromImageOutputSchema>;

export async function detectObjectFromImage(input: DetectObjectFromImageInput): Promise<DetectObjectFromImageOutput> {
  return detectObjectFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectObjectFromImagePrompt',
  input: {schema: DetectObjectFromImageInputSchema},
  output: {schema: DetectObjectFromImageOutputSchema},
  prompt: `You are an AI assistant specialized in identifying objects within images, with a strong focus on recognizing medicines and medical products.
{{#if language}}Respond in {{language}}. If the language is 'mr' (Marathi), ensure the object name and contextual clues are in Marathi.{{/if}}
Analyze the provided image.
1. Identify the primary object. If it appears to be a medicine (e.g., tablets, capsules, syrup bottle, ointment tube, inhaler, medical packaging), prioritize identifying it as such.
2. **Crucially, if there is legible text on the object or its packaging that seems to be a product name or medicine name, try to extract and provide this as the objectName.** If no specific medicine name can be read, identify the type of packaging or form (e.g., "blister pack", "syrup bottle").
3. Provide brief contextual clues about the identified object or its form (e.g., "blister pack of tablets", "bottle of liquid medicine", "medical cream tube", "pharmaceutical product").

The object name (ideally the medicine name from text) and contextual clues must be in the requested language if specified.

Image: {{media url=imageDataUri}}`,
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

