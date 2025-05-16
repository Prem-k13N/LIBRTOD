
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
  usage: z.string().describe('A comprehensive description of what the medicine is typically used for. This is for informational purposes only and not medical advice.'),
  howToUse: z.string().optional().describe('General guidance on how the medicine is typically taken or administered (e.g., with food, specific times of day). This is for informational purposes only and not medical advice; avoid specific dosages.'),
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
{{#if language}}Respond in {{language}}. If the language is 'mr' (Marathi), ensure the entire response, including field labels and the disclaimer, is in Marathi.{{/if}}
Given the medicine name: {{{medicineName}}}, provide the following information:
1.  **Usage:** A comprehensive description of what this medicine is typically used for.
2.  **How to Use (General Guidance):** Provide general guidance on how this medicine is typically taken or administered (e.g., 'usually taken with water', 'can be taken with or without food', 'typically applied to the affected area X times a day as directed'). This should be general advice and NOT specific dosage instructions or a treatment plan.
3.  **Common Brand Names:** What are some common brand names, if any? (If none or not applicable, state that)
4.  **General Precautions:** Are there any general precautions or important things to note? (Keep this brief and general)

IMPORTANT: Frame your response as general information. You MUST include a disclaimer that this information is not a substitute for professional medical advice and users should consult a healthcare provider for any medical concerns. This disclaimer must also be in the response language if specified.
Do not provide specific dosage information or individual treatment plans.

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

