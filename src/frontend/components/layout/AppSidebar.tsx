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

type SidebarItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
};

export function AppSidebar() {
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith('/admin');

  const sectionLabelClass = cn(
    'font-heading mb-3 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest',
    'text-primary bg-primary/5 rounded-lg inline-block ml-3'
  );

  const itemClass = (isActive: boolean) =>
    cn(
      'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all relative',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
      isActive
        ? 'text-primary font-heading font-black'
        : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)] font-heading font-bold'
    );

  const iconClass = (isActive: boolean) =>
    cn(
      'shrink-0 transition-colors',
      isActive ? 'text-primary' : 'text-[var(--app-text-subtle)] group-hover:text-[var(--app-text)]'
    );

  const studentLearningItems: SidebarItem[] = [
    { icon: Grid, label: 'Tổng quan', href: '/student/library' },
    { icon: BookOpen, label: 'Khóa học đã đăng ký', href: '/student/documents' },
    { icon: MessageSquare, label: 'Đánh giá', href: '/student/reviews' },
    { icon: FileText, label: 'Lượt làm bài quiz', href: '/student/quiz-attempts' },
  ];

  const adminLearningItems: SidebarItem[] = [
    { icon: Grid, label: 'Tổng quan admin', href: '/admin#overview' },
    { icon: BookOpen, label: 'Quản lý khóa học', href: '/admin#courses' },
    { icon: MessageSquare, label: 'Nhật ký xử lý', href: '/admin#jobs' },
  ];

  const learningItems = isAdminArea ? adminLearningItems : studentLearningItems;

  const toolItems: SidebarItem[] = isAdminArea
    ? [{ icon: Upload, label: 'Đăng tải bài giảng', href: '/admin#upload' }]
    : [{ icon: Upload, label: 'Tải video lên', href: '/student/upload' }];

  const accountItems: SidebarItem[] = isAdminArea
    ? [
        { icon: Settings, label: 'Cài đặt hệ thống', href: '/admin#settings' },
        { icon: LogOut, label: 'Đăng xuất', href: '/auth/login' },
      ]
    : [
        { icon: Settings, label: 'Cài đặt & hồ sơ', href: '/student/settings' },
        { icon: LogOut, label: 'Đăng xuất', href: '/auth/login' },
      ];

  const isItemActive = (href: string) => {
    if (typeof window !== 'undefined') {
      const [baseHref, hash] = href.split('#');
      if (hash) {
        return pathname === baseHref && window.location.hash === `#${hash}`;
      }
    }
    const baseHref = href.split('#')[0];
    return pathname === baseHref || (pathname.startsWith(`${baseHref}/`) && baseHref !== '/admin');
  };

  const renderSection = (title: string, items: SidebarItem[]) => (
    <div className="mt-8 first:mt-0">
      <p className={sectionLabelClass}>{title}</p>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = isItemActive(item.href);
          return (
            <Link key={`${title}-${item.label}`} href={item.href} className={itemClass(isActive)}>
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
              )}
              <item.icon size={18} className={iconClass(isActive)} />
              <span className="text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside
      className={cn(
        'sticky top-20 hidden h-[calc(100vh-80px)] w-[240px] min-w-[240px] shrink-0 flex-col self-start border-r border-[var(--app-border-subtle)] bg-[var(--app-surface)] lg:flex'
      )}
    >
      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-6">
        {renderSection('Trang chủ', learningItems)}
        {renderSection('Công cụ', toolItems)}
        {renderSection('Cài đặt tài khoản', accountItems)}
      </div>
    </aside>
  );
}

