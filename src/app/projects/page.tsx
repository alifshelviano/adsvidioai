import { Header } from "@/components/layout/header";
import { ProjectCard } from "@/components/projects/project-card";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <>
      <Header pageTitle="Projects" />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    </>
  );
}
