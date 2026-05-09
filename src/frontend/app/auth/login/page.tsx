'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.auth.login({ email, password });
      login(response.user, response.access_token);

      if (response.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/library');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Dang nhap that bai. Vui long thu lai.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign into Your Account</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Password *</label>
          <div className="relative group">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#FF4F6E] focus:ring-[#FF4F6E]" />
            <label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer">Remember Me</label>
          </div>
          <Link href="/auth/forgot-password" className="text-sm font-bold text-[#FF4F6E]/80 hover:text-[#FF4F6E] hover:underline">Forgot Password?</Link>
        </div>

        <button
          disabled={isSubmitting}
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs font-bold text-slate-400">
            <span className="bg-[#FFF9FA] px-4 uppercase tracking-widest">Or</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-[#E9ECEF] rounded-full font-bold text-slate-600 hover:bg-slate-200 transition-all">
            <Image src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} unoptimized className="opacity-70" />
            Google
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-[#E9ECEF] rounded-full font-bold text-slate-600 hover:bg-slate-200 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        <div className="text-center pt-4 space-y-4">
          <p className="text-sm font-medium text-slate-500">
            Do not have an account?
            <Link href="/auth/register" className="text-[#FF4F6E] font-bold hover:underline ml-1">Sign up</Link>
          </p>

          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={() => {
                login({ name: 'Dev User', email: 'dev@dreams.com', role: 'student' }, 'mock-token');
                router.push('/student/library');
              }}
              className="w-full py-3 border-2 border-dashed border-[#FF4F6E]/30 text-[#FF4F6E] font-black rounded-2xl hover:bg-[#FF4F6E]/5 transition-all text-[10px] uppercase tracking-[0.2em] animate-pulse"
            >
              Bypass Login (Dev Only)
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
