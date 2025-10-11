'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating ad content (ad copy, hashtags, and captions) from product data.
 *
 * - generateAdContent - A function that takes product data as input and returns generated ad content.
 * - GenerateAdContentInput - The input type for the generateAdContent function.
 * - GenerateAdContentOutput - The return type for the generateAdContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdContentInputSchema = z.object({
  productTitle: z.string().describe('The title of the product.'),
  productDescription: z.string().describe('A description of the product.'),
  productPrice: z.number().describe('The price of the product.'),
  productImageUrl: z.string().describe('URL of the product image.'),
});

export type GenerateAdContentInput = z.infer<typeof GenerateAdContentInputSchema>;

const GenerateAdContentOutputSchema = z.object({
  adCopy: z.string().describe('The generated ad copy.'),
  hashtags: z.string().describe('Generated relevant hashtags.'),
  captions: z.string().describe('Generated captions for the ad.'),
});

export type GenerateAdContentOutput = z.infer<typeof GenerateAdContentOutputSchema>;

export async function generateAdContent(input: GenerateAdContentInput): Promise<GenerateAdContentOutput> {
  return generateAdContentFlow(input);
}

const generateAdContentPrompt = ai.definePrompt({
  name: 'generateAdContentPrompt',
  input: {schema: GenerateAdContentInputSchema},
  output: {schema: GenerateAdContentOutputSchema},
  prompt: `You are an AI copywriter specializing in creating compelling ad content.

  Based on the following product information, generate:

  - Ad copy that is engaging and persuasive.
  - Relevant hashtags to increase visibility.
  - Captions suitable for social media platforms.

  Product Title: {{{productTitle}}}
  Product Description: {{{productDescription}}}
  Product Price: {{{productPrice}}}
  Product Image URL: {{{productImageUrl}}}

  Ensure the output is creative, platform-appropriate, and optimized for conversions.
  Here is an example of what the output should look like:
  {
    "adCopy": "Check out our new product!",
    "hashtags": "#newproduct #sale",
    "captions": "Get yours today!"
  }
  `,
});

const generateAdContentFlow = ai.defineFlow(
  {
    name: 'generateAdContentFlow',
    inputSchema: GenerateAdContentInputSchema,
    outputSchema: GenerateAdContentOutputSchema,
  },
  async input => {
    const {output} = await generateAdContentPrompt(input);
    return output!;
  }
);
