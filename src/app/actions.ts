
// src/app/actions.ts
"use server";

import { generateProductDescription, type GenerateProductDescriptionInput, type GenerateProductDescriptionOutput } from '@/ai/flows/generate-product-description';
import { detectObjectFromImage, type DetectObjectFromImageInput, type DetectObjectFromImageOutput } from '@/ai/flows/detect-object-from-image-flow';
import { getMedicineInfo, type GetMedicineInfoInput, type GetMedicineInfoOutput } from '@/ai/flows/get-medicine-info-flow';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getProductDescriptionAction(input: GenerateProductDescriptionInput): Promise<ActionResult<GenerateProductDescriptionOutput>> {
  try {
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

export async function detectObjectAction(input: DetectObjectFromImageInput): Promise<ActionResult<DetectObjectFromImageOutput>> {
  try {
    if (!input.imageDataUri || !input.imageDataUri.startsWith('data:image/')) {
      return { success: false, error: "Invalid image data provided." };
    }

    const result = await detectObjectFromImage(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in detectObjectAction:", error);
    if (error instanceof Error) {
      return { success: false, error: `AI service error: ${error.message}` };
    }
    return { success: false, error: "An unknown error occurred while detecting the object." };
  }
}

export async function getMedicineInfoAction(input: GetMedicineInfoInput): Promise<ActionResult<GetMedicineInfoOutput>> {
  try {
    if (!input.medicineName || input.medicineName.trim().length < 2) {
      return { success: false, error: "Medicine name must be at least 2 characters long." };
    }
    if (input.medicineName.trim().length > 100) {
        return { success: false, error: "Medicine name must be 100 characters or less." };
    }

    // Language is now part of GetMedicineInfoInput
    const result = await getMedicineInfo(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getMedicineInfoAction:", error);
    if (error instanceof Error) {
      return { success: false, error: `AI service error: ${error.message}` };
    }
    return { success: false, error: "An unknown error occurred while fetching medicine information." };
  }
}
