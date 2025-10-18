// This is a new file

'use client';

import { useSearchParams, notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { ProjectClientPage } from "@/components/projects/project-client-page";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewProjectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const price = searchParams.get("price");
    const imageUrl = searchParams.get("imageUrl");

    if (title && description && price && imageUrl) {
      // In a real app, we would save this to a database and get a real ID
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: title,
        createdAt: new Date().toISOString(),
        imageUrl: "https://picsum.photos/seed/new/600/400", // Default project image
        imageHint: "abstract project",
        product: {
          title,
          description,
          price: parseFloat(price),
          imageUrl,
          imageHint: "product " + title.split(" ").slice(0,2).join(" ").toLowerCase(),
        },
      };
      setProject(newProject);
      // Optional: Update the URL to a clean one if this were a real saved project
      // router.replace(`/projects/${newProject.id}`);
    } else {
      // If essential params are missing, maybe redirect or show an error
      // For now, let's redirect to the main projects page after a moment.
      const timer = setTimeout(() => router.push('/projects'), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  if (!project) {
    return (
      <>
        <Header pageTitle="Creating Project..." />
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-4">
              <p className="text-center text-muted-foreground">Extracting product data... If you are not redirected, some information might be missing from the URL.</p>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header pageTitle={project.name} />
      <main className="flex-1 p-4 md:p-6">
        <ProjectClientPage project={project} />
      </main>
    </>
  );
}
