
import { NextResponse } from 'next/server';

// In-memory "database"
let videos = [
  { id: 1, title: 'My First Video', description: 'This is a description of my first video.', url: '/videos/my-first-video.mp4' },
  { id: 2, title: 'Another Awesome Video', description: 'A description for the second video.', url: '/videos/another-awesome-video.mp4' },
];

export async function GET() {
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  try {
    const { title, description, url } = await request.json();

    if (!title || !description || !url) {
      return NextResponse.json({ error: 'Missing required fields: title, description, url' }, { status: 400 });
    }

    const newVideo = {
      id: videos.length > 0 ? Math.max(...videos.map(v => v.id)) + 1 : 1,
      title,
      description,
      url,
    };

    videos.push(newVideo);

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
