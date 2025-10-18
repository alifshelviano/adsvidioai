
import { NextResponse } from 'next/server';

// In a real application, you would fetch video data from a database
const videos = [
  { id: 1, title: 'My First Video', description: 'This is a description of my first video.', url: '/videos/my-first-video.mp4' },
  { id: 2, title: 'Another Awesome Video', description: 'A description for the second video.', url: '/videos/another-awesome-video.mp4' },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const video = videos.find((v) => v.id === id);

  if (video) {
    return NextResponse.json(video);
  } else {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }
}
