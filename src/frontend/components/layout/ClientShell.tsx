'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { ProfileHeader } from './ProfileHeader';

const Footer = dynamic(
  () => import('./Footer').then((mod) => mod.Footer),
  { ssr: false }
);


export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth/');
  const isAdminPage = pathname.startsWith('/admin');
  const isVideoProcessingPage =
    pathname.startsWith('/student/videos/') && pathname.includes('/processing');

  if (isLandingPage || isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  if (isAdminPage) {
    return (
      <div className="h-screen overflow-hidden">
        <TopBar />
        <div className="flex h-[calc(100vh-80px)] flex-col pt-20">
          <div className="flex min-h-0 flex-1 w-full">
            {!isVideoProcessingPage && <AppSidebar />}
            <main id="app-main-scroll" className="min-w-0 flex-1 overflow-y-auto pb-12">
              {children}
              {!isVideoProcessingPage && <Footer />}
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <TopBar />
      <div className="flex min-h-screen flex-col pt-20">
        {pathname.startsWith('/student/') && !isVideoProcessingPage && <ProfileHeader />}
        <div className="flex w-full flex-1">
          {!isVideoProcessingPage && <AppSidebar />}
          <main className="min-w-0 flex-1 pb-12">
            {children}
          </main>
        </div>
        {!isVideoProcessingPage && <Footer />}
      </div>
    </div>
  );
}
