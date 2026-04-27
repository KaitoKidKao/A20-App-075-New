'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Library, 
  Upload, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Accessibility,
  BookOpen
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '@/store/useAppStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AppSidebar() {
  const pathname = usePathname();
  const { currentRole } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  // Focus on the "Học sinh" (formerly teacher) role as the primary experience
  const menuItems = {
    teacher: [
      { icon: Library, label: 'Thư viện bài giảng', href: '/student/library' },
      { icon: Upload, label: 'Tải lên bài giảng', href: '/student/upload' },
      { icon: FileText, label: 'Bản ghi sau buổi học', href: '/student/transcripts' },
      { icon: BarChart3, label: 'Tiến độ học tập', href: '/student/analytics' },
      { icon: Settings, label: 'Cài đặt cá nhân', href: '/student/settings' },
    ],
    admin: [
      { icon: BookOpen, label: 'Dashboard hệ thống', href: '/admin' },
      { icon: Settings, label: 'Cấu hình model', href: '/admin/config' },
    ],
  }[currentRole === 'admin' ? 'admin' : 'teacher'];

  return (
    <aside 
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300 relative h-full",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3 overflow-hidden whitespace-nowrap">
        <div className="bg-primary text-white p-2.5 rounded-xl shrink-0 shadow-sm">
          <Accessibility size={22} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight text-primary">UDL Hearing</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems?.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-secondary-bg text-primary font-bold" 
                  : "text-neutral hover:bg-slate-50 hover:text-primary font-medium"
              )}
            >
              <item.icon size={22} className={cn("shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
              {!collapsed && (
                <span className="text-[15px] truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-border/50">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-3 rounded-xl text-neutral hover:bg-slate-50 hover:text-primary transition-colors"
        >
          {collapsed ? <ChevronRight size={22} /> : (
            <div className="flex items-center gap-3 w-full px-2">
              <ChevronLeft size={20} />
              <span className="text-sm font-semibold">Thu gọn menu</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
