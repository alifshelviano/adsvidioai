'use server';
/**
 * @fileOverview Flow for generating a silent video ad from an image and script.
 *
 * - generateVideoAd - A function that orchestrates the silent video generation.
 * - GenerateVideoAdInput - Input type for the video generation flow.
 * - GenerateVideoAdOutput - Output type for the video generation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoAdInputSchema = z.object({
  imageDataUri: z.string().describe('The base64 encoded image data URI.'),
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
  async ({imageDataUri, script}) => {
    // 1. Generate a silent video from the image using the Veo model
    let {operation} = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: [
        {
          text: `Animate this image subtly for an ad. Prompt: ${script}`,
        },
        {
          media: {
            contentType: imageDataUri.split(':')[1].split(';')[0],
            url: imageDataUri,
          },
        },
      ],
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation for video generation.');
    }

    // 2. Poll for video generation completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error(`Failed to generate video: ${operation.error.message}`);
    }

    const silentVideoPart = operation.output?.message?.content.find(p => !!p.media);
    if (!silentVideoPart?.media) {
      throw new Error('Failed to find the generated silent video in the operation result.');
    }

    // 3. Download the silent video
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(`${silentVideoPart.media.url}&key=${process.env.GEMINI_API_KEY}`);
    
    if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        throw new Error('Failed to download the generated silent video.');
    }
    
    const silentVideoBuffer = await videoDownloadResponse.arrayBuffer();
    
    // 4. Convert the final video to a data URI
    const videoDataUri = `data:video/mp4;base64,${Buffer.from(silentVideoBuffer).toString('base64')}`;

    return {videoDataUri};
  }
);
