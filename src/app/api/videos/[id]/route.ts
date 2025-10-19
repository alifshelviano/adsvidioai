
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const video = await db.collection('videos').findOne({ _id: new ObjectId(params.id) });

    if (video) {
      return NextResponse.json(video);
    } else {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error fetching video' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, url } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('videos').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { title, description, url } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Video updated successfully' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error updating video' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('videos').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error deleting video' }, { status: 500 });
  }
}
