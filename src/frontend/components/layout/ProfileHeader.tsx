'use client';

import React from 'react';
import { User, Pencil } from 'lucide-react';

export function ProfileHeader() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Pattern */}
      <div className="h-48 md:h-60 profile-header-pattern">
        {/* Note for User: Bạn có thể chèn ảnh background geometric (blue pattern) của DreamsLMS vào class profile-header-pattern trong globals.css */}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center bg-black/5">
        <div className="w-full max-w-[1440px] mx-auto px-8 flex items-center gap-6 pt-8">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              {/* Note for User: Chèn ảnh đại diện (Ronald Richard) vào đây */}
              <User className="text-slate-300" size={64} />
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 md:w-8 md:h-8 bg-green-500 border-4 border-white rounded-full shadow-md" />
          </div>

          <div className="text-white space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ronald Richard</h1>
              <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                <Pencil size={16} />
              </button>
            </div>
            <p className="text-sm md:text-base font-semibold opacity-90 uppercase tracking-widest">Student</p>
          </div>
        </div>
      </div>
    </div>
  );
}
