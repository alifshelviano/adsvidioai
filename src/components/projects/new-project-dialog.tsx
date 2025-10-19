'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2, Link, Pencil } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewProjectDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  project?: Project | null;
  onProjectCreated?: () => void;
}

export function NewProjectDialog({ 
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  project,
  onProjectCreated 
}: NewProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  const isEditMode = !!project;

  const [url, setUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [avatar, setAvatar] = useState("Abigail_standing_office_front");

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isEditMode && project) {
      setManualTitle(project.title || "");
      setManualDescription(project.description || "");
      setManualPrice(project.price?.toString() || "");
      setManualImageUrl(project.imageUrl || "");
    }
  }, [project, isEditMode]);

  const handleCreateFromUrl = async () => {
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
        avatar: avatar,
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

  const handleSubmit = async () => {
    if (!manualTitle || !manualDescription) {
        toast({
            variant: "destructive",
            title: "Title and description are required",
            description: "Please fill out at least the title and description to create a project.",
        });
        return;
    }

    setLoading(true);

    if(isEditMode) {
      try {
        const response = await fetch(`/api/videos/${project?._id}`,
          {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              title: manualTitle,
              description: manualDescription,
              price: parseFloat(manualPrice),
              imageUrl: manualImageUrl,
             })
          }
        );
  
        if (response.ok) {
          toast({
            title: "Project Updated",
            description: "Your project has been successfully updated.",
          });
          setOpen(false);
          onProjectCreated?.();
        } else {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Failed to update the project.",
          });
        }
      } catch (error) {
        console.error("Error updating project:", error);
      } finally {
        setLoading(false);
      }
    } else {
      const query = new URLSearchParams({
          title: manualTitle,
          description: manualDescription,
          ...(manualPrice && { price: manualPrice }),
          ...(manualImageUrl && { imageUrl: manualImageUrl }),
          avatar: avatar,
      });

      router.push(`/projects/new?${query.toString()}`);
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          {!isEditMode && (
            <DialogDescription>
              Start a new project by either extracting from a URL or entering details manually.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <Tabs defaultValue={isEditMode ? "manual" : "url"}>
            {!isEditMode && (
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url"><Link className="mr-2 h-4 w-4" />From URL</TabsTrigger>
                  <TabsTrigger value="manual"><Pencil className="mr-2 h-4 w-4" />Manually</TabsTrigger>
              </TabsList>
            )}
            <TabsContent value="url">
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
                    <Button onClick={handleCreateFromUrl} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Extracting..." : "Create From URL"}
                    </Button>
                </DialogFooter>
            </TabsContent>
            <TabsContent value="manual">
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" placeholder="e.g. 'Stylish Coffee Mug'" className="col-span-3" value={manualTitle} onChange={e => setManualTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">Description</Label>
                        <Textarea id="description" placeholder="A short description of the product." className="col-span-3" value={manualDescription} onChange={e => setManualDescription(e.target.value)} />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input id="price" type="number" placeholder="19.99" className="col-span-3" value={manualPrice} onChange={e => setManualPrice(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                        <Input id="imageUrl" placeholder="https://picsum.photos/seed/..." className="col-span-3" value={manualImageUrl} onChange={e => setManualImageUrl(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="avatar" className="text-right">Avatar</Label>
                        <Select onValueChange={setAvatar} defaultValue={avatar}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select an avatar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Abigail_standing_office_front">Wanita</SelectItem>
                                <SelectItem value="Berat_standing_indoor_side">Pria</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Save Changes' : 'Create Manually'}
                    </Button>
                </DialogFooter>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
