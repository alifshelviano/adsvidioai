'use client';

import { useState } from "react";
import Image from "next/image";
import { Bot, AudioLines, Sparkles, Download, Loader2, Video, Clapperboard } from "lucide-react";

import type { Project, AdContent } from "@/lib/types";
import {
  generateAdContent,
  GenerateAdContentOutput,
} from "@/ai/flows/generate-ad-content";
import {
  convertAdScriptToAudio,
  ConvertAdScriptToAudioOutput,
} from "@/ai/flows/convert-ad-script-to-audio";
import { generatePromotionalVisual, GeneratePromotionalVisualOutput } from "@/ai/flows/generate-promotional-visual";
import { generateVideoRunway, GenerateVideoRunwayOutput } from "@/ai/flows/generate-video-runway";


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

type LoadingStates = {
  adContent: boolean;
  narration: boolean;
  visual: boolean;
  video: boolean;
};

export function ProjectClientPage({ project }: { project: Project }) {
  const { toast } = useToast();
  const [adContent, setAdContent] = useState<AdContent | null>(null);
  const [narration, setNarration] = useState<string | null>(null);
  const [visual, setVisual] = useState<GeneratePromotionalVisualOutput | null>(null);
  const [video, setVideo] = useState<GenerateVideoRunwayOutput | null>(null);

  const [loading, setLoading] = useState<LoadingStates>({
    adContent: false,
    narration: false,
    visual: false,
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

  const handleGenerateVisual = async () => {
    setLoading((prev) => ({ ...prev, visual: true }));
    try {
        const result = await generatePromotionalVisual({
            productTitle: project.product.title,
            productDescription: project.product.description,
        });
        setVisual(result);
    } catch (error) {
        console.error('Error generating visual:', error);
        toast({
            variant: 'destructive',
            title: 'Visual Generation Failed',
            description: 'Could not generate a promotional visual.',
        });
    } finally {
        setLoading((prev) => ({ ...prev, visual: false }));
    }
  };

  const handleGenerateVideo = async () => {
    if (!adContent?.adCopy || !visual?.imageDataUri) return;
    setLoading(prev => ({ ...prev, video: true }));
    try {
      const result = await generateVideoRunway({
        imageDataUri: visual.imageDataUri,
        promptText: adContent.adCopy,
      });
      setVideo(result);
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast({
        variant: 'destructive',
        title: 'Video Generation Failed',
        description: error.message || 'Could not generate video ad.',
      });
    } finally {
      setLoading(prev => ({ ...prev, video: false }));
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
                {loading.narration ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate
            </Button>
        </div>
    )
  };

  const renderVisuals = () => {
    if (loading.visual) {
        return <Skeleton className="w-full aspect-video" />;
    }
    if (visual) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Generated Visual</CardTitle>
                    <CardDescription>This image was generated to be used as a base for the video ad.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Image src={visual.imageDataUri} alt="Generated promotional visual" width={1280} height={720} className="rounded-lg border" />
                    <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-semibold">Revised Prompt:</span> {visual.revisedPrompt}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => handleDownloadDataUri(visual.imageDataUri, 'visual.jpg')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Visual
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
        <div className="mb-4 rounded-full bg-secondary p-3">
          <Clapperboard className="h-8 w-8 text-secondary-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Generate Promotional Visual</h3>
        <p className="mb-4 text-muted-foreground">Create a starting image for your video ad. This is the first step before video generation.</p>
        <Button onClick={handleGenerateVisual} variant="outline" disabled={loading.visual}>
            {loading.visual ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Visual
        </Button>
      </div>
    );
  };

  const renderVideoAd = () => {
    if (loading.video) {
      return <Skeleton className="w-full aspect-video" />;
    }
    if (video) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Generated Video Ad</CardTitle>
          </CardHeader>
          <CardContent>
            <video controls src={video.videoUrl} className="w-full rounded-lg border bg-black"></video>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
                <a href={video.videoUrl} target="_blank" download="video_ad.mp4">
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                </a>
            </Button>
          </CardFooter>
        </Card>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <div className="mb-4 rounded-full bg-secondary p-3">
                <Video className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Generate Video Ad with Runway</h3>
            <p className="mb-4 text-muted-foreground">Use the generated ad content and visual to create a video ad. Requires both generated content and a visual.</p>
            <Button onClick={handleGenerateVideo} variant="outline" disabled={!adContent || !visual}>
                {loading.video ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Video
            </Button>
        </div>
    );
  };

  return (
    <Tabs defaultValue="product" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="product">Product Info</TabsTrigger>
        <TabsTrigger value="content" disabled={loading.adContent}>
          {loading.adContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ad Content
        </TabsTrigger>
        <TabsTrigger value="narration" disabled={!adContent || loading.narration}>
            {loading.narration && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Narration
        </TabsTrigger>
        <TabsTrigger value="visual" disabled={loading.visual}>
            {loading.visual && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Visuals
        </TabsTrigger>
        <TabsTrigger value="video" disabled={!adContent || !visual || loading.video}>
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
      <TabsContent value="narration">
        {renderNarration()}
      </TabsContent>
      <TabsContent value="visual">
        {renderVisuals()}
      </TabsContent>
      <TabsContent value="video">
        {renderVideoAd()}
      </TabsContent>
    </Tabs>
  );
}
