'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LockScreenPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* User Avatar */}
        <div className="relative">
           <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
              <User size={48} className="text-slate-300" />
           </div>
           <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FF4F6E] rounded-full border-4 border-white flex items-center justify-center text-white">
              <Lock size={14} fill="currentColor" />
           </div>
        </div>

        <div className="text-center space-y-2">
           <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Xin chào, Ronald Richard</h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nhập mật khẩu để mở khóa màn hình</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Mật khẩu *</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4F6E] transition-colors" size={20} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Nhập mật khẩu"
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

        <button className="w-full py-4 bg-[#FF4F6E] text-white font-extrabold rounded-2xl shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          Mở khóa
          <ArrowRight size={20} />
        </button>

        <div className="text-center">
           <p className="text-sm font-bold text-slate-400">
              Không phải bạn? 
              <Link href="/auth/login" className="text-[#FF4F6E] hover:underline ml-2">Đăng nhập bằng tài khoản khác</Link>
           </p>
        </div>
      </form>
    </div>
  );
}
