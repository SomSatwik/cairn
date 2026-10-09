import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-stone-warm-300 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full bg-graphite-900 border border-hairline rounded-sm px-3.5 py-2 text-sm text-stone-warm-100 placeholder:text-stone-warm-500 font-mono transition-colors duration-150',
              'focus:outline-none focus:border-ochre focus:ring-1 focus:ring-ochre/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
              className
            )
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-[11px] text-stone-warm-400 font-sans">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-red-400 font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
