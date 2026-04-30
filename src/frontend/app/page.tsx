'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Clock, 
  Zap, 
  ArrowRight,
  Play,
  Heart
} from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main text-text-main font-sans selection:bg-primary/20">
      {/* Editorial Header */}
      <header className="px-8 py-12 md:px-20 flex items-center justify-between max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
             <Heart size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-main font-heading">UDL Hearing</span>
        </div>
        <nav className="hidden md:flex items-center gap-12 text-[14px] font-medium text-text-muted">
          <a href="#" className="hover:text-text-main transition-colors">Phương pháp</a>
          <a href="#" className="hover:text-text-main transition-colors">Tính năng</a>
          <a href="#" className="hover:text-text-main transition-colors">Về chúng tôi</a>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section - Warm Editorial Split */}
        <section className="w-full max-w-[1440px] mx-auto px-8 md:px-20 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-20">
          
          {/* Left Content (60%) */}
          <div className="lg:w-[60%] space-y-12">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-[80px] font-black text-text-main leading-[1.05] tracking-tight font-heading">
                Không gian học tập <br />
                <span className="text-primary italic">nhân văn</span> cho bạn.
              </h1>
              <p className="text-lg md:text-2xl text-text-muted font-medium leading-relaxed max-w-2xl">
                Chúng tôi thấu hiểu khó khăn của bạn. Bằng sự kết hợp giữa công nghệ AI và thiết kế bao trùm, UDL Hearing mang đến trải nghiệm học tập yên tĩnh, tập trung và trọn vẹn nhất.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
              <button 
                onClick={handleStart}
                className="px-12 py-6 bg-primary text-white font-semibold rounded-2xl shadow-xl shadow-primary/10 hover:bg-primary-hover transition-all active:scale-[0.98] text-lg"
              >
                Bắt đầu hành trình
              </button>
              <button className="px-2 py-4 text-text-main font-bold flex items-center gap-3 hover:gap-5 transition-all group border-b-2 border-transparent hover:border-primary/20">
                Tìm hiểu thêm 
                <ArrowRight size={20} className="text-primary" />
              </button>
            </div>

            <div className="flex items-center gap-6 text-[13px] font-bold uppercase tracking-widest text-text-muted/50 pt-8">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-bg-main bg-slate-200 overflow-hidden">
                       <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" width={40} height={40} />
                    </div>
                  ))}
               </div>
               <span>Đã có +500 sinh viên tin dùng</span>
            </div>
          </div>

          {/* Right Content (40%) - Warm Photo + Subtle UI */}
          <div className="lg:w-[40%] relative">
             {/* Realistic Hero Image */}
             <div className="relative rounded-[40px] overflow-hidden shadow-premium aspect-[4/5] w-full border-[12px] border-white bg-white">
                <Image 
                  src="/student_learning_quiet_classroom_1777566655650.png" 
                  alt="Inclusive learning environment" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
             </div>

             {/* Minimalist UI Card 1 */}
             <div className="absolute -bottom-8 -left-16 bg-white p-6 rounded-[32px] shadow-premium border border-slate-50 max-w-[260px] animate-in slide-in-from-bottom-12 duration-1000">
                <div className="flex items-center gap-4 mb-5">
                   <div className="w-12 h-12 bg-bg-main text-primary rounded-2xl flex items-center justify-center">
                      <Zap size={24} fill="currentColor" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Real-time</p>
                      <p className="text-sm font-bold text-text-main">Phụ đề nhịp nhàng</p>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                   <div className="h-1.5 w-2/3 bg-primary/30 rounded-full" />
                </div>
             </div>

             {/* Minimalist UI Card 2 */}
             <div className="absolute top-16 -right-12 bg-white p-5 rounded-[28px] shadow-premium border border-slate-50 max-w-[180px] animate-in fade-in zoom-in duration-1000 delay-500">
                <div className="flex items-center gap-3 mb-4">
                   <Sparkles size={18} className="text-primary" />
                   <span className="text-[11px] font-bold uppercase tracking-widest">Tóm lược AI</span>
                </div>
                <div className="space-y-3">
                   <div className="h-2 w-full bg-slate-50 rounded-full" />
                   <div className="h-2 w-full bg-slate-50 rounded-full" />
                </div>
             </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="w-full max-w-[1440px] mx-auto px-8 md:px-20 py-32">
          <div className="flex flex-col md:flex-row gap-24 items-center">
             <div className="md:w-1/2 relative h-[500px] w-full rounded-[48px] overflow-hidden shadow-premium">
                <Image src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" alt="Technology for good" fill className="object-cover" />
                <div className="absolute inset-0 bg-accent/10 mix-blend-overlay" />
             </div>
             <div className="md:w-1/2 space-y-10">
                <span className="text-primary font-black uppercase tracking-[0.2em] text-xs">Triết lý của chúng tôi</span>
                <h2 className="text-4xl md:text-6xl font-bold font-heading leading-tight">Thiết kế cho tất cả mọi người.</h2>
                <p className="text-lg text-text-muted leading-relaxed font-medium">
                   Chúng tôi tin rằng rào cản ngôn ngữ và âm thanh không nên là vật cản trên con đường học tập. UDL Hearing được xây dựng để mang lại sự công bằng và cảm hứng cho mọi học sinh, bất kể điểm xuất phát.
                </p>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <h4 className="text-2xl font-bold font-heading mb-2">98%</h4>
                      <p className="text-sm text-text-muted font-medium">Độ chính xác của phụ đề AI</p>
                   </div>
                   <div>
                      <h4 className="text-2xl font-bold font-heading mb-2">120+</h4>
                      <p className="text-sm text-text-muted font-medium">Trường học đang tích hợp</p>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="px-8 py-16 md:px-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 opacity-50">
           <Heart size={16} fill="currentColor" />
           <span className="text-sm font-bold font-heading uppercase tracking-widest">UDL Hearing</span>
        </div>
        <div className="flex gap-12 text-[12px] font-bold uppercase tracking-widest text-text-muted">
           <a href="#" className="hover:text-primary transition-colors">Hướng dẫn</a>
           <a href="#" className="hover:text-primary transition-colors">Bảo mật</a>
           <a href="#" className="hover:text-primary transition-colors">Liên hệ</a>
        </div>
        <p className="text-[11px] font-medium text-text-muted/60 tracking-wider">© 2025 UDL Hearing. Chân thành từ tâm.</p>
      </footer>
    </div>
  );
}
