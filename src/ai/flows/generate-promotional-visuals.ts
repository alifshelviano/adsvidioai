'use server';
/**
 * @fileOverview Flow for generating promotional visuals from product data using getimg.ai.
 *
 * - generatePromotionalVisuals - A function that generates promotional visuals for ads.
 * - GeneratePromotionalVisualsInput - The input type for the generatePromotionalVisuals function.
 * - GeneratePromotionalVisualsOutput - The return type for the generatePromotionalVisuals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromotionalVisualsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A description of the product.'),
  brandName: z.string().describe('The name of the brand.'),
  targetAudience: z.string().describe('The target audience for the ad.'),
});
export type GeneratePromotionalVisualsInput = z.infer<typeof GeneratePromotionalVisualsInputSchema>;

const GeneratePromotionalVisualsOutputSchema = z.object({
  visualDataUri: z
    .string()
    .describe(
      'A promotional visual for the ad, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GeneratePromotionalVisualsOutput = z.infer<typeof GeneratePromotionalVisualsOutputSchema>;

export async function generatePromotionalVisuals(
  input: GeneratePromotionalVisualsInput
): Promise<GeneratePromotionalVisualsOutput> {
  return generatePromotionalVisualsFlow(input);
}

const generatePromotionalVisualsFlow = ai.defineFlow(
  {
    name: 'generatePromotionalVisualsFlow',
    inputSchema: GeneratePromotionalVisualsInputSchema,
    outputSchema: GeneratePromotionalVisualsOutputSchema,
  },
  async input => {
    const apiKey = process.env.GETIMG_API_KEY;
    if (!apiKey) {
      throw new Error('GETIMG_API_KEY is not defined in the environment.');
    }

    const prompt = `Create a promotional visual for ${input.productName}, described as ${input.productDescription}, from the brand ${input.brandName}, targeting ${input.targetAudience}.`;

    const response = await fetch('https://api.getimg.ai/v1/stable-diffusion/text-to-image', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'stable-diffusion-xl-v1-5',
        width: 1024,
        height: 576,
        output_format: 'jpeg',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`getimg.ai API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    
    if (!data.image) {
        throw new Error('No image returned from getimg.ai API.');
    }

    const visualDataUri = `data:image/jpeg;base64,${data.image}`;

    return {visualDataUri: visualDataUri};
  }
);
