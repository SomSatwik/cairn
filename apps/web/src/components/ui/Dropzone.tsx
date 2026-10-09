'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { hashBuffer } from '@cairn/sdk';
import { HashChip } from './HashChip';

export interface DropzoneProps {
  onFileHashed: (file: File, docHash: string) => void;
  isLoading?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileHashed,
  isLoading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      try {
        setIsHashing(true);
        setCurrentFile(file);

        // Read and hash entirely in the browser using Web Crypto API
        const buffer = await file.arrayBuffer();
        const hash = await hashBuffer(buffer);

        setCurrentHash(hash);
        onFileHashed(file, hash);
      } catch (err) {
        console.error('Hashing error:', err);
      } finally {
        setIsHashing(false);
      }
    },
    [onFileHashed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`relative w-full border border-dashed rounded-sm p-8 text-center cursor-pointer transition-all duration-200 select-none ${
        isDragging
          ? 'border-ochre bg-ochre/5'
          : 'border-white/10 hover:border-white/20 bg-graphite-900/60'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading || isHashing}
      />

      {isHashing ? (
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-ochre border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-warm-200 font-mono">
            Hashing file locally in browser...
          </p>
          <p className="text-xs text-stone-warm-500">
            Document never leaves your machine.
          </p>
        </div>
      ) : currentFile && currentHash ? (
        <div
          className="flex flex-col items-center justify-center space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckCircle2 className="w-8 h-8 text-ochre" />
          <div>
            <p className="text-sm font-medium text-stone-warm-100 flex items-center justify-center gap-2">
              <FileText className="w-4 h-4 text-stone-warm-400" />
              {currentFile.name}
            </p>
            <p className="text-xs text-stone-warm-400 tabular mt-0.5">
              {(currentFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="pt-1">
            <HashChip hash={currentHash} label="Document Hash" />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[11px] text-stone-warm-400 hover:text-ochre transition-colors underline underline-offset-4"
          >
            Choose a different file
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-graphite-800 border border-hairline flex items-center justify-center text-stone-warm-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-warm-100">
              Drop any document to prove priority
            </p>
            <p className="text-xs text-stone-warm-500 mt-1">
              PDF, Markdown, code, patents, or research notes. Processed locally.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-graphite-800/60 border border-hairline rounded-sm text-[11px] text-stone-warm-400 font-mono">
            <span>SHA-256</span>
            <span className="text-stone-warm-600">•</span>
            <span>Zero file upload</span>
          </div>
        </div>
      )}
    </div>
  );
};
