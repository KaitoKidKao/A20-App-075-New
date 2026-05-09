'use client';

import React from 'react';
import { 
  Bell, 
  User, 
  Moon, 
  Sun,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { theme, setTheme, user, logout } = useAppStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="flex flex-col sticky top-0 z-50 shadow-sm relative bg-white">
      {/* Main Header */}
      <div className="h-20 bg-white border-b border-slate-100 px-8 grid grid-cols-3 items-center relative z-50">
        {/* Left Side (Empty for now) */}
        <div></div>

        {/* Center Search Bar (Optional addition for utility) */}
        <div className="hidden lg:flex items-center justify-center">
           <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="Search your courses..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                 <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
           </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-end gap-6">
          {/* Utility Icons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
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
          <div className="flex items-center gap-3 pl-2 cursor-pointer group relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                {user?.name || 'Guest User'}
              </p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {user?.role || 'Guest'}
              </p>
            </div>
            
            <div className="relative group/avatar">
              <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center group-hover:border-primary transition-all">
                <User className="text-slate-400" size={24} />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              
              {/* Simple Dropdown on hover/click */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all">
                 <button 
                   onClick={handleLogout}
                   className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-500 flex items-center gap-2"
                 >
                    <LogOut size={16} />
                    Log Out
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
