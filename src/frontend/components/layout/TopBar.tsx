'use client';

import React from 'react';
import { 
  Bell, 
  User, 
  Moon, 
  Sun,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function TopBar() {
  const { theme, setTheme } = useAppStore();

  return (
    <header className="flex flex-col sticky top-0 z-50 shadow-sm relative bg-white">
      {/* Main Header */}
      <div className="h-20 bg-white border-b border-slate-100 px-8 grid grid-cols-3 items-center relative z-50">
        {/* Left Side (Empty for now) */}
        <div></div>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 bg-white relative z-50">
          {['Home', 'Courses', 'Instructors', 'Pages', 'Blog'].map((item) => (
            <button key={item} className="flex items-center gap-1 text-[15px] font-semibold text-slate-700 hover:text-primary transition-colors bg-white">
              {item}
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center justify-end gap-6">
          {/* Utility Icons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-full transition-all"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
            </button>
          </div>

          <div className="h-8 w-px bg-slate-100" />

          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Ronald Richard</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Student</p>
            </div>
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                <User className="text-slate-400" size={24} />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
