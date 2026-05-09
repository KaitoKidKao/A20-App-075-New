'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Mat khau xac nhan khong khop.');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 8) {
      setError('Mat khau phai co it nhat 8 ky tu.');
      setIsSubmitting(false);
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Mat khau phai co chu hoa, chu thuong va chu so.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.auth.register({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Dang ky that bai. Vui long thu lai.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
          <CheckCircle2 size={48} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Registration Successful!</h1>
          <p className="text-slate-500 font-medium">Redirecting you to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sign Up</h1>
        <p className="text-slate-500 font-medium">
          Already have an account?
          <Link href="/auth/login" className="text-[#FF4F6E] font-bold hover:underline ml-1">Login</Link>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name *</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input
              required
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password *</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:bg-white focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3">
            <input required type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-slate-200 text-[#FF4F6E] focus:ring-[#FF4F6E]" />
            <label htmlFor="terms" className="text-xs font-bold text-slate-500 leading-relaxed cursor-pointer">
              I agree with <Link href="#" className="text-slate-900 hover:underline">Terms of Service</Link> and <Link href="#" className="text-slate-900 hover:underline">Privacy Policy</Link>
            </label>
          </div>
        </div>

        <button
          disabled={isSubmitting}
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
        </button>

        <div className="pt-4">
          <button type="button" className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} unoptimized className="opacity-80" />
            Sign up with Google
          </button>
        </div>
      </form>
    </div>
  );
}
