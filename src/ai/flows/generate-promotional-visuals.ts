'use server';
/**
 * @fileOverview Flow for generating promotional visuals from product data.
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
      'A promotional visual for the ad, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type GeneratePromotionalVisualsOutput = z.infer<typeof GeneratePromotionalVisualsOutputSchema>;

export async function generatePromotionalVisuals(
  input: GeneratePromotionalVisualsInput
): Promise<GeneratePromotionalVisualsOutput> {
  return generatePromotionalVisualsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromotionalVisualsPrompt',
  input: {schema: GeneratePromotionalVisualsInputSchema},
  output: {schema: GeneratePromotionalVisualsOutputSchema},
  prompt: `You are an expert in creating promotional visuals for advertisements.

  Based on the product information, create a visually appealing image that will capture the attention of the target audience.  The image should be in a data URI format.

  Product Name: {{{productName}}}
  Product Description: {{{productDescription}}}
  Brand Name: {{{brandName}}}
  Target Audience: {{{targetAudience}}}

  Create a promotional visual that is suitable for online advertising.  Make sure the visual includes the product and is eye-catching.

  Output the visual in data URI format. Ensure the data URI includes the correct MIME type and is Base64 encoded.
  `,
});

const generatePromotionalVisualsFlow = ai.defineFlow(
  {
    name: 'generatePromotionalVisualsFlow',
    inputSchema: GeneratePromotionalVisualsInputSchema,
    outputSchema: GeneratePromotionalVisualsOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Create a promotional visual for ${input.productName}, described as ${input.productDescription}, from the brand ${input.brandName}, targeting ${input.targetAudience}.`,
    });

    return {visualDataUri: media!.url};
  }
);
