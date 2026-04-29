'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { DemoRoleSwitcher } from '../DemoRoleSwitcher';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { ProfileHeader } from './ProfileHeader';
import { Footer } from './Footer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <>
        {children}
        <DemoRoleSwitcher />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      {pathname.startsWith('/student/') && <ProfileHeader />}
      <div className="flex-1 flex w-full max-w-[1440px] mx-auto">
        <AppSidebar />
        <main className="flex-1 min-w-0 pb-12">
          {children}
        </main>
      </div>
      <Footer />
      <DemoRoleSwitcher />
    </div>
  );
}
