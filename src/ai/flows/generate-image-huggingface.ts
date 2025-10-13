'use server';
/**
 * @fileOverview Flow for generating images using a Hugging Face model.
 *
 * - generateImageHuggingFace - A function that generates an image from a prompt.
 * - GenerateImageHuggingFaceInput - The input type for the function.
 * - GenerateImageHuggingFaceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageHuggingFaceInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageHuggingFaceInput = z.infer<typeof GenerateImageHuggingFaceInputSchema>;

const GenerateImageHuggingFaceOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'The generated image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateImageHuggingFaceOutput = z.infer<typeof GenerateImageHuggingFaceOutputSchema>;

export async function generateImageHuggingFace(
  input: GenerateImageHuggingFaceInput
): Promise<GenerateImageHuggingFaceOutput> {
  return generateImageHuggingFaceFlow(input);
}

const HUGGING_FACE_MODEL_URL = 'https://router.huggingface.co/fal-ai/fal-ai/hunyuan-image/v3/text-to-image';

const generateImageHuggingFaceFlow = ai.defineFlow(
  {
    name: 'generateImageHuggingFaceFlow',
    inputSchema: GenerateImageHuggingFaceInputSchema,
    outputSchema: GenerateImageHuggingFaceOutputSchema,
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
                sync_mode: true,
                prompt: `"${prompt}"` 
            }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorBody}`);
    }

    const imageBlob = await response.blob();
    const buffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const mimeType = imageBlob.type || 'image/jpeg';
    
    const imageDataUri = `data:${mimeType};base64,${base64Image}`;

    return { imageDataUri: imageDataUri };
  }
);
