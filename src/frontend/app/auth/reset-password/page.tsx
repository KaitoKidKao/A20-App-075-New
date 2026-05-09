'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Set Password</h1>
        <p className="text-slate-500 font-medium leading-relaxed">Your new password must be different from previous password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Password *</label>
          <div className="relative group">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-10 pl-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Password strength indicator mock */}
          <div className="flex gap-1.5 pt-1">
             <div className="h-1 flex-1 bg-green-500 rounded-full" />
             <div className="h-1 flex-1 bg-green-500 rounded-full" />
             <div className="h-1 flex-1 bg-slate-100 rounded-full" />
             <div className="h-1 flex-1 bg-slate-100 rounded-full" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
          <div className="relative group">
            <input
              required
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pr-10 pl-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          disabled={isSubmitting || !password || password !== confirmPassword}
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
          {!isSubmitting && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
