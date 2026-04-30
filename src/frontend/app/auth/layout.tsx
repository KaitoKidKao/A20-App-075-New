'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF9FA] flex overflow-hidden">
      {/* Left Side: Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FFF5F6] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-[#4C40ED]/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 w-full max-w-md">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-16">
            <span className="text-2xl font-black text-slate-900 tracking-tight">DreamsLMS</span>
          </div>

          {/* Illustration Container */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 mb-12 transform hover:scale-[1.02] transition-transform duration-700">
             <div className="aspect-square bg-gradient-to-br from-white to-slate-50 rounded-[32px] flex items-center justify-center relative overflow-hidden">
                {/* Mock Phone/UI Illustration */}
                <div className="w-48 h-80 bg-white rounded-[32px] border-4 border-slate-900 shadow-2xl relative flex flex-col p-4 space-y-4">
                   <div className="w-12 h-1.5 bg-slate-100 rounded-full self-center" />
                   <div className="w-full h-24 bg-slate-50 rounded-2xl" />
                   <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 rounded-full" />
                      <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                   </div>
                   <div className="w-full h-10 bg-[#FF4F6E] rounded-xl mt-auto shadow-lg shadow-[#FF4F6E]/20" />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 right-10 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#FF4F6E]">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                   </svg>
                </div>
                <div className="absolute bottom-10 left-10 w-12 h-12 bg-[#00D084] rounded-xl shadow-lg flex items-center justify-center text-white">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
                      <polyline points="20 6 9 17 4 12" />
                   </svg>
                </div>
             </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900">Welcome to DreamsLMS Courses.</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Platform designed to help organizations, educators, and learners manage, deliver, and track learning and training activities.
            </p>
            
            {/* Pagination Dots Indicator */}
            <div className="flex justify-center gap-2 pt-4">
              <div className="w-8 h-1.5 bg-[#FF4F6E] rounded-full" />
              <div className="w-2 h-1.5 bg-slate-200 rounded-full" />
              <div className="w-2 h-1.5 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-20 relative bg-[#FFF9FA]">
        {/* Back to Home Link (Top Right) */}
        <div className="absolute top-10 right-10">
           <a href="/" className="text-sm font-bold text-[#FF4F6E] hover:underline">Back to Home</a>
        </div>
        
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  );
}
