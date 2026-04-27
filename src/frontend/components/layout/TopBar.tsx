'use client';

import React from 'react';
import { 
  Bell, 
  User, 
  Moon, 
  Sun,
  Menu
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function TopBar() {
  const { currentRole, theme, setTheme } = useAppStore();

  const roleLabel = {
    teacher: 'Học sinh',
    student: 'Học sinh',
    admin: 'Quản trị viên'
  }[currentRole];

  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Visual feedback of being in the right place */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral">Môi trường:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-bg text-primary text-xs font-bold uppercase tracking-wider">
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Calm Utility Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 text-neutral hover:bg-slate-50 hover:text-primary rounded-lg transition-all"
            title="Đổi giao diện Sáng/Tối"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button className="p-2 text-neutral hover:bg-slate-50 hover:text-primary rounded-lg transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full" />
          </button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Quiet User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text">Nguyễn Minh</p>
            <p className="text-[11px] text-neutral font-medium">Học sinh</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary-bg border border-border flex items-center justify-center overflow-hidden transition-transform hover:scale-105 cursor-pointer">
            <User className="text-primary" size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
