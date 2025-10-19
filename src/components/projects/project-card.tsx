'use client';

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const projectId = project._id.toString();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/projects/${projectId}`}>
          {project.imageUrl && (
            <div className="relative aspect-video">
              <Image
                src={project.imageUrl}
                alt={project.title || "Project Image"}
                fill
                className="object-cover"
              />
            </div>
          )}
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="mb-2 text-lg font-semibold">
            <Link href={`/projects/${projectId}`} className="hover:text-primary">
              {project.title}
            </Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(project)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground">
          Created: {format(new Date(project.createdAt), "MMMM d, yyyy")}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link href={`/projects/${projectId}`}>View Project</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
