'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { ProfileHeader } from './ProfileHeader';
import { Footer } from './Footer';


export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth/');

  if (isLandingPage || isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      {pathname.startsWith('/student/') && <ProfileHeader />}
      <div className="flex-1 flex w-full">
        <AppSidebar />
        <main className="flex-1 min-w-0 pb-12">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
