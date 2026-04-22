'use client';

import React, { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MicLevelVisualizerProps {
  isActive?: boolean;
  className?: string;
}

export function MicLevelVisualizer({ isActive = false, className }: MicLevelVisualizerProps) {
  const [levels, setLevels] = useState<number[]>(new Array(12).fill(10));

  useEffect(() => {
    if (!isActive) {
      setLevels(new Array(12).fill(5));
      return;
    }

    const interval = setInterval(() => {
      setLevels(prev => prev.map(() => Math.floor(Math.random() * 80) + 10));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className={cn("flex items-end gap-1 h-12 px-4 bg-slate-50 border rounded-lg", className)}>
      {levels.map((level, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-t-sm transition-all duration-100",
            isActive ? "bg-primary" : "bg-neutral-300"
          )}
          style={{ 
            height: `${level}%`,
            opacity: 0.4 + (level / 120)
          }}
        />
      ))}
    </div>
  );
}
