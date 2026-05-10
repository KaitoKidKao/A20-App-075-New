'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(59);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== '' && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/auth/reset-password');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Email OTP</h1>
        <p className="text-slate-500 font-medium leading-relaxed">OTP sent to your Email Address ending ******doe@example.com</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-4">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-16 h-20 text-center text-3xl font-black text-slate-900 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#FF4F6E] focus:ring-4 focus:ring-[#FF4F6E]/5 outline-none transition-all"
            />
          ))}
        </div>

        <div className="flex justify-center">
           <div className="bg-red-50 text-[#FF4F6E] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <circle cx="12" cy="12" r="10" />
                 <polyline points="12 6 12 12 16 14" />
              </svg>
              00:{timer < 10 ? `0${timer}` : timer} s
           </div>
        </div>

        <button
          disabled={isSubmitting || otp.some(v => v === '')}
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Proceed'}
          {!isSubmitting && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </button>
        
        <div className="text-center">
           <p className="text-sm font-medium text-slate-500">
              Didn&apos;t get the OTP? <button type="button" className="text-[#FF4F6E] font-bold hover:underline ml-1">Resend OTP</button>
           </p>
        </div>
      </form>
    </div>
  );
}
