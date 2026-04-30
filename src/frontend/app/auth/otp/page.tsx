'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, RefreshCcw } from 'lucide-react';

export default function OTPPage() {
  const [timeLeft, setTimeLeft] = useState(59);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Email OTP</h1>
        <p className="text-slate-500 font-medium leading-relaxed">
          OTP sent to your Email Address ending <span className="text-slate-900 font-bold">*******doe@example.com</span>
        </p>
      </div>

      <div className="space-y-8">
        {/* OTP Input Group */}
        <div className="flex gap-4 justify-between">
          {[1, 2, 3, 4].map((i) => (
            <input 
              key={i}
              type="text" 
              maxLength={1}
              className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all shadow-sm"
              autoFocus={i === 1}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="flex justify-center lg:justify-start">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF4F6E]/5 rounded-xl text-[#FF4F6E] font-black text-sm">
              <Timer size={16} />
              00:{timeLeft.toString().padStart(2, '0')}
           </div>
        </div>

        <Link 
          href="/auth/reset-password"
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Verify & Proceed
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>

        <div className="text-center">
           <p className="text-sm font-bold text-slate-400">
              Didn&apos;t get the OTP? 
              <button className="text-[#FF4F6E] hover:underline ml-2 flex inline-flex items-center gap-1.5 transition-colors">
                 <RefreshCcw size={14} /> Resend OTP
              </button>
           </p>
        </div>
      </div>
    </div>
  );
}
