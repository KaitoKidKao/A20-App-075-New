'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check Your Email</h1>
          <p className="text-slate-500 font-medium">We&apos;ve sent a password reset link to <span className="text-slate-900 font-bold">{email}</span></p>
        </div>
        <Link 
          href="/auth/otp"
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all flex items-center justify-center gap-2"
        >
          Enter OTP
        </Link>
        <button onClick={() => setIsSent(false)} className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
          Didn&apos;t receive email? Resend
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
        <p className="text-slate-500 font-medium leading-relaxed">Enter your email to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Email *</label>
          <div className="relative group">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pr-10 pl-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={18} />
          </div>
        </div>

        <button
          disabled={isSubmitting}
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit'}
          {!isSubmitting && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </button>
        
        <div className="text-center">
           <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#FF4F6E] transition-colors">
              <ChevronLeft size={16} />
              Remember Password? <span className="text-[#FF4F6E] ml-1">Sign In</span>
           </Link>
        </div>
      </form>
    </div>
  );
}
