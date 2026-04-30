'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';
import { 
  ArrowRight,
  Accessibility,
  CheckCircle2,
  Play,
  FileText,
  MessageSquare
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { } = useAppStore();

  const handleStart = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9FA] text-[#1E293B] selection:bg-accent/10 selection:text-accent">
      {/* Quiet Header */}
      <header className="px-8 py-8 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-primary">UDL Hearing</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral">
          <a href="#" className="hover:text-primary transition-colors">Phương pháp</a>
          <a href="#" className="hover:text-primary transition-colors">Tính năng</a>
          <a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a>
        </nav>
      </header>

      {/* 2-Column Hero Section */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 py-12 md:py-24 grid lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Column: Value Prop */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
              Học tập không rào cản
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-primary">
              Môi trường học tập <br/> tĩnh lặng cho <br/> học sinh khiếm thính.
            </h1>
            <p className="text-xl text-neutral max-w-xl leading-relaxed font-medium">
              Không còn lo lắng vì bỏ lỡ lời giảng. Hệ thống AI hỗ trợ ghi chép, tóm tắt và hiển thị phụ đề trực quan, giúp bạn tập trung hoàn toàn vào nội dung bài học.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold shadow-sm hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              <span>Bắt đầu học tập</span>
              <ArrowRight size={20} />
            </button>
            <div className="flex items-center gap-3 text-sm font-bold text-neutral">
              <span className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </span>
              <span>+200 sinh viên đang học</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="flex gap-3">
              <CheckCircle2 className="text-accent shrink-0" size={20} />
              <p className="text-sm font-medium text-neutral">Phụ đề AI hiển thị theo nhịp giảng bài.</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="text-accent shrink-0" size={20} />
              <p className="text-sm font-medium text-neutral">Tự động tóm tắt các ý chính quan trọng.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Product Mockup (Abstracted) */}
        <div className="relative group">
          {/* Decorative "Desk" Background */}
          <div className="absolute -inset-4 bg-slate-100/50 rounded-[40px] -z-10 blur-2xl transform group-hover:scale-105 transition-transform duration-700"></div>
          
          {/* Mockup Container */}
          <div className="bg-white rounded-3xl shadow-xl border border-border/50 overflow-hidden aspect-[4/3] flex flex-col">
            {/* Mock Header */}
            <div className="h-12 border-b border-border/40 bg-slate-50/50 px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="w-32 h-2 bg-slate-200 rounded-full" />
              <div className="w-6 h-6 bg-slate-200 rounded-full" />
            </div>

            <div className="flex-1 grid grid-cols-12 gap-px bg-border/40">
              {/* Transcript Side */}
              <div className="col-span-8 bg-white p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Play size={16} className="text-accent" />
                  <div className="h-3 w-40 bg-slate-100 rounded-full" />
                </div>
                
                {/* Main Caption Zone */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <div className="h-4 w-full bg-slate-200 rounded-md" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                  </div>
                  <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 space-y-2">
                    <p className="text-sm font-bold opacity-80 mb-1">08:24 — Đang nói</p>
                    <div className="h-4 w-full bg-white/30 rounded-md" />
                    <div className="h-4 w-1/2 bg-white/30 rounded-md" />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex gap-4">
                    <div className="h-3 w-10 bg-slate-100 rounded-full" />
                    <div className="h-3 w-48 bg-slate-100 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-3 w-10 bg-slate-100 rounded-full" />
                    <div className="h-3 w-56 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Summary/Notes Side */}
              <div className="col-span-4 bg-slate-50/50 p-6 space-y-6 border-l border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-neutral" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral">Tóm tắt bài học</span>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-slate-200 rounded-full" />
                  <div className="h-2 w-full bg-slate-200 rounded-full" />
                  <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                </div>
                <div className="pt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1" />
                    <div className="h-2 w-full bg-slate-200 rounded-full" />
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1" />
                    <div className="h-2 w-4/5 bg-slate-200 rounded-full" />
                  </div>
                </div>

                {/* Floating Recovery Prompt */}
                <div className="absolute bottom-10 right-10 left-auto bg-white border border-border shadow-elevated p-4 rounded-2xl w-48 animate-bounce-subtle">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600">Bỏ lỡ thông tin?</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mb-1" />
                  <div className="h-1.5 w-2/3 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footnote */}
      <footer className="px-16 py-12 text-sm font-medium text-neutral/50">
        <div className="flex justify-between items-center border-t border-border/30 pt-8">
          <span>© 2026 UDL Nền tảng học tập hòa nhập.</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Accessibility Statement</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
