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
import { genkit } from 'genkit';

const GenerateVideoHeygenInputSchema = z.object({
  promptText: z.string().describe('The text prompt/script for the video.'),
  productImageUrl: z.string().url().describe('The URL of the product image to use as a background.'),
});

export type GenerateVideoHeygenInput = z.infer<typeof GenerateVideoHeygenInputSchema>;

const GenerateVideoHeygenOutputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the generated video.'),
});

export type GenerateVideoHeygenOutput = z.infer<typeof GenerateVideoHeygenOutputSchema>;

async function uploadImageToHeygen(imageUrl: string, apiKey: string): Promise<string> {
  genkit.log('info', `Fetching image from URL: ${imageUrl}`);
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
  }
  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
  
  genkit.log('info', `Uploading image to HeyGen...`);
  const uploadUrl = "https://upload.heygen.com/v1/asset";
  const headers = {
      "Content-Type": contentType,
      "X-Api-Key": apiKey,
  };

  const uploadResponse = await fetch(uploadUrl, { method: 'POST', headers, body: Buffer.from(imageBuffer) });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text();
    throw new Error(`HeyGen asset upload failed: ${uploadResponse.status} ${errorBody}`);
  }

  const uploadData = await uploadResponse.json();
  if (!uploadData.id) {
    throw new Error('HeyGen asset upload did not return an asset ID.');
  }
  
  genkit.log('info', `HeyGen asset uploaded with ID: ${uploadData.id}`);
  return uploadData.id;
}


async function pollVideoStatus(videoId: string, apiKey: string): Promise<string> {
  const pollUrl = `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`;
  const headers = { 'x-api-key': apiKey };

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds

    genkit.log('info', `Polling HeyGen video status for ID: ${videoId}`);
    const statusResponse = await fetch(pollUrl, { headers });

    if (!statusResponse.ok) {
      const errorBody = await statusResponse.text();
      genkit.log('error', `HeyGen polling failed: ${statusResponse.status} ${errorBody}`);
      continue; // Continue polling even if one check fails
    }

    const statusData = await statusResponse.json();
    genkit.log('info', 'HeyGen status poll response:', statusData);
    
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
  async ({ promptText, productImageUrl }) => {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error('HEYGEN_API_KEY is not defined in the environment.');
    }
    
    // 1. Upload image to get an asset ID
    const imageAssetId = await uploadImageToHeygen(productImageUrl, apiKey);

    // 2. Generate video using the asset ID
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
          },
          background: {
            type: 'image',
            image_asset_id: imageAssetId,
            fit: 'cover',
          }
        },
      ],
      test: true, // Use test mode to avoid consuming credits
      dimension: {
        width: 1280,
        height: 720,
      },
    });

    genkit.log('info', 'Starting HeyGen video generation task...');
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

    genkit.log('info', `HeyGen task started with video ID: ${videoId}. Now polling for completion...`);

    const videoUrl = await pollVideoStatus(videoId, apiKey);
    
    return {
      videoUrl,
    };
  }
);
