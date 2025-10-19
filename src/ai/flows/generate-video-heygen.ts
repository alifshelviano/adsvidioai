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
  avatarId: z.string().optional().describe('The ID of the avatar to use.'),
});

export type GenerateVideoHeygenInput = z.infer<typeof GenerateVideoHeygenInputSchema>;

const GenerateVideoHeygenOutputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the generated video.'),
  thumbnailUrl: z.string().url().optional().describe('The URL of the video thumbnail.'),
});

export type GenerateVideoHeygenOutput = z.infer<typeof GenerateVideoHeygenOutputSchema>;

async function pollVideoStatus(videoId: string, apiKey: string): Promise<{ videoUrl: string, thumbnailUrl?: string }> {
  const pollUrl = `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`;
  const headers = { 'x-api-key': apiKey };

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds

    try {
      console.log(`Polling HeyGen video status for ID: ${videoId}`);
      const statusResponse = await fetch(pollUrl, { headers });

      if (!statusResponse.ok) {
        const errorBody = await statusResponse.text();
        console.error(`HeyGen polling failed: ${statusResponse.status} ${errorBody}`);
        continue; 
      }

      const statusData = await statusResponse.json();
      console.log('HeyGen status poll response:', statusData);
      
      const videoStatus = statusData.data.status;
      if (videoStatus === 'completed') {
        if (!statusData.data.video_url) {
          throw new Error('HeyGen video generation completed but no video URL was returned.');
        }
        return { 
            videoUrl: statusData.data.video_url,
            thumbnailUrl: statusData.data.thumbnail_url
        };
      } else if (videoStatus === 'failed') {
        throw new Error(`HeyGen video generation failed. Reason: ${statusData.data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error polling video status:', error);
    }
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
  async ({ promptText, avatarId }) => {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error('HEYGEN_API_KEY is not defined in the environment. Please add it to your .env file.');
    }
    console.log(`Using HeyGen API Key starting with: ${apiKey.substring(0, 4)}`);

    const maleAvatarId = "Bojan_standing_businesstraining_front";

    const characterConfig = avatarId === maleAvatarId ? {
        type: 'avatar',
        avatar_id: maleAvatarId,
        avatar_style: 'normal',
        scale: 3.24,
        offset: { x: 0, y: 0 },
    } : {
        type: 'avatar',
        avatar_id: 'Abigail_standing_office_front',
        avatar_style: 'normal',
        scale: 3.30,
        offset: { x: 0.00, y: 0.00 },
    };

    const voiceConfig = avatarId === maleAvatarId ? {
        type: 'text',
        input_text: promptText,
        voice_id: '9e18bbe8306c43da9fd1f598289b03ca',
    } : {
        type: 'text',
        input_text: promptText,
        voice_id: 'fdeb03e3681d462cb08a9ba7d7a50392',
    };

    const url = 'https://api.heygen.com/v2/video/generate';
    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-api-key': apiKey,
    };
    const body = JSON.stringify({
      video_inputs: [
        {
          character: characterConfig,
          voice: voiceConfig,
        }
      ],
      test: true,
      dimension: {
        width: 720,
        height: 1280,
      },
    });

    console.log('Starting HeyGen video generation task with body:', body);
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

    const { videoUrl, thumbnailUrl } = await pollVideoStatus(videoId, apiKey);
    
    return {
      videoUrl,
      thumbnailUrl,
    };
  }
);
