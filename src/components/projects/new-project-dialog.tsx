"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2 } from "lucide-react";
import { extractProductInfo, ExtractProductInfoOutput } from "@/ai/flows/extract-product-info";

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
import { useToast } from "@/hooks/use-toast";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateProject = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        title: "URL is required",
        description: "Please enter a product URL to continue.",
      });
      return;
    }
    setLoading(true);
    try {
      const productInfo: ExtractProductInfoOutput = await extractProductInfo({ url });
      
      const query = new URLSearchParams({
        title: productInfo.title,
        description: productInfo.description,
        price: productInfo.price.toString(),
        imageUrl: productInfo.imageUrl,
      });

      router.push(`/projects/new?${query.toString()}`);
      setOpen(false);

    } catch (error) {
      console.error("Failed to extract product info:", error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "Could not extract product information from the URL. Please check the URL and try again.",
      });
    } finally {
      setLoading(false);
      setUrl("");
    }
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
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Supported marketplaces: Shopee, Tokopedia, Amazon.
          </p>
        </div>
        <DialogFooter>
          <div className="flex w-full flex-col gap-2">
            <Button onClick={handleCreateProject} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Extracting..." : "Create Project"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
