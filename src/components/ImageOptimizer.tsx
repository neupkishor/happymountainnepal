"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getImageOptimizationSuggestions } from "@/ai/flows/image-optimization-suggestions";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Lightbulb, UploadCloud, Loader2 } from 'lucide-react';
import Image from 'next/image';

type SuggestionState = 'idle' | 'loading' | 'success' | 'error';

export function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [state, setState] = useState<SuggestionState>('idle');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setSuggestions([]);
      setState('idle');
    }
  };

  const handleGetSuggestions = async () => {
    if (!preview) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }
    setState('loading');
    try {
      const result = await getImageOptimizationSuggestions({ imageDataUri: preview });
      setSuggestions(result.suggestions);
      setState('success');
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        title: "An error occurred",
        description: "Failed to get suggestions from the AI model.",
        variant: "destructive",
      });
      setState('error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Optimization Suggestions</CardTitle>
        <CardDescription>Upload an image and our AI will suggest prompts to optimize it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="image-upload" className="font-medium">Image Upload</label>
          <Input id="image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </div>

        {preview && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Image Preview:</p>
            <Image src={preview} alt="Image preview" width={500} height={300} className="rounded-md object-contain max-h-60 w-auto mx-auto" />
          </div>
        )}

        <Button onClick={handleGetSuggestions} disabled={!file || state === 'loading'} className="w-full">
          {state === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Suggestions...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Get Suggestions
            </>
          )}
        </Button>

        {state === 'success' && suggestions.length > 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Optimization Prompts</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {state === 'idle' && !preview && (
          <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
            <UploadCloud className="mx-auto h-12 w-12" />
            <p className="mt-4">Upload an image to get started.</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
