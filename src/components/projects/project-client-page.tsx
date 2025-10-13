'use client';

import { useState } from "react";
import Image from "next/image";
import { Bot, Image as ImageIcon, AudioLines, Loader2, Sparkles, Download, Film } from "lucide-react";

import type { Project, AdContent } from "@/lib/types";
import {
  generateAdContent,
  GenerateAdContentOutput,
} from "@/ai/flows/generate-ad-content";
import {
  generatePromotionalVisuals,
  GeneratePromotionalVisualsOutput,
} from "@/ai/flows/generate-promotional-visuals";
import {
  convertAdScriptToAudio,
  ConvertAdScriptToAudioOutput,
} from "@/ai/flows/convert-ad-script-to-audio";
import { generateImageHuggingFace, GenerateImageHuggingFaceOutput } from "@/ai/flows/generate-image-huggingface";
import { generateVideoAd, GenerateVideoAdOutput } from "@/ai/flows/generate-video-ad";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "../ui/label";

type LoadingStates = {
  adContent: boolean;
  visuals: boolean;
  narration: boolean;
  video: boolean;
};

type VisualProvider = 'getimg.ai' | 'huggingface';

export function ProjectClientPage({ project }: { project: Project }) {
  const { toast } = useToast();
  const [adContent, setAdContent] = useState<AdContent | null>(null);
  const [visual, setVisual] = useState<string | null>(null);
  const [narration, setNarration] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [visualProvider, setVisualProvider] = useState<VisualProvider>('getimg.ai');

  const [loading, setLoading] = useState<LoadingStates>({
    adContent: false,
    visuals: false,
    narration: false,
    video: false,
  });

  const handleGenerateAdContent = async () => {
    setLoading((prev) => ({ ...prev, adContent: true }));
    try {
      const result: GenerateAdContentOutput = await generateAdContent({
        productTitle: project.product.title,
        productDescription: project.product.description,
        productPrice: project.product.price,
        productImageUrl: project.product.imageUrl,
      });
      setAdContent(result);
    } catch (error) {
      console.error("Error generating ad content:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate ad content.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, adContent: false }));
    }
  };

  const handleGenerateVisuals = async () => {
    setLoading((prev) => ({ ...prev, visuals: true }));
    try {
        if (visualProvider === 'getimg.ai') {
            const result: GeneratePromotionalVisualsOutput =
                await generatePromotionalVisuals({
                productName: project.product.title,
                productDescription: project.product.description,
                brandName: "AdForge AI",
                targetAudience: "Online Shoppers",
                });
            setVisual(result.visualDataUri);
        } else {
            const prompt = `Create a promotional visual for ${project.product.title}, described as ${project.product.description}.`;
            const result: GenerateImageHuggingFaceOutput = await generateImageHuggingFace({ prompt });
            setVisual(result.imageDataUri);
        }
    } catch (error: any) {
      console.error("Error generating visuals:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `Could not generate visuals. ${error.message}`,
      });
    } finally {
      setLoading((prev) => ({ ...prev, visuals: false }));
    }
  };

  const handleGenerateNarration = async () => {
    if (!adContent?.adCopy) return;
    setLoading((prev) => ({ ...prev, narration: true }));
    try {
      const result: ConvertAdScriptToAudioOutput = await convertAdScriptToAudio(
        {
          adScript: adContent.adCopy,
        }
      );
      setNarration(result.audioDataUri);
    } catch (error) {
      console.error("Error generating narration:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate narration.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, narration: false }));
    }
  };

    const handleGenerateVideo = async () => {
    if (!visual || !adContent) return;
    setLoading((prev) => ({...prev, video: true}));
    try {
      const result: GenerateVideoAdOutput = await generateVideoAd({
        imageDataUri: visual,
        script: adContent.adCopy,
      });
      setVideo(result.videoDataUri);
    } catch (error: any) {
      console.error("Error generating video:", error);
      toast({
        variant: "destructive",
        title: "Video Generation Failed",
        description: `Could not generate video. ${error.message}`,
      });
    } finally {
      setLoading((prev) => ({...prev, video: false}));
    }
  };
  
  const handleDownloadText = (content: AdContent) => {
    const textContent = `
Ad Copy:
${content.adCopy}

Captions:
${content.captions}

Hashtags:
${content.hashtags}
    `;
    const blob = new Blob([textContent.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ad_content.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleDownloadDataUri = (dataUri: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
  };

  const renderAdContent = () => {
    if (loading.adContent) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    if (adContent) {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ad Copy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{adContent.adCopy}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Captions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{adContent.captions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hashtags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {adContent.hashtags.split(" ").map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </CardContent>
             <CardFooter>
              <Button variant="outline" onClick={() => handleDownloadText(adContent)}>
                <Download className="mr-2 h-4 w-4" />
                Download Content
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Generate Ad Content</h3>
            <p className="mb-4 text-muted-foreground">Click the button to start generating ad copy, captions, and hashtags for your product.</p>
            <Button onClick={handleGenerateAdContent}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
            </Button>
        </div>
    );
  };
  
  const renderVisuals = () => {
    if (loading.visuals) {
      return <Skeleton className="aspect-video w-full" />;
    }
    if (visual) {
      return (
        <Card>
            <CardContent className="pt-6">
                <Image src={visual} alt="Generated visual" width={1280} height={720} className="rounded-lg border" />
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => handleDownloadDataUri(visual, 'promotional_visual.png')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Visual
                </Button>
            </CardFooter>
        </Card>
      )
    }
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
             <div className="mb-4 rounded-full bg-accent/10 p-3">
                <ImageIcon className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Generate Promotional Visual</h3>
            <p className="mb-4 text-muted-foreground">Create a unique, eye-catching image for your ad campaign.</p>

            <div className="my-4 w-full max-w-sm space-y-2">
                <Label htmlFor="visual-provider">Image Provider</Label>
                <Select value={visualProvider} onValueChange={(value: VisualProvider) => setVisualProvider(value)}>
                    <SelectTrigger id="visual-provider">
                        <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="getimg.ai">getimg.ai (Landscape)</SelectItem>
                        <SelectItem value="huggingface">Hugging Face (Portrait)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleGenerateVisuals} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
            </Button>
        </div>
    )
  }

  const renderNarration = () => {
    if (loading.narration) {
        return <Skeleton className="h-20 w-full" />;
    }
    if (narration) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <audio controls src={narration} className="w-full"></audio>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => handleDownloadDataUri(narration, 'narration.wav')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Narration
                    </Button>
                </CardFooter>
            </Card>
        )
    }
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <div className="mb-4 rounded-full bg-secondary p-3">
                <AudioLines className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Generate Voice Narration</h3>
            <p className="mb-4 text-muted-foreground">Convert your ad script into a professional voice-over. Requires generated ad content first.</p>
            <Button onClick={handleGenerateNarration} variant="outline" disabled={!adContent}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
            </Button>
        </div>
    )
  }

  const renderVideoAd = () => {
    if (loading.video) {
        return <Skeleton className="aspect-video w-full" />;
    }
    if (video) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <video controls src={video} className="w-full rounded-lg border"></video>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => handleDownloadDataUri(video, 'video_ad.mp4')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Video
                    </Button>
                </CardFooter>
            </Card>
        )
    }
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <div className="mb-4 rounded-full bg-purple-500/10 p-3">
                <Film className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Generate Silent Video Ad</h3>
            <p className="mb-4 text-muted-foreground">Animate your visual into a short, silent video. Requires a generated visual first.</p>
            <Button onClick={handleGenerateVideo} variant="outline" disabled={!visual || !adContent}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Video
            </Button>
        </div>
    )
  }

  return (
    <Tabs defaultValue="product" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="product">Product Info</TabsTrigger>
        <TabsTrigger value="content" disabled={loading.adContent}>
          {loading.adContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ad Content
        </TabsTrigger>
        <TabsTrigger value="visuals" disabled={loading.visuals}>
            {loading.visuals && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Visuals
        </TabsTrigger>
        <TabsTrigger value="narration" disabled={loading.narration}>
            {loading.narration && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Narration
        </TabsTrigger>
        <TabsTrigger value="video" disabled={loading.video}>
            {loading.video && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Video Ad
        </TabsTrigger>
      </TabsList>

      <TabsContent value="product">
        <Card>
          <CardHeader>
            <CardTitle>{project.product.title}</CardTitle>
            <CardDescription>
              Price: ${project.product.price.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="relative aspect-video">
              <Image
                src={project.product.imageUrl}
                alt={project.product.title}
                fill
                className="rounded-md border object-cover"
                data-ai-hint={project.product.imageHint}
              />
            </div>
            <p className="text-muted-foreground">
              {project.product.description}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="content">
        {renderAdContent()}
      </TabsContent>
      <TabsContent value="visuals">
        {renderVisuals()}
      </TabsContent>
      <TabsContent value="narration">
        {renderNarration()}
      </TabsContent>
       <TabsContent value="video">
        {renderVideoAd()}
      </TabsContent>
    </Tabs>
  );
}
