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
  const isVideoProcessingPage =
    pathname.startsWith('/student/videos/') && pathname.includes('/processing');

  if (isLandingPage || isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <TopBar />
      <div className="pt-20 flex flex-col min-h-screen">
        {pathname.startsWith('/student/') && !isVideoProcessingPage && <ProfileHeader />}
        <div className="flex-1 flex w-full">
          {!isVideoProcessingPage && <AppSidebar />}
          <main className="flex-1 min-w-0 pb-12">
            {children}
          </main>
        </div>
        {!isVideoProcessingPage && <Footer />}
      </div>
    </div>
  );
}
