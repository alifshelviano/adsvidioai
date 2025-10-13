'use server';
/**
 * @fileOverview A flow to analyze a place's review page and generate marketing assets.
 * - reviewPlace - A function that takes a URL, analyzes it, and returns an image, script, and audio.
 * - ReviewPlaceInput - The input type for the reviewPlace function.
 * - ReviewPlaceOutput - The return type for the reviewPlace function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { genkit } from 'genkit';
import wav from 'wav';

// Tool to fetch web content
const fetchPageContentTool = ai.defineTool(
  {
    name: 'fetchReviewPageContent',
    description: 'Fetches the HTML content of a given URL for a place review.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string(),
  },
  async ({ url }) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // This is a simplified version. A real implementation would need to handle
      // dynamic content, SPAs, and might need a headless browser like Puppeteer.
      return await response.text();
    } catch (e: any) {
      genkit.log('error', `Failed to fetch URL content for review: ${e.message}`);
      return 'Failed to retrieve content from the URL. Please inform the user.';
    }
  }
);

export const ReviewPlaceInputSchema = z.object({
  url: z.string().url().describe('The URL of the place to review.'),
});
export type ReviewPlaceInput = z.infer<typeof ReviewPlaceInputSchema>;

export const ReviewPlaceOutputSchema = z.object({
  placeName: z.string().describe('The name of the place.'),
  script: z
    .string()
    .describe('A short, engaging script generated from the reviews.'),
  imageUrl: z
    .string()
    .url()
    .describe('URL of a visually appealing image of the place.'),
  audioDataUri: z
    .string()
    .describe('The generated audio narration as a data URI.'),
});
export type ReviewPlaceOutput = z.infer<typeof ReviewPlaceOutputSchema>;

// TTS WAV conversion utility
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });
    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

// Main exported function
export async function reviewPlace(
  input: ReviewPlaceInput
): Promise<ReviewPlaceOutput> {
  return reviewPlaceFlow(input);
}

// Define the flow
const reviewPlaceFlow = ai.defineFlow(
  {
    name: 'reviewPlaceFlow',
    inputSchema: ReviewPlaceInputSchema,
    outputSchema: ReviewPlaceoOutputSchema,
  },
  async ({ url }) => {
    // Step 1: Extract content and generate a script
    const analysisResponse = await ai.generate({
      prompt: `You are a marketing expert. Analyze the content of the provided URL, which contains reviews for a place.
      1. Use the 'fetchReviewPageContent' tool to get the HTML of the URL: ${url}
      2. From the content, identify the name of the place.
      3. Summarize the reviews into a short, upbeat, and engaging marketing script (2-3 sentences).
      4. Create a descriptive prompt for an image that captures the essence of the place (e.g., "A cozy cafe with warm lighting," "A beautiful beach with clear blue water").`,
      tools: [fetchPageContentTool],
      output: {
        schema: z.object({
          placeName: z.string(),
          script: z.string(),
          imagePrompt: z.string(),
        }),
      },
    });

    const analysis = analysisResponse.output;
    if (!analysis) {
      throw new Error('Failed to analyze the place review page.');
    }

    // Step 2: Generate an image using getimg.ai
    const apiKey = process.env.GETIMG_API_KEY;
    if (!apiKey) {
      throw new Error('GETIMG_API_KEY is not defined in the environment.');
    }

    const imageResponse = await fetch(
      'https://api.getimg.ai/v1/stable-diffusion/text-to-image',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysis.imagePrompt,
          model: 'stable-diffusion-xl-v1-5',
          width: 1024,
          height: 576,
          output_format: 'jpeg',
        }),
      }
    );

    if (!imageResponse.ok) {
      const errorBody = await imageResponse.text();
      throw new Error(
        `getimg.ai API request failed with status ${imageResponse.status}: ${errorBody}`
      );
    }

    const imageData = await imageResponse.json();
    if (!imageData.image) {
      throw new Error('No image returned from getimg.ai API.');
    }
    const imageUrl = `data:image/jpeg;base64,${imageData.image}`;

    // Step 3: Generate audio from the script
    const ttsResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
        },
      },
      prompt: analysis.script,
    });

    if (!ttsResponse.media) {
      throw new Error('No media returned from TTS API.');
    }
    const audioBuffer = Buffer.from(
      ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1),
      'base64'
    );
    const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    // Step 4: Return all assets
    return {
      placeName: analysis.placeName,
      script: analysis.script,
      imageUrl: imageUrl,
      audioDataUri: audioDataUri,
    };
  }
);
