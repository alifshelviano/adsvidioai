import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getProjectById } from "@/lib/data";
import { ProjectClientPage } from "@/components/projects/project-client-page";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id);

  if (!project) {
    notFound();
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
