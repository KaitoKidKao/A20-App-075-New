'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Set Password</h1>
        <p className="text-slate-500 font-medium">Your new password must be different from previous password.</p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password *</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter new password"
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password *</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Confirm new password"
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Validation List */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
           {[
              'At least 8 characters long',
              'Must contain one upper case letter',
              'Must contain one special character'
           ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                 <CheckCircle2 size={14} className="text-slate-300" />
                 {item}
              </div>
           ))}
        </div>

        <Link 
          href="/auth/login"
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Reset Password
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </form>
    </div>
  );
}
