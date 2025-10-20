"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  // State to track if the component is mounted on the client
  const [mounted, setMounted] = useState(false);
  // Internal state for the editor's value to manage uncontrolled/controlled behavior
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update internal editorValue if the prop value changes
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]); // Only re-run if the prop 'value' changes

  // Define the toolbar options
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }], // Headings
        ['bold', 'italic', 'underline'], // Text formatting
        [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Lists
        ['image'], // Image insertion
      ],
    },
    clipboard: {
      matchVisual: false, // Disable matching visual styles from clipboard
    },
  }), []);

  // Render a placeholder or null until mounted on the client to prevent hydration mismatches
  if (!mounted) {
    return <div className="h-40 rounded-md border bg-muted/20 animate-pulse" />;
  }

  return (
    <div className="rich-text-editor-container">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(val) => {
          setEditorValue(val); // Update internal state
          onChange(val);      // Propagate change to form
        }}
        modules={modules}
        placeholder={placeholder}
        readOnly={disabled}
        className="bg-card rounded-md"
        style={{ height: '250px' }} // Added a fixed height for better initial rendering
      />
    </div>
  );
}