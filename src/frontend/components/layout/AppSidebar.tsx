'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Grid, 
  User, 
  BookOpen, 
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  Accessibility,
  MessageSquare,
  Award,
  Heart,
  FileText,
  History,
  Share2,
  Mail,
  LifeBuoy,
  LogOut,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const learningItems = [
    { icon: Grid, label: 'Dashboard', href: '/student/library' },
    { icon: BookOpen, label: 'Enrolled Courses', href: '/student/documents' },
    { icon: MessageSquare, label: 'Reviews', href: '#' },
    { icon: FileText, label: 'My Quiz Attempts', href: '#' },
  ];

  const toolItems = [
    { icon: Upload, label: 'Upload Video', href: '/student/upload' },
  ];

  const accountItems = [
    { icon: Settings, label: 'Settings & Profile', href: '/student/settings' },
    { icon: LogOut, label: 'Logout', href: '/auth/login' },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col bg-white/70 backdrop-blur-xl border-r border-slate-200/50 transition-all duration-300 h-auto",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex-1 overflow-y-auto px-3 py-6 scrollbar-hide">
        <div className="mb-6">
          <p className={cn("text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 px-3", collapsed && "opacity-0")}>
            Main Menu
          </p>
          <nav className="space-y-1">
            {learningItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    isActive 
                      ? "bg-primary/5 text-primary font-bold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold"
                  )}
                >
                  <item.icon size={18} className={cn("shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} />
                  {!collapsed && <span className="text-[13px]">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          <p className={cn("text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 px-3", collapsed && "opacity-0")}>
            Tools
          </p>
          <nav className="space-y-1">
            {toolItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    isActive 
                      ? "bg-primary/5 text-primary font-bold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold"
                  )}
                >
                  <item.icon size={18} className={cn("shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} />
                  {!collapsed && <span className="text-[13px]">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          <p className={cn("text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 px-3", collapsed && "opacity-0")}>
            Account Settings
          </p>
          <nav className="space-y-1">
            {accountItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold group"
              >
                <item.icon size={18} className="shrink-0 text-slate-400 group-hover:text-slate-900" />
                {!collapsed && <span className="text-[13px]">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Simplified Footer / Toggle */}
      <div className="p-3 border-t border-slate-50">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
