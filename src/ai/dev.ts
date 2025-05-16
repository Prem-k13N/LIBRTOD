import { config } from 'dotenv';
config();

import '@/ai/flows/generate-product-description.ts';
import '@/ai/flows/detect-object-from-image-flow.ts'; // Added new flow
