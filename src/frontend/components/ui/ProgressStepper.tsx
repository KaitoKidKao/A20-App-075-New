'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Step {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'completed';
  duration?: string;
  subText?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  className?: string;
}

export function ProgressStepper({ steps, className }: ProgressStepperProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="relative flex gap-4">
            {!isLast && (
              <div 
                className={cn(
                  "absolute left-[15px] top-8 w-0.5 h-8",
                  step.status === 'completed' ? "bg-primary" : "bg-border"
                )} 
              />
            )}
            
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              {step.status === 'completed' ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-4 w-4" />
                </div>
              ) : step.status === 'loading' ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border text-neutral">
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col pt-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-semibold",
                  step.status === 'loading' ? "text-primary" : "text-text"
                )}>
                  {step.name}
                </span>
                {step.duration && (
                  <span className="text-xs text-neutral">
                    — {step.duration}
                  </span>
                )}
              </div>
              {step.subText && (
                <p className="text-xs text-neutral mt-0.5">
                  {step.subText}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
