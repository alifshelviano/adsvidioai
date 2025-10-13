'use server';
/**
 * @fileOverview Flow for generating a video ad using RunwayML.
 *
 * - generateVideoRunway - A function that orchestrates the video generation.
 * - GenerateVideoRunwayInput - Input type for the video generation flow.
 * - GenerateVideoRunwayOutput - Output type for the video generation flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';

const GenerateVideoRunwayInputSchema = z.object({
  imageDataUri: z.string().describe('The base64 encoded image data URI.'),
  script: z.string().describe('The ad script/prompt for the video.'),
});
export type GenerateVideoRunwayInput = z.infer<typeof GenerateVideoRunwayInputSchema>;

const GenerateVideoRunwayOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
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
  async ({ imageDataUri, script }) => {
    const apiKey = process.env.RUNWAYML_API_KEY;
    if (!apiKey) {
      throw new Error('RUNWAYML_API_KEY is not set in the environment.');
    }

    const client = new RunwayML({ runwayToken: apiKey });

    try {
      // Runway's gen2 model is a good choice for image-to-video
      const task = await client.imageToVideo
        .create({
          model: 'gen2', 
          promptImage: imageDataUri,
          promptText: script,
          duration: 5,
        })
        .waitForTaskOutput();

        if (!task.mp4) {
            throw new Error('RunwayML task did not return a video file.');
        }

        // The task.mp4 is a URL to the video. We need to fetch it and convert to a data URI.
        const response = await fetch(task.mp4);
        if (!response.ok) {
            throw new Error(`Failed to download video from RunwayML: ${response.statusText}`);
        }
        const videoBuffer = await response.arrayBuffer();
        const videoDataUri = `data:video/mp4;base64,${Buffer.from(videoBuffer).toString('base64')}`;

      return { videoDataUri };

    } catch (error) {
      if (error instanceof TaskFailedError) {
        console.error('The video failed to generate from RunwayML.');
        console.error(error.taskDetails);
        throw new Error(`RunwayML task failed: ${error.message}`);
      } else {
        console.error('An unexpected error occurred with RunwayML:', error);
        throw error;
      }
    }
  }
);
