import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Add a Projects collection export
export const getProjectsCollection = async () => {
    const client = await clientPromise;
    const db = client.db(); // You can specify a database name here if you want, e.g., client.db("myApp")
    return db.collection('projects');
};

// For convenience, you can also export the collection directly
// This is what your actions.ts file will use
export const Projects = { 
    async updateOne(filter: any, update: any) {
        const collection = await getProjectsCollection();
        return collection.updateOne(filter, update);
    }
    // You can add other methods like find, insertOne etc. as needed
}; 
