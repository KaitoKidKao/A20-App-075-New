'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Mapping paths to illustrations
  const illustrations: Record<string, string> = {
    '/auth/login': '/assets/images/auth-img.png',
    '/auth/register': '/assets/images/register-img.png',
    '/auth/forgot-password': '/assets/images/forgot-password-img.png',
    '/auth/otp': '/assets/images/otp-img.png',
    '/auth/reset-password': '/assets/images/set-password-img.png',
  };

  const isLockscreen = pathname.includes('/lockscreen');
  const illustrationSrc = illustrations[pathname] || illustrations['/auth/login'];

  if (isLockscreen) {
    return (
      <div className="min-h-screen bg-[#FFF9FA] flex flex-col items-center justify-center p-8">
         <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-700">
            {/* Logo at Top */}
            <div className="flex flex-col items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                     <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                     <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
               </div>
               <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Dreams</span>
            </div>
            {children}
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA] flex overflow-hidden">
      {/* Left Side: Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FFF5F6] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-[#4C40ED]/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 w-full max-w-md">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
               </svg>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
               Dreams
            </span>
          </div>

          {/* Illustration Container */}
          <div className="relative mb-12 w-full max-w-[400px] mx-auto">
             <div className="relative aspect-square">
                {/* Decorative Background Blob */}
                <div className="absolute inset-0 bg-indigo-100/30 rounded-full blur-3xl animate-pulse" />
                
                {/* Main Illustration Image */}
                <Image 
                  key={pathname}
                  src={illustrationSrc} 
                  alt="Minh họa học tập" 
                  width={400}
                  height={400}
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition-all duration-700 animate-in fade-in zoom-in-95"
                />
             </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Chào mừng đến với <br /> <span className="text-[#FF4F6E]">Dreams</span> Courses.</h2>
            <p className="text-slate-500 font-medium leading-relaxed px-4">
              Nền tảng giúp tổ chức, giảng viên và người học quản lý, triển khai và theo dõi hoạt động học tập, đào tạo.
            </p>
            
            {/* Pagination Dots Indicator */}
            <div className="flex justify-center gap-2 pt-4">
              <div className={`w-8 h-1.5 bg-[#FF4F6E] rounded-full transition-all ${pathname.includes('login') ? 'translate-x-0' : 'translate-x-0'}`} />
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-20 relative bg-[#FFF9FA]">
        {/* Back to Home Link (Top Right) */}
        <div className="absolute top-10 right-10">
           <Link href="/" className="text-sm font-bold text-[#FF4F6E] hover:underline">Về trang chủ</Link>
        </div>
        
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  );
}
