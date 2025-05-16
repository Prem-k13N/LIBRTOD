
'use server';
/**
 * @fileOverview Provides information about a given medicine.
 *
 * - getMedicineInfo - A function that retrieves usage information for a medicine.
 * - GetMedicineInfoInput - The input type for the getMedicineInfo function.
 * - GetMedicineInfoOutput - The return type for the getMedicineInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMedicineInfoInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine to get information about.'),
  language: z.string().optional().describe('The language for the response, e.g., "en" for English, "mr" for Marathi.'),
});
export type GetMedicineInfoInput = z.infer<typeof GetMedicineInfoInputSchema>;

const GetMedicineInfoOutputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine.'),
  usage: z.string().describe('Information about what the medicine is typically used for. This is for informational purposes only and not medical advice.'),
  commonBrands: z.string().optional().describe('Common brand names for this medicine, if applicable.'),
  precautions: z.string().optional().describe('General precautions or important information. This is not exhaustive medical advice.'),
});
export type GetMedicineInfoOutput = z.infer<typeof GetMedicineInfoOutputSchema>;

export async function getMedicineInfo(input: GetMedicineInfoInput): Promise<GetMedicineInfoOutput> {
  return getMedicineInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMedicineInfoPrompt',
  input: {schema: GetMedicineInfoInputSchema},
  output: {schema: GetMedicineInfoOutputSchema},
  prompt: `You are a helpful AI assistant providing general information about medicines.
{{#if language}}Respond in {{language}}. If the language is 'mr' (Marathi), ensure the entire response, including labels and the disclaimer, is in Marathi.{{/if}}
Given the medicine name: {{{medicineName}}}, provide the following information:
1.  What is this medicine typically used for?
2.  What are some common brand names, if any? (If none or not applicable, state that)
3.  Are there any general precautions or important things to note? (Keep this brief and general)

IMPORTANT: Frame your response as general information. You MUST include a disclaimer that this information is not a substitute for professional medical advice and users should consult a healthcare provider for any medical concerns. This disclaimer must also be in the response language if specified.
Do not provide dosage information or specific treatment plans.

Medicine Name: {{{medicineName}}}
`,
});

const getMedicineInfoFlow = ai.defineFlow(
  {
    name: 'getMedicineInfoFlow',
    inputSchema: GetMedicineInfoInputSchema,
    outputSchema: GetMedicineInfoOutputSchema,
  },
  async (input: GetMedicineInfoInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to provide medicine information.');
    }
    // Ensure the output includes the medicine name for clarity, copying from input.
    return {
        ...output,
        medicineName: input.medicineName,
    };
  }
);
