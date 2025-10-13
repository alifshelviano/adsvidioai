'use server';
/**
 * @fileOverview Flow for generating a video ad from an image, audio, and script.
 *
 * - generateVideoAd - A function that orchestrates the video generation.
 * - GenerateVideoAdInput - Input type for the video generation flow.
 * - GenerateVideoAdOutput - Output type for the video generation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {v4 as uuidv4} from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const GenerateVideoAdInputSchema = z.object({
  imageDataUri: z.string().describe('The base64 encoded image data URI.'),
  audioDataUri: z.string().describe('The base64 encoded audio data URI.'),
  script: z.string().describe('The ad script/prompt for the video.'),
});
export type GenerateVideoAdInput = z.infer<typeof GenerateVideoAdInputSchema>;

const GenerateVideoAdOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type GenerateVideoAdOutput = z.infer<typeof GenerateVideoAdOutputSchema>;

export async function generateVideoAd(
  input: GenerateVideoAdInput
): Promise<GenerateVideoAdOutput> {
  return generateVideoAdFlow(input);
}

// Helper to write a data URI to a temporary file
async function dataUriToTempFile(dataUri: string, extension: string): Promise<string> {
  const buffer = Buffer.from(dataUri.split(',')[1], 'base64');
  const tempPath = path.join(os.tmpdir(), `${uuidv4()}.${extension}`);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

// Helper to combine video and audio using ffmpeg
async function combineVideoAndAudio(videoPath: string, audioPath: string): Promise<string> {
  const outputPath = path.join(os.tmpdir(), `${uuidv4()}.mp4`);
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        '-c:v copy', // Copy video stream without re-encoding
        '-c:a aac',  // Re-encode audio to AAC
        '-shortest', // Finish encoding when the shortest input stream ends
      ])
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)));
  });
}


const generateVideoAdFlow = ai.defineFlow(
  {
    name: 'generateVideoAdFlow',
    inputSchema: GenerateVideoAdInputSchema,
    outputSchema: GenerateVideoAdOutputSchema,
  },
  async ({imageDataUri, audioDataUri, script}) => {
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
        aspectRatio: '16:9', // Or use the image's aspect ratio
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

    // 3. Download the silent video and write assets to temporary files
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(`${silentVideoPart.media.url}&key=${process.env.GEMINI_API_KEY}`);
    if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        throw new Error('Failed to download the generated silent video.');
    }
    const silentVideoBuffer = await videoDownloadResponse.arrayBuffer();
    const silentVideoPath = path.join(os.tmpdir(), `${uuidv4()}.mp4`);
    await fs.writeFile(silentVideoPath, Buffer.from(silentVideoBuffer));
    
    const audioPath = await dataUriToTempFile(audioDataUri, 'wav');

    // 4. Combine the silent video and the narration audio using ffmpeg
    const finalVideoPath = await combineVideoAndAudio(silentVideoPath, audioPath);

    // 5. Read the final video and convert it to a data URI
    const finalVideoBuffer = await fs.readFile(finalVideoPath);
    const videoDataUri = `data:video/mp4;base64,${finalVideoBuffer.toString('base64')}`;

    // 6. Clean up temporary files
    await fs.unlink(silentVideoPath);
    await fs.unlink(audioPath);
    await fs.unlink(finalVideoPath);

    return {videoDataUri};
  }
);
