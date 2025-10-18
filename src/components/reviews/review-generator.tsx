'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  reviewPlace,
  type ReviewPlaceOutput,
} from '@/ai/flows/review-places';
import { Loader2, Sparkles, Download, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ReviewGenerator() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<ReviewPlaceOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!url) {
      toast({
        variant: 'destructive',
        title: 'URL is required',
        description: 'Please enter a URL to generate assets.',
      });
      return;
    }
    setLoading(true);
    setAssets(null);
    try {
      const result = await reviewPlace({ url });
      setAssets(result);
    } catch (error: any) {
      console.error('Failed to generate review assets:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          error.message || 'Could not generate assets from the URL.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDataUri = (dataUri: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center space-x-2">
        <LinkIcon className="h-5 w-5 text-muted-foreground" />
        <Input
          type="url"
          placeholder="https://example.com/place-reviews"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </div>

      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      )}

      {assets && (
        <Card>
          <CardHeader>
            <CardTitle>{assets.placeName}</CardTitle>
            <CardDescription>
              Generated assets based on online reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Generated Image</h3>
              <Image
                src={assets.imageUrl}
                alt={`Generated image for ${assets.placeName}`}
                width={1024}
                height={576}
                className="rounded-lg border"
              />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Generated Script</h3>
              <p className="text-muted-foreground">{assets.script}</p>
            </div>
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                handleDownloadDataUri(assets.imageUrl, 'review_image.jpg')
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
