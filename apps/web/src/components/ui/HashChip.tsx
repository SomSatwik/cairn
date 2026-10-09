'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface HashChipProps {
  hash: string;
  truncate?: boolean;
  truncateLength?: number;
  label?: string;
  className?: string;
}

export const HashChip: React.FC<HashChipProps> = ({
  hash,
  truncate = true,
  truncateLength = 8,
  label,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const displayHash = truncate
    ? `${hash.slice(0, truncateLength + 2)}…${hash.slice(-truncateLength)}`
    : hash;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy full hash"
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 bg-graphite-900 border border-hairline rounded-sm hover:border-hairline-hover transition-colors text-xs font-mono tabular text-stone-warm-200 hover:text-white group cursor-pointer select-all',
          className
        )
      )}
    >
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-stone-warm-500 font-sans mr-0.5">
          {label}:
        </span>
      )}
      <span>{displayHash}</span>
      {copied ? (
        <Check className="w-3 h-3 text-ochre shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-stone-warm-500 group-hover:text-stone-warm-300 shrink-0 transition-colors" />
      )}
    </button>
  );
};
