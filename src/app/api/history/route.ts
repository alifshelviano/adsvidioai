
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const history = await db.collection('history').find({ userId: userId }).sort({ watchedAt: -1 }).toArray();
    return NextResponse.json(history);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error fetching watch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
  }

  try {
    const { videoId } = await request.json();
    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const newHistoryEntry = {
      userId,
      videoId,
      watchedAt: new Date(),
    };

    const result = await db.collection('history').insertOne(newHistoryEntry);

    return NextResponse.json(result.ops[0], { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error creating history entry' }, { status: 500 });
  }
}
