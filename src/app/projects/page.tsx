import { Header } from "@/components/layout/header";
import { ProjectList } from "@/components/projects/project-list";

export default function ProjectsPage() {
  return (
    <>
      <Header pageTitle="Projects" />
      <main className="flex-1 p-4 md:p-6">
        <ProjectList />
      </main>
    </>
  );
}
