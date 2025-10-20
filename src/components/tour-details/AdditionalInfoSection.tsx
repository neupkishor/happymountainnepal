'use client';

import type { Tour } from '@/lib/types';

interface AdditionalInfoSectionProps {
  sections: Tour['additionalInfoSections'];
}

export function AdditionalInfoSection({ sections }: AdditionalInfoSectionProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold !font-headline mb-6">More Information</h2>
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index}>
            <h3 className="text-2xl font-bold !font-headline mb-4">{section.title}</h3>
            <div 
              className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-h4:font-headline prose-h4:text-xl prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-ul:list-disc prose-ul:ml-6"
              dangerouslySetInnerHTML={{ __html: section.content }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}