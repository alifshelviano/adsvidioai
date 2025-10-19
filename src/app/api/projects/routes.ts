
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Project } from '@/lib/types';

// GET all projects for a user
export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const projects = await db.collection<Project>('projects').find({ userId }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(projects);
  } catch (e) {
    console.error('Failed to fetch projects:', e);
    return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
  }
}

// POST a new project
export async function POST(request: Request) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    try {
        const { title, description, price, imageUrl } = await request.json();

        if (!title || !description || !price || !imageUrl) {
            return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const newProject: Omit<Project, 'id'> = {
            name: title,
            createdAt: new Date().toISOString(),
            imageUrl: 'https://picsum.photos/seed/project/600/400', // Default project image
            imageHint: 'abstract project image',
            userId: userId,
            product: {
                title,
                description,
                price,
                imageUrl,
                imageHint: `product ${title.split(' ').slice(0, 2).join(' ').toLowerCase()}`,
            },
            // Add default empty values for all other required fields
            brandProfile: {
              name: '',
              description: '',
              toneOfVoice: '',
            },
            targetAudience: {
              description: '',
            },
            competitors: [],
            contentCalendar: [],
        };

        const result = await db.collection('projects').insertOne(newProject as any);
        const insertedId = result.insertedId;

        const insertedProject = await db.collection('projects').findOne({ _id: insertedId });

        return NextResponse.json(insertedProject, { status: 201 });

    } catch (e) {
        console.error('Failed to create project:', e);
        return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
    }
}
