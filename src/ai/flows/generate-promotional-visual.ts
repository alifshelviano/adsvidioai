'use server';
/**
 * @fileOverview A Genkit flow for generating a promotional visual using an image generation model.
 *
 * - generatePromotionalVisual - Generates a visual based on product information.
 * - GeneratePromotionalVisualInput - The input type for the flow.
 * - GeneratePromotionalVisualOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePromotionalVisualInputSchema = z.object({
  productTitle: z.string().describe('The title of the product.'),
  productDescription: z.string().describe('The description of the product.'),
});

export type GeneratePromotionalVisualInput = z.infer<
  typeof GeneratePromotionalVisualInputSchema
>;

const GeneratePromotionalVisualOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI (e.g., 'data:image/jpeg;base64,...')."
    ),
  revisedPrompt: z.string().describe('The revised prompt used for generation.'),
});

export type GeneratePromotionalVisualOutput = z.infer<
  typeof GeneratePromotionalVisualOutputSchema
>;

export async function generatePromotionalVisual(
  input: GeneratePromotionalVisualInput
): Promise<GeneratePromotionalVisualOutput> {
  return generatePromotionalVisualFlow(input);
}

const generatePromotionalVisualFlow = ai.defineFlow(
  {
    name: 'generatePromotionalVisualFlow',
    inputSchema: GeneratePromotionalVisualInputSchema,
    outputSchema: GeneratePromotionalVisualOutputSchema,
  },
  async ({ productTitle, productDescription }) => {
    const prompt = `Create a visually stunning, cinematic promotional image for a product.
    Product Name: "${productTitle}"
    Description: "${productDescription}"
    Style: High-quality, professional, dramatic lighting, suitable for a high-end advertisement. Do not include any text in the image.`;

    const { media, revisedPrompt } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt,
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a data URI.');
    }

    return {
      imageDataUri: media.url,
      revisedPrompt: revisedPrompt || prompt,
    };
  }
);
