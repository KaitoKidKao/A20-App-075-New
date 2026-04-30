'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Clock, 
  Zap, 
  ArrowRight,
  Play
} from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main text-text-main font-sans selection:bg-primary/10">
      {/* Editorial Header */}
      <header className="px-8 py-10 md:px-20 flex items-center justify-between max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-text-main font-heading uppercase">UDL Hearing</span>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-text-muted">
          <a href="#" className="hover:text-primary transition-colors">Phương pháp</a>
          <a href="#" className="hover:text-primary transition-colors">Tính năng</a>
          <a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section - 55/45 Split */}
        <section className="w-full max-w-[1440px] mx-auto px-8 md:px-20 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Content (55%) */}
          <div className="lg:w-[55%] space-y-10 text-center lg:text-left">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-text-main leading-[1.1] tracking-tight font-heading">
                Môi trường học tập <br />
                <span className="text-primary italic">tĩnh lặng</span> cho học sinh.
              </h1>
              <p className="text-lg md:text-xl text-text-muted font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Hệ thống AI hỗ trợ ghi chép, tóm tắt và hiển thị phụ đề trực quan, giúp bạn tập trung hoàn toàn vào nội dung bài học mà không lo bỏ lỡ lời giảng.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2 justify-center lg:justify-start">
              <button 
                onClick={handleStart}
                className="px-10 py-5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/10 hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-3 text-lg"
              >
                Bắt đầu học tập
              </button>
              <button className="px-6 py-5 text-text-main font-bold flex items-center gap-2 hover:translate-x-1 transition-all group">
                Xem cách hoạt động 
                <div className="w-8 h-px bg-text-main group-hover:w-12 transition-all" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-text-muted/60 justify-center lg:justify-start pt-4">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success" /> 200+ Sinh viên đang học</span>
              <div className="w-px h-4 bg-slate-200" />
              <span>Hỗ trợ AI thời gian thực</span>
            </div>
          </div>

          {/* Right Content (45%) - Realistic Image + Overlay Card */}
          <div className="lg:w-[45%] relative group">
             {/* Realistic Hero Image */}
             <div className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 aspect-[4/5] lg:aspect-auto lg:h-[600px] w-full border-8 border-white">
                <Image 
                  src="/student_learning_quiet_classroom_1777566655650.png" 
                  alt="Student learning focused" 
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
             </div>

             {/* Functional UI Overlay Card */}
             <div className="absolute -bottom-6 -left-12 md:-left-20 bg-white/95 backdrop-blur-md p-6 rounded-[24px] shadow-2xl border border-white/50 max-w-[280px] animate-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <Zap size={20} fill="currentColor" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">AI Transcript</p>
                      <p className="text-sm font-bold text-text-main">Phụ đề theo nhịp giảng</p>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-primary" />
                   </div>
                   <p className="text-xs text-text-muted font-medium leading-relaxed italic">
                      "...thuật toán đang phân tích dữ liệu từ bài giảng để tạo tóm tắt..."
                   </p>
                </div>
             </div>

             {/* Floating Summary Card */}
             <div className="absolute top-12 -right-8 bg-accent text-white p-5 rounded-[24px] shadow-2xl max-w-[200px] animate-in fade-in zoom-in duration-1000 delay-300">
                <div className="flex items-center gap-2 mb-3">
                   <Sparkles size={16} fill="currentColor" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Tóm tắt bài học</span>
                </div>
                <div className="space-y-2">
                   <div className="h-1.5 w-full bg-white/20 rounded-full" />
                   <div className="h-1.5 w-4/5 bg-white/20 rounded-full" />
                   <div className="h-1.5 w-3/4 bg-white/20 rounded-full" />
                </div>
             </div>
          </div>
        </section>

        {/* Secondary Section - Documentary Style Images */}
        <section className="w-full max-w-[1440px] mx-auto px-8 md:px-20 py-20 border-t border-slate-100">
          <div className="grid md:grid-cols-3 gap-12 items-end">
            <div className="space-y-6">
              <h3 className="text-3xl font-black font-heading leading-tight">Mọi chi tiết được <br /> thấu hiểu.</h3>
              <p className="text-text-muted font-medium text-sm leading-relaxed">
                Chúng tôi không chỉ cung cấp phụ đề, chúng tôi tạo ra sự kết nối giữa học sinh và kiến thức thông qua các thuật toán thông minh nhất.
              </p>
            </div>
            
            <div className="col-span-2 grid grid-cols-2 gap-6">
               <div className="h-64 relative rounded-[24px] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                  <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Collaborative learning" fill className="object-cover" />
               </div>
               <div className="h-80 relative rounded-[24px] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 -mt-12">
                  <Image src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop" alt="Quiet study" fill className="object-cover" />
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-8 py-12 md:px-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-widest text-text-muted">
        <p>© 2025 UDL Hearing. All rights reserved.</p>
        <div className="flex gap-8">
           <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
           <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
