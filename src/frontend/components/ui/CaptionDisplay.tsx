'use client';

import React, { useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '@/store/useAppStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CaptionDisplayProps {
  partialText?: string;
  finalLines: string[];
  className?: string;
}

export function CaptionDisplay({ partialText, finalLines, className }: CaptionDisplayProps) {
  const { fontSize, autoScroll, highContrast } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [finalLines, partialText, autoScroll]);

  const fontSizeClass = {
    'S': 'text-sm md:text-base',
    'M': 'text-base md:text-xl',
    'L': 'text-xl md:text-3xl',
    'XL': 'text-3xl md:text-5xl',
  }[fontSize];

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col gap-4 p-6 overflow-y-auto h-full transition-all duration-300",
        highContrast ? "bg-black text-white" : "bg-slate-900 text-slate-100",
        className
      )}
    >
      <div className="flex flex-col gap-4 min-h-full justify-end">
        {finalLines.map((line, i) => (
          <p 
            key={i} 
            className={cn(
              "font-bold leading-tight animate-in fade-in slide-in-from-bottom-2 duration-300",
              fontSizeClass
            )}
          >
            {line}
          </p>
        ))}
        
        {partialText && (
          <p 
            className={cn(
              "italic leading-tight text-neutral-400 animate-pulse",
              fontSizeClass
            )}
          >
            {partialText}
          </p>
        )}
      </div>
    </div>
  );
}
