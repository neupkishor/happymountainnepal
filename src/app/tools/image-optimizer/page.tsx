import { ImageOptimizer } from '@/components/ImageOptimizer';

export default function ImageOptimizerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold !font-headline">AI Image Optimizer</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Upload an image to get AI-powered suggestions for web optimization prompts.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <ImageOptimizer />
      </div>
    </div>
  );
}
