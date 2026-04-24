'use client';

import React, { useRef, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export function TranscriptViewer({ 
  segments, 
  currentTime = 0, 
  onSeek, 
  className 
}: TranscriptViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime]);

  return (
    <div className={cn("flex flex-col h-full bg-card border rounded-xl overflow-hidden", className)}>
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral" />
          <input 
            type="text" 
            placeholder="Tìm kiếm trong transcript..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral hover:text-primary transition-colors">
          <Download className="h-4 w-4" />
          <span>VTT</span>
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {segments.map((segment) => {
          const isActive = currentTime >= segment.startTime && currentTime < segment.endTime;
          
          return (
            <div 
              key={segment.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSeek?.(segment.startTime)}
              className={cn(
                "group flex gap-4 p-3 rounded-lg cursor-pointer transition-all",
                isActive 
                  ? "bg-primary-soft border-l-4 border-primary" 
                  : "hover:bg-slate-50 border-l-4 border-transparent"
              )}
            >
              <span className={cn(
                "font-mono text-xs pt-1 shrink-0",
                isActive ? "text-primary font-bold" : "text-neutral"
              )}>
                {formatTime(segment.startTime)}
              </span>
              <p className={cn(
                "text-sm leading-relaxed",
                isActive ? "text-text font-medium" : "text-neutral group-hover:text-text"
              )}>
                {segment.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
