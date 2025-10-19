import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import type { Project } from '@/lib/types';

// Helper function to serialize project data
const serializeProject = (project: any): Project => {
  return {
    ...project,
    _id: project._id.toString(),
    // Ensure createdAt is also a string, just in case it's a Date object
    createdAt: project.createdAt.toString(), 
  };
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    if (!ObjectId.isValid(id)) {
        console.error("Invalid ObjectId format");
        return null;
    }

    const project = await db.collection('videos').findOne({ _id: new ObjectId(id) });

    if (!project) {
      return null;
    }

    // The raw project object from the DB is not serializable
    // because of the `_id` field. We need to convert it to a string.
    return serializeProject(project);

  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const projects = await db.collection('videos').find({}).sort({ createdAt: -1 }).toArray();

    // The raw project objects from the DB are not serializable
    // because of the s`_id` field. We need to convert them to strings.
    return projects.map(serializeProject);

  } catch (e) {
    console.error(e);
    return [];
  }
};
