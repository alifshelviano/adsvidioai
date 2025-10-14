'use server';
/**
 * @fileOverview A Genkit flow for generating a video ad using HeyGen.
 *
 * - generateVideoHeygen - A function that creates a video from a script.
 * - GenerateVideoHeygenInput - The input type for the function.
 * - GenerateVideoHeygenOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVideoHeygenInputSchema = z.object({
  promptText: z.string().describe('The text prompt/script for the video.'),
});

export type GenerateVideoHeygenInput = z.infer<typeof GenerateVideoHeygenInputSchema>;

const GenerateVideoHeygenOutputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the generated video.'),
});

export type GenerateVideoHeygenOutput = z.infer<typeof GenerateVideoHeygenOutputSchema>;


async function pollVideoStatus(videoId: string, apiKey: string): Promise<string> {
  const pollUrl = `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`;
  const headers = { 'x-api-key': apiKey };

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds

    console.log(`Polling HeyGen video status for ID: ${videoId}`);
    const statusResponse = await fetch(pollUrl, { headers });

    if (!statusResponse.ok) {
      const errorBody = await statusResponse.text();
      console.error(`HeyGen polling failed: ${statusResponse.status} ${errorBody}`);
      continue; // Continue polling even if one check fails
    }

    const statusData = await statusResponse.json();
    console.log('HeyGen status poll response:', statusData);
    
    const videoStatus = statusData.data.status;
    if (videoStatus === 'completed') {
      if (!statusData.data.video_url) {
        throw new Error('HeyGen video generation completed but no video URL was returned.');
      }
      return statusData.data.video_url;
    } else if (videoStatus === 'failed') {
      throw new Error(`HeyGen video generation failed. Reason: ${statusData.data.error?.message || 'Unknown error'}`);
    }
    // If status is 'processing' or 'pending', the loop continues.
  }
}

export async function generateVideoHeygen(
  input: GenerateVideoHeygenInput
): Promise<GenerateVideoHeygenOutput> {
  return generateVideoHeygenFlow(input);
}

const generateVideoHeygenFlow = ai.defineFlow(
  {
    name: 'generateVideoHeygenFlow',
    inputSchema: GenerateVideoHeygenInputSchema,
    outputSchema: GenerateVideoHeygenOutputSchema,
  },
  async ({ promptText }) => {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error('HEYGEN_API_KEY is not defined in the environment.');
    }

    const url = 'https://api.heygen.com/v2/video/generate';
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-api-key': apiKey,
    };
    const body = JSON.stringify({
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: 'Daisy-inskirt-20220818', // Default public avatar
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: promptText,
            voice_id: '2d5b0e6cf36f460aa7fc47e3eee4ba54' // A standard female voice
          },
        },
      ],
      test: true,
      dimension: {
        width: 1280,
        height: 720,
      },
    });

    console.log('Starting HeyGen video generation task...');
    const response = await fetch(url, { method: 'POST', headers, body });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HeyGen API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const videoId = data.data.video_id;

    if (!videoId) {
      throw new Error('HeyGen API did not return a video ID.');
    }

    console.log(`HeyGen task started with video ID: ${videoId}. Now polling for completion...`);

    const videoUrl = await pollVideoStatus(videoId, apiKey);
    
    return {
      videoUrl,
    };
  }
);
