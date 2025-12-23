
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { MediaLibraryDialog } from '@/components/manage/MediaLibraryDialog';
import type { Quill } from 'react-quill-new';
import type { UploadCategory } from '@/lib/types';

// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  const imageHandler = () => {
    setIsMediaLibraryOpen(true);
  };

  const handleImageSelect = (urls: string[]) => {
    if (urls.length === 0 || !quillRef.current) return;

    const quill = quillRef.current;
    const range = quill.getSelection(true);
    const imageUrl = urls[0];

    // Insert the image URL into the editor
    quill.insertEmbed(range.index, 'image', imageUrl);
    quill.setSelection(range.index + 1, 0); // Move cursor after the image
    setIsMediaLibraryOpen(false);
  };

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
    if (typeof window !== 'undefined' && el) {
      quillRef.current = el.getEditor();
    }
  };

  if (!mounted) {
    return <div className="h-40 rounded-md border bg-muted/20 animate-pulse" />;
  }

  return (
    <div className="rich-text-editor-container">
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
        style={{ height: '250px' }}
      />
      <MediaLibraryDialog
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleImageSelect}
        defaultCategory="blog"
      />
    </div>
  );
}
