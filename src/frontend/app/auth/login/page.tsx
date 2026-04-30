'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Delay
    setTimeout(() => {
      login({
        name: role === 'admin' ? 'System Administrator' : 'Ronald Richard',
        email: email || 'user@example.com',
        role: role
      });
      
      setIsSubmitting(false);
      
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/library');
      }
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sign In</h1>
        <p className="text-slate-500 font-medium">New User? <Link href="/auth/register" className="text-[#FF4F6E] font-bold hover:underline">Create an Account</Link></p>
      </div>

      {/* Role Switcher */}
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
        <button 
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Student
        </button>
        <button 
          type="button"
          onClick={() => setRole('admin')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Admin
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address *</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password *</label>
            <Link href="/auth/forgot-password" className="text-xs font-bold text-[#FF4F6E] hover:underline">Forgot Password?</Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              required
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter your password"
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

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-200 text-[#FF4F6E] focus:ring-[#FF4F6E]" />
          <label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer">Remember me</label>
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
          {!isSubmitting && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs font-black uppercase tracking-widest">
            <span className="bg-white px-4 text-slate-400">Or Login With</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-all">
             <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-80" />
             Google
          </button>
          <button type="button" className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-all">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
               <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
             </svg>
             Github
          </button>
        </div>
      </form>
    </div>
  );
}
