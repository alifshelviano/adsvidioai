'use server';
/**
 * @fileOverview A Genkit flow for generating a video ad using RunwayML.
 *
 * - generateVideoRunway - A function that creates a video from an image and a script.
 * - GenerateVideoRunwayInput - The input type for the function.
 * - GenerateVideoRunwayOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RunwayML, TaskFailedError } from '@runwayml/sdk';
import { genkit } from 'genkit';

const GenerateVideoRunwayInputSchema = z.object({
  imageDataUri: z.string().describe('The base64 encoded image data URI.'),
  promptText: z.string().describe('The text prompt/script for the video.'),
});

export type GenerateVideoRunwayInput = z.infer<typeof GenerateVideoRunwayInputSchema>;

const GenerateVideoRunwayOutputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the generated video.'),
});

export type GenerateVideoRunwayOutput = z.infer<typeof GenerateVideoRunwayOutputSchema>;

export async function generateVideoRunway(
  input: GenerateVideoRunwayInput
): Promise<GenerateVideoRunwayOutput> {
  return generateVideoRunwayFlow(input);
}

const generateVideoRunwayFlow = ai.defineFlow(
  {
    name: 'generateVideoRunwayFlow',
    inputSchema: GenerateVideoRunwayInputSchema,
    outputSchema: GenerateVideoRunwayOutputSchema,
  },
  async ({ imageDataUri, promptText }) => {
    if (!process.env.RUNWAYML_API_KEY) {
      throw new Error('RUNWAYML_API_KEY is not defined in the environment.');
    }

    const client = new RunwayML();

    genkit.log('info', 'Starting RunwayML image-to-video task...');

    try {
      // Create the task and wait for it to complete.
      const task = await client.imageToVideo
        .create({
          model: 'gen2',
          promptImage: imageDataUri,
          promptText: promptText,
          ratio: '16:9',
          duration: 5,
        })
        .waitForTaskOutput();

      genkit.log('info', 'RunwayML task completed successfully.');

      if (task.output?.video_url) {
        return {
          videoUrl: task.output.video_url,
        };
      } else {
        throw new Error('RunwayML task did not return a video URL.');
      }
    } catch (error) {
      if (error instanceof TaskFailedError) {
        genkit.log('error', 'RunwayML task failed.', error.taskDetails);
        throw new Error(`RunwayML video generation failed: ${error.message}`);
      } else {
        genkit.log('error', 'An unexpected error occurred with RunwayML.', error);
        throw error as Error;
      }
    }
  }
);
