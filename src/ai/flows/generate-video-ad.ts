'use server';
/**
 * @fileOverview Flow for generating a silent video ad from an image and script.
 *
 * - generateVideoAd - A function that orchestrates the silent video generation.
 * - GenerateVideoAdInput - Input type for the video generation flow.
 * - GenerateVideoAdOutput - Output type for the video generation flow.
 */

import { generateVideoHuggingFace } from './generate-video-huggingface';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateVideoAdInputSchema = z.object({
  script: z.string().describe('The ad script/prompt for the video.'),
});
export type GenerateVideoAdInput = z.infer<typeof GenerateVideoAdInputSchema>;

const GenerateVideoAdOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated silent video as a data URI.'),
});
export type GenerateVideoAdOutput = z.infer<typeof GenerateVideoAdOutputSchema>;

export async function generateVideoAd(
  input: GenerateVideoAdInput
): Promise<GenerateVideoAdOutput> {
  return generateVideoAdFlow(input);
}

const generateVideoAdFlow = ai.defineFlow(
  {
    name: 'generateVideoAdFlow',
    inputSchema: GenerateVideoAdInputSchema,
    outputSchema: GenerateVideoAdOutputSchema,
  },
  async ({script}) => {

    const result = await generateVideoHuggingFace({ prompt: script });

    return {videoDataUri: result.videoDataUri};
  }
);
