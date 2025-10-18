'use server';
/**
 * @fileOverview Converts ad scripts into natural-sounding audio using a TTS API.
 *
 * - convertAdScriptToAudio - A function that handles the conversion of ad script to audio.
 * - ConvertAdScriptToAudioInput - The input type for the convertAdScriptToAudio function.
 * - ConvertAdScriptToAudioOutput - The return type for the convertAdScriptToAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const ConvertAdScriptToAudioInputSchema = z.object({
  adScript: z.string().describe('The ad script to convert to audio.'),
});
export type ConvertAdScriptToAudioInput = z.infer<typeof ConvertAdScriptToAudioInputSchema>;

const ConvertAdScriptToAudioOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio data URI in WAV format.'),
});
export type ConvertAdScriptToAudioOutput = z.infer<typeof ConvertAdScriptToAudioOutputSchema>;

export async function convertAdScriptToAudio(input: ConvertAdScriptToAudioInput): Promise<ConvertAdScriptToAudioOutput> {
  return convertAdScriptToAudioFlow(input);
}

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
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const convertAdScriptToAudioFlow = ai.defineFlow(
  {
    name: 'convertAdScriptToAudioFlow',
    inputSchema: ConvertAdScriptToAudioInputSchema,
    outputSchema: ConvertAdScriptToAudioOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: input.adScript,
    });

    if (!media) {
      throw new Error('No media returned from TTS API.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      audioDataUri: wavDataUri,
    };
  }
);