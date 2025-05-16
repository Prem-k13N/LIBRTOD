// src/app/actions.ts
"use server";

import { generateProductDescription, type GenerateProductDescriptionInput, type GenerateProductDescriptionOutput } from '@/ai/flows/generate-product-description';

interface ActionResult {
  success: boolean;
  data?: GenerateProductDescriptionOutput;
  error?: string;
}

export async function getProductDescriptionAction(input: GenerateProductDescriptionInput): Promise<ActionResult> {
  try {
    // Basic input validation (could be more sophisticated)
    if (!input.productName || input.productName.trim().length < 2) {
      return { success: false, error: "Product name must be at least 2 characters long." };
    }
     if (input.productName.trim().length > 100) {
        return { success: false, error: "Product name must be 100 characters or less." };
    }
    if (input.contextClues && input.contextClues.trim().length > 500) {
        return { success: false, error: "Context clues must be 500 characters or less." };
    }


    const result = await generateProductDescription(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getProductDescriptionAction:", error);
    if (error instanceof Error) {
      return { success: false, error: `AI service error: ${error.message}` };
    }
    return { success: false, error: "An unknown error occurred while generating the product description." };
  }
}
