'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function NewProjectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    const createProject = async () => {
      const title = searchParams.get("title");
      const description = searchParams.get("description");
      const price = searchParams.get("price");
      const imageUrl = searchParams.get("imageUrl");
      const userId = session?.user?.id; 

      if (!title || !description || !userId) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Essential project information is missing. Redirecting...",
        });
        const timer = setTimeout(() => router.push('/projects'), 3000);
        return () => clearTimeout(timer);
      }

      try {
        const response = await fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            title,
            description,
            price: price ? parseFloat(price) : undefined,
            imageUrl,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save project');
        }

        toast({
          title: "Project Created",
          description: `Successfully created project: ${title}`,
        });

        router.push('/projects');

      } catch (error) {
        console.error("Failed to create project:", error);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save the project to the database. Please try again.",
        });
      }
    };

    if (session) { // Ensure session is loaded before attempting to create the project
        createProject();
    }

  }, [searchParams, router, toast, session]);

  return (
    <>
      <Header pageTitle="Creating Project..." />
      <main className="flex-1 p-4 md:p-6">
        <div className="space-y-4">
            <p className="text-center text-muted-foreground">Saving your new project to the database...</p>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </main>
    </>
  );
}
