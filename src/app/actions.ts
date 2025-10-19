'use server';

import { revalidatePath } from "next/cache";
import { Projects } from "@/lib/mongodb";

export async function updateProjectVideo(projectId: string, videoUrl: string, thumbnailUrl?: string) {
  if (!projectId || !videoUrl) {
    throw new Error("Project ID and Video URL are required.");
  }

  const result = await Projects.updateOne(
    { _id: projectId },
    { 
      $set: { 
        videoUrl: videoUrl, 
        ...(thumbnailUrl && { thumbnailUrl: thumbnailUrl })
      }
    }
  );

  if (result.modifiedCount === 0) {
    // This could mean the document wasn't found or the data was the same.
    // You might want to add more specific error handling here.
    console.warn(`Project with ID ${projectId} was not updated. It might not exist or the video URLs were the same.`);
  }

  // Revalidate the project page to show the updated video
  revalidatePath(`/projects/${projectId}`);

  return { success: true, modifiedCount: result.modifiedCount };
}
