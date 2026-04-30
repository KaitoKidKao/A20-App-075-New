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
  Accessibility
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: Grid, label: 'Dashboard', href: '/student/library' },
    { icon: User, label: 'My Profile', href: '/student/settings' },
    { icon: BookOpen, label: 'Enrolled Courses', href: '/student/documents' },
    { icon: Upload, label: 'Upload Video', href: '/student/upload' },
  ];

  const accountItems = [
    { icon: Settings, label: 'Settings', href: '/student/settings' },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col bg-white border-r border-slate-100 transition-all duration-300 h-auto",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex-1 overflow-y-auto px-3 py-6 scrollbar-hide">
        <div className="mb-6">
          <p className={cn("text-[11px] font-bold text-slate-800 mb-3 px-3", collapsed && "opacity-0")}>
            Main Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    isActive 
                      ? "bg-primary/5 text-primary font-semibold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  )}
                >
                  <item.icon size={16} className={cn("shrink-0", isActive ? "text-primary" : "text-slate-700 group-hover:text-slate-900")} />
                  {!collapsed && <span className="text-[13px]">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          <p className={cn("text-[11px] font-bold text-slate-800 mb-3 px-3", collapsed && "opacity-0")}>
            Account Settings
          </p>
          <nav className="space-y-1">
            {accountItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium group"
              >
                <item.icon size={16} className="shrink-0 text-slate-700 group-hover:text-slate-900" />
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
