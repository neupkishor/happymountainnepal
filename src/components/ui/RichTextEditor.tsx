
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { MediaLibraryDialog } from '@/components/manage/MediaLibraryDialog';
import type { Quill } from 'react-quill-new';
import type { UploadCategory, ImageWithCaption } from '@/lib/types';
import { Input } from './input';
import { Button } from './button';
import { ImageIcon, Link, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Label } from './label';

// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface ImageToolbarProps {
  position: { top: number; left: number; width: number };
  onUpdate: (alt: string) => void;
  onReplace: () => void;
  onDelete: () => void;
  initialAlt: string;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({ position, onUpdate, onReplace, onDelete, initialAlt }) => {
  const [altText, setAltText] = useState(initialAlt);

  useEffect(() => {
    setAltText(initialAlt);
  }, [initialAlt]);

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAltText(e.target.value);
  };

  const handleAltUpdate = () => {
    onUpdate(altText);
  };

  return (
    <div
      className="absolute z-10 p-2 bg-background border rounded-lg shadow-lg flex items-center gap-2"
      style={{ top: position.top, left: position.left, transform: 'translateY(8px)' }}
      onClick={(e) => e.stopPropagation()} // Prevent editor from losing focus
    >
      <Input
        type="text"
        placeholder="Alt text (caption)"
        value={altText}
        onChange={handleAltChange}
        className="h-8 text-xs"
      />
      <Button size="sm" onClick={handleAltUpdate} className="h-8">Update</Button>
      <Button size="sm" variant="outline" onClick={onReplace} className="h-8">Replace</Button>
      <Button size="sm" variant="destructive" onClick={onDelete} className="h-8">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};


interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editorValue, setEditorValue] = useState(value);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const quillRef = useRef<Quill | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<{ node: HTMLElement; blot: any; rect: DOMRect } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  const handleEditorClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG' && target.parentElement?.tagName === 'FIGURE') {
      const figure = target.parentElement;
      if (quillRef.current) {
        const blot = (ReactQuill.Quill as any).find(figure);
        const rect = figure.getBoundingClientRect();
        const editorBounds = editorRef.current?.getBoundingClientRect();

        if (blot && editorBounds) {
          setSelectedImage({
            node: figure,
            blot: blot,
            rect: rect,
          });
        }
      }
    } else {
      setSelectedImage(null);
    }
  };

  const imageHandler = () => {
    setSelectedImage(null);
    setIsMediaLibraryOpen(true);
  };

  const handleImageSelect = (urls: ImageWithCaption[]) => {
    if (urls.length === 0 || !quillRef.current) return;

    const quill = quillRef.current;
    const range = quill.getSelection(true) || { index: 0, length: 0 };
    const imageUrl = urls[0];

    quill.insertEmbed(range.index, 'customImage', { url: imageUrl.url, alt: imageUrl.caption || '' }, 'user');
    quill.setSelection(range.index + 1, 0);
    setIsMediaLibraryOpen(false);
  };

  const handleReplaceImage = () => {
    setIsMediaLibraryOpen(true);
  };

  const handleReplaceSelectedImage = (urls: ImageWithCaption[]) => {
    if (urls.length === 0 || !selectedImage || !quillRef.current) return;
    const newImage = urls[0];
    quillRef.current.deleteText(selectedImage.blot.offset(quillRef.current.scroll), 1, 'user');
    quillRef.current.insertEmbed(selectedImage.blot.offset(quillRef.current.scroll), 'customImage', { url: newImage.url, alt: newImage.caption || '' }, 'user');
    setSelectedImage(null);
    setIsMediaLibraryOpen(false);
  };

  const handleUpdateImageAlt = (newAlt: string) => {
    if (!selectedImage || !quillRef.current) return;
    const { blot } = selectedImage;
    blot.format('alt', newAlt);
    quillRef.current.setSelection(quillRef.current.getSelection()); // To refresh selection
    setSelectedImage(null);
  };

  const handleDeleteImage = () => {
    if (!selectedImage || !quillRef.current) return;
    quillRef.current.deleteText(selectedImage.blot.offset(quillRef.current.scroll), 1, 'user');
    setSelectedImage(null);
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'link'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['image'],
      ],
      handlers: {
        'image': imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const getQuillRef = (el: any) => {
    if (typeof window !== 'undefined' && el && !quillRef.current) {
      quillRef.current = el.getEditor();
      if (quillRef.current) {
        // Correctly get the Quill static from the instance
        const Quill = quillRef.current.constructor as any;
        const BlockEmbed = Quill.import('blots/block/embed');

        class ImageBlot extends BlockEmbed {
          static blotName = 'customImage';
          static tagName = 'figure';
          static className = 'ql-custom-image-container';

          static create(value: { url: string; alt: string }) {
            const node = super.create();
            node.setAttribute('contenteditable', 'false');
            const img = document.createElement('img');
            img.setAttribute('src', value.url);
            img.setAttribute('alt', value.alt || '');
            node.appendChild(img);
            return node;
          }

          static value(node: HTMLElement) {
            const img = node.querySelector('img');
            return {
              url: img?.getAttribute('src') || '',
              alt: img?.getAttribute('alt') || '',
            };
          }

          format(name: string, value: any) {
            if (name === 'alt') {
              const img = this.domNode.querySelector('img');
              if (img) {
                img.setAttribute('alt', value);
              }
            } else {
              super.format(name, value);
            }
          }
        }
        Quill.register(ImageBlot);
      }
    }
  };

  const getToolbarPosition = () => {
    if (!selectedImage || !editorRef.current) return { top: 0, left: 0, width: 0 };
    const editorRect = editorRef.current.getBoundingClientRect();
    const imageRect = selectedImage.rect;

    return {
      top: imageRect.bottom - editorRect.top + window.scrollY,
      left: imageRect.left - editorRect.left + window.scrollX,
      width: imageRect.width
    };
  };

  if (!mounted) {
    return <div className="h-40 rounded-md border bg-muted/20 animate-pulse" />;
  }

  return (
    <div className="rich-text-editor-container relative mb-16" style={{ height: '500px' }} ref={editorRef} onClick={handleEditorClick}>
      <ReactQuill
        ref={getQuillRef}
        theme="snow"
        value={editorValue}
        onChange={(val) => {
          setEditorValue(val);
          onChange(val);
        }}
        modules={modules}
        placeholder={placeholder}
        readOnly={disabled}
        className="bg-card rounded-md"
        style={{ height: '500px' }}
      />
      {selectedImage && (
        <ImageToolbar
          position={getToolbarPosition()}
          initialAlt={selectedImage.blot.value().alt}
          onUpdate={handleUpdateImageAlt}
          onReplace={handleReplaceImage}
          onDelete={handleDeleteImage}
        />
      )}
      <MediaLibraryDialog
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={selectedImage ? handleReplaceSelectedImage : handleImageSelect}
        defaultCategory="blog"
      />
    </div>
  );
}
