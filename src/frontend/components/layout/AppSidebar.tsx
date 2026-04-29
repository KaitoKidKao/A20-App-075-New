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
  LogOut,
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
    { icon: LogOut, label: 'Logout', href: '/' },
  ];

  return (
    <aside 
      className={cn(
        "flex flex-col bg-white border-r border-slate-100 transition-all duration-300 h-auto",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Brand Header Removed */}

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <div className="mb-4">
          <p className={cn("text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mb-4 px-4", collapsed && "opacity-0")}>
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
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-slate-50 text-[#FF5A1F] font-bold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary font-medium"
                  )}
                >
                  <item.icon size={18} className={cn("shrink-0", isActive ? "text-[#FF5A1F]" : "group-hover:text-primary")} />
                  {!collapsed && <span className="text-[14px]">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          <p className={cn("text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mb-4 px-4", collapsed && "opacity-0")}>
            Account Settings
          </p>
          <nav className="space-y-1">
            {accountItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-primary transition-all font-medium"
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="text-[14px]">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Simplified Footer / Toggle */}
      <div className="p-4 border-t border-slate-50">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0">
            <span className="text-[10px] font-bold">N</span>
          </div>
          {!collapsed && (
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Thu gọn menu</span>
          )}
        </button>
      </div>
    </aside>
  );
}
