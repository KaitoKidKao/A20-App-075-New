'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Grid, 
  BookOpen, 
  Upload,
  Settings,
  MessageSquare,
  FileText,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();

  const sectionLabelClass = cn(
    "text-[11px] font-black uppercase tracking-widest mb-3 px-3",
    "text-[var(--app-text-muted)]"
  );

  const itemClass = (isActive: boolean) => cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    isActive
      ? "bg-primary/10 text-primary font-black ring-1 ring-primary/15 shadow-sm"
      : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)] font-bold"
  );

  const iconClass = (isActive: boolean) => cn(
    "shrink-0 transition-colors",
    isActive ? "text-primary" : "text-[var(--app-text-subtle)] group-hover:text-[var(--app-text)]"
  );

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

  const isItemActive = (href: string) => href !== '#' && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <aside 
      className={cn(
        "sticky top-20 self-start hidden h-[calc(100vh-80px)] w-[240px] min-w-[240px] shrink-0 flex-col bg-[var(--app-surface)] border-r border-[var(--app-border-subtle)] lg:flex"
      )}
    >
      <div className="flex-1 overflow-y-auto px-3 py-6 scrollbar-hide">
        <div className="mb-6">
          <p className={sectionLabelClass}>
            Main Menu
          </p>
          <nav className="space-y-1">
            {learningItems.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={itemClass(isActive)}
                >
                  <item.icon size={18} className={iconClass(isActive)} />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          <p className={sectionLabelClass}>
            Tools
          </p>
          <nav className="space-y-1">
            {toolItems.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={itemClass(isActive)}
                >
                  <item.icon size={18} className={iconClass(isActive)} />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          <p className={sectionLabelClass}>
            Account Settings
          </p>
          <nav className="space-y-1">
            {accountItems.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  className={itemClass(isActive)}
                >
                  <item.icon size={18} className={iconClass(isActive)} />
                  <span className="text-[13px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
