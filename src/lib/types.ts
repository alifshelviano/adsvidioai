import { z } from 'zod';

export const ProjectSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number().optional(),
  imageUrl: z.string(),
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const AdContentSchema = z.object({
  adCopy: z.string(),
  captions: z.string(),
  hashtags: z.string(),
});

export type AdContent = z.infer<typeof AdContentSchema>;

export type VideoProvider = 'runway' | 'heygen';
