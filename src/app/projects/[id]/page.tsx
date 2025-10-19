import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { ProjectClientPage } from "@/components/projects/project-client-page";

// This page remains a server component to fetch data
export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <>
      <Header pageTitle={`Project: ${project.title}`} />
      <main className="container mx-auto py-8">
        {/* We pass the server-fetched data to the client component */}
        <ProjectClientPage project={project} />
      </main>
    </>
  );
}
