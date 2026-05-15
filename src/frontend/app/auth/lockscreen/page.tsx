'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LockscreenPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/student/library');
    }, 1500);
  };

  return (
    <div className="space-y-10 text-center animate-in fade-in zoom-in duration-700">
      <div className="space-y-6 flex flex-col items-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Chào mừng quay lại</h1>
        
        {/* User Profile Avatar */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-[#FF4F6E] to-indigo-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
           <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop" 
                alt="Ảnh đại diện người dùng" 
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
           </div>
        </div>
        
        <div className="space-y-1">
           <h3 className="text-xl font-bold text-slate-900">Ronald Richard</h3>
           <p className="text-slate-500 font-medium">ronald.richard@example.com</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full text-left">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Mật khẩu *</label>
          <div className="relative group">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu để mở khóa"
              className="w-full pr-10 pl-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF4F6E]/5 focus:border-[#FF4F6E]/30 transition-all font-medium text-slate-700 shadow-sm"
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

        <button
          disabled={isSubmitting}
          className="w-full py-4 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Đăng nhập'}
          {!isSubmitting && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </button>
        
        <div className="text-center">
           <button type="button" onClick={() => router.push('/auth/login')} className="text-sm font-bold text-slate-400 hover:text-[#FF4F6E] transition-colors">
              Không phải Ronald Richard? <span className="text-[#FF4F6E]">Đăng nhập bằng tài khoản khác</span>
           </button>
        </div>
      </form>
    </div>
  );
}
