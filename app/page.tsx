'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageUrl(`data:${data.mediaType};base64,${data.image}`);
      toast.success('Image generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
    toast.success('Image downloaded!');
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            AI Image Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate stunning images using DALL-E 3 and Vercel AI SDK
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Image</CardTitle>
            <CardDescription>
              Describe what you want to see and let AI bring it to life
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Image Description
              </label>
              <Textarea
                id="prompt"
                placeholder="A futuristic cityscape at sunset with flying cars..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button 
              onClick={generateImage}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {imageUrl && !loading && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt="Generated image"
                        className="w-full h-auto"
                      />
                    </div>
                    <Button
                      onClick={downloadImage}
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by Vercel AI SDK and OpenAI DALL-E 3</p>
        </div>
      </div>
    </main>
  );
}
