'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Upload, 
  Library, 
  Radio, 
  FileText, 
  BarChart3, 
  Settings,
  Home,
  BookOpen,
  PlayCircle,
  History,
  Users,
  Terminal,
  Activity,
  ChevronLeft,
  ChevronRight,
  Accessibility
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

  const menuItems = {
    teacher: [
      { icon: Upload, label: 'Tải lên video', href: '/teacher/upload' },
      { icon: FileText, label: 'Chuyển đổi tài liệu (PDF/DOCX)', href: '/teacher/documents' },
      { icon: Library, label: 'Thư viện bài giảng', href: '/teacher/library' },
      { icon: FileText, label: 'Transcript sau buổi học', href: '/teacher/transcripts' },
      { icon: BarChart3, label: 'Thống kê', href: '/teacher/analytics' },
      { icon: Settings, label: 'Cài đặt', href: '/teacher/settings' },
    ],
    student: [
      { icon: Home, label: 'Trang chủ', href: '/' },
      { icon: BookOpen, label: 'Thư viện học liệu', href: '/student/library' },
      { icon: PlayCircle, label: 'Đang học', href: '/student/learning' },
      { icon: History, label: 'Replay & Transcript', href: '/student/history' },
      { icon: Accessibility, label: 'Tùy chọn hiển thị', href: '/student/accessibility' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard hệ thống', href: '/admin' },
      { icon: Users, label: 'Quản lý người dùng', href: '/admin/users' },
      { icon: Terminal, label: 'Cấu hình model', href: '/admin/config' },
      { icon: Activity, label: 'Audit log', href: '/admin/audit' },
      { icon: BarChart3, label: 'Metrics & jobs', href: '/admin/metrics' },
    ],
  }[currentRole];

  return (
    <aside 
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300 relative h-full",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
        <div className="bg-primary text-white p-2 rounded-lg shrink-0">
          <Accessibility size={20} />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">UDL Hearing</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                isActive 
                  ? "bg-primary-soft text-primary font-semibold" 
                  : "text-neutral hover:bg-slate-50 hover:text-text"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", isActive ? "text-primary" : "group-hover:text-text")} />
              {!collapsed && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile/Settings Placeholder */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-neutral hover:bg-slate-50 hover:text-text transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2"><ChevronLeft size={20} /><span className="text-sm">Thu gọn menu</span></div>}
        </button>
      </div>
    </aside>
  );
}
