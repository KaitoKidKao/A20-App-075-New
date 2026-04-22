'use client';

import React from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Moon, 
  Sun,
  SearchIcon,
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
    teacher: 'Giáo viên',
    student: 'Sinh viên',
    admin: 'Admin'
  }[currentRole];

  const roleColor = {
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
    admin: 'bg-primary-soft text-primary'
  }[currentRole];

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-neutral">
          <Menu size={20} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài giảng..."
            className="w-[300px] pl-10 pr-4 py-2 bg-slate-50 border-transparent border focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-lg text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 text-neutral hover:bg-slate-50 rounded-lg transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="relative">
          <button className="p-2 text-neutral hover:bg-slate-50 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
          </button>
        </div>

        <div className="h-8 w-px bg-border mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text">Nguyễn Minh</p>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", roleColor)}>
              {roleLabel}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <User className="text-slate-500" size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
