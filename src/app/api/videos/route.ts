import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const videos = await db.collection('videos').find({ userId }).sort({ createdAt: -1 }).toArray();
    
    // The raw data from the DB is not serializable. 
    // We need to convert the `_id` field to a string for each project.
    const serializableVideos = videos.map(video => ({
      ...video,
      _id: video._id.toString(),
      createdAt: video.createdAt.toString(),
    }));

    return NextResponse.json(serializableVideos);

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error fetching videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const { title, description, price, imageUrl } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields: title, description' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const newVideo = {
      userId,
      title,
      description,
      price,
      imageUrl,
      createdAt: new Date(),
    };

    const result = await db.collection('videos').insertOne(newVideo);

    // Send back the created object with the string ID
    const createdVideo = {
        ...newVideo,
        _id: result.insertedId.toString(),
        createdAt: newVideo.createdAt.toString(),
    }

    return NextResponse.json(createdVideo, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error creating video' }, { status: 500 });
  }
}
