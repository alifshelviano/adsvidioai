import { Header } from "@/components/layout/header";
import { ProjectList } from "@/components/projects/project-list";

export default function DashboardPage() {
  return (
    <>
      <Header pageTitle="Dashboard" />
      <main className="flex-1 p-4 md:p-6">
        <ProjectList />
      </main>
    </>
  );
}
