'use server';
/**
 * @fileOverview Flow for generating video from a prompt using a Hugging Face model.
 *
 * - generateVideoHuggingFace - A function that generates a video from a prompt.
 * - GenerateVideoHuggingFaceInput - The input type for the function.
 * - GenerateVideoHuggingFaceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVideoHuggingFaceInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate a video from.'),
});
export type GenerateVideoHuggingFaceInput = z.infer<typeof GenerateVideoHuggingFaceInputSchema>;

const GenerateVideoHuggingFaceOutputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'The generated video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateVideoHuggingFaceOutput = z.infer<typeof GenerateVideoHuggingFaceOutputSchema>;

export async function generateVideoHuggingFace(
  input: GenerateVideoHuggingFaceInput
): Promise<GenerateVideoHuggingFaceOutput> {
  return generateVideoHuggingFaceFlow(input);
}

// Using a free, public text-to-video model from Hugging Face
const HUGGING_FACE_MODEL_URL = 'https://router.huggingface.co/models/diffusers/text-to-video-ms-1.7b';

const generateVideoHuggingFaceFlow = ai.defineFlow(
  {
    name: 'generateVideoHuggingFaceFlow',
    inputSchema: GenerateVideoHuggingFaceInputSchema,
    outputSchema: GenerateVideoHuggingFaceOutputSchema,
  },
  async ({ prompt }) => {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY is not defined in the environment.');
    }

    const response = await fetch(
        HUGGING_FACE_MODEL_URL,
        {
            headers: { 
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: prompt,
            }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorBody}`);
    }
    
    // The response is expected to be a video file blob
    const videoBlob = await response.blob();
    const buffer = await videoBlob.arrayBuffer();
    const base64Video = Buffer.from(buffer).toString('base64');
    // The model typically returns 'video/mp4'
    const mimeType = videoBlob.type || 'video/mp4'; 
    
    const videoDataUri = `data:${mimeType};base64,${base64Video}`;

    return { videoDataUri: videoDataUri };
  }
);
