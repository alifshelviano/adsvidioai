'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting product information from a URL.
 *
 * - extractProductInfo - A function that takes a URL and returns structured product data.
 * - ExtractProductInfoInput - The input type for the extractProductInfo function.
 * - ExtractProductInfoOutput - The return type for the extractProductInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {genkit} from 'genkit';

const fetchPageContentTool = ai.defineTool(
  {
    name: 'fetchPageContent',
    description: 'Fetches the HTML content of a given URL.',
    inputSchema: z.object({url: z.string().url()}),
    outputSchema: z.string(),
  },
  async ({url}) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (e: any) {
      // Log the error but return a user-friendly message to the LLM.
      genkit.log('error', `Failed to fetch URL content: ${e.message}`);
      return 'Failed to retrieve content from the URL. Please inform the user.';
    }
  }
);

const ExtractProductInfoInputSchema = z.object({
  url: z.string().url().describe('The URL of the product page.'),
});

export type ExtractProductInfoInput = z.infer<
  typeof ExtractProductInfoInputSchema
>;

const ExtractProductInfoOutputSchema = z.object({
  title: z.string().describe('The title of the product.'),
  description: z.string().describe('A detailed description of the product.'),
  price: z.number().describe('The price of the product.'),
  imageUrl: z.string().url().describe('The main image URL of the product.'),
});

export type ExtractProductInfoOutput = z.infer<
  typeof ExtractProductInfoOutputSchema
>;

export async function extractProductInfo(
  input: ExtractProductInfoInput
): Promise<ExtractProductInfoOutput> {
  return extractProductInfoFlow(input);
}

const extractProductInfoPrompt = ai.definePrompt({
  name: 'extractProductInfoPrompt',
  tools: [fetchPageContentTool],
  output: {schema: ExtractProductInfoOutputSchema},
  prompt: `You are an expert web scraper and data extractor. Your task is to extract product information from the provided URL.
  First, call the fetchPageContent tool with the provided 'url'.
  Then, analyze the resulting HTML to find the product's name, a detailed description, its price (as a number, remove currency symbols and commas), and the URL of its main image.
  Prioritize content that is most likely the main product information on the page. Look for common e-commerce HTML structures.
  URL to process: {{{url}}}`,
});

const extractProductInfoFlow = ai.defineFlow(
  {
    name: 'extractProductInfoFlow',
    inputSchema: ExtractProductInfoInputSchema,
    outputSchema: ExtractProductInfoOutputSchema,
  },
  async input => {
    const llmResponse = await extractProductInfoPrompt(input);
    const output = llmResponse.output();
    if (!output) {
      throw new Error('Failed to extract product info: No output from model.');
    }
    return output;
  }
);
