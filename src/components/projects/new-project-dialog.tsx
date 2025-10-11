"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleCreateProject = () => {
    // In a real app, you'd handle form submission, URL parsing, and project creation here.
    // For this prototype, we'll navigate to a sample project.
    router.push("/projects/1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter a product URL to get started. We'll extract the details for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              Product URL
            </Label>
            <Input
              id="url"
              placeholder="https://shopee.com/product/..."
              className="col-span-3"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Supported marketplaces: Shopee, Tokopedia, Amazon.
          </p>
        </div>
        <DialogFooter>
          <div className="flex w-full flex-col gap-2">
            <Button onClick={handleCreateProject}>Create Project</Button>
            <p className="text-center text-xs text-muted-foreground">
              (In this prototype, you'll be taken to a sample project)
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
