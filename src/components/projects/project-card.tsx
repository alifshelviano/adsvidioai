import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/projects/${project.id}`}>
          <div className="relative aspect-video">
            <Image
              src={project.imageUrl}
              alt={project.name}
              fill
              className="object-cover"
              data-ai-hint={project.imageHint}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2 text-lg font-semibold">
          <Link href={`/projects/${project.id}`} className="hover:text-primary">
            {project.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Created: {format(new Date(project.createdAt), "MMMM d, yyyy")}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link href={`/projects/${project.id}`}>View Project</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
