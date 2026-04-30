'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sign Up</h1>
        <p className="text-slate-500 font-medium">Already have an account? <Link href="/auth/login" className="text-[#FF4F6E] font-bold hover:underline">Login</Link></p>
      </div>

      <form className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name *</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Enter your full name"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address *</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password *</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Create a password"
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
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

        <div className="space-y-4 pt-2">
           <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-slate-200 text-[#FF4F6E] focus:ring-[#FF4F6E]" />
              <label htmlFor="terms" className="text-xs font-bold text-slate-500 leading-relaxed cursor-pointer">
                 I agree with <Link href="#" className="text-slate-900 hover:underline">Terms of Service</Link> and <Link href="#" className="text-slate-900 hover:underline">Privacy Policy</Link>
              </label>
           </div>
        </div>

        <button className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
          Sign Up
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button type="button" className="flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
             <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-80" />
             Google
          </button>
          <button type="button" className="flex items-center justify-center gap-3 py-3.5 bg-[#1B125C] rounded-2xl font-bold text-white hover:bg-[#150d4d] transition-all shadow-sm">
             <ShieldCheck size={18} />
             Facebook
          </button>
        </div>
      </form>
    </div>
  );
}
