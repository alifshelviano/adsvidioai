'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url, { headers: { 'x-user-id': localStorage.getItem('userId') || '' } }).then(r => r.json());

const DashboardPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Handle case where userId is not found in localStorage
      // For example, redirect to a login page
      // router.push('/login');
    }
  }, [router]);

  const { data: projects, error } = useSWR(userId ? '/api/projects' : null, fetcher);

  if (!userId) {
    return <div>Loading...</div>; // Or a login prompt
  }

  if (error) return <div>Failed to load projects</div>;
  if (!projects) return <div>Loading projects...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project: any) => (
          <div key={project._id} className="border rounded-lg p-4 shadow-lg">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <p className="text-gray-600">{project.product.description}</p>
            <div className="mt-4">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => router.push(`/projects/${project._id}`)} // Navigate to project detail page
              >
                View Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
