'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Eye,
  MessageSquare,
  CheckCircle2,
  Play
} from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    nodes.forEach((node, idx) => {
      const delay = node.dataset.delay ?? `${idx * 80}`;
      node.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const handleStart = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDFE] text-slate-900 font-sans selection:bg-[#FF4F6E]/20 overflow-x-hidden">
      
      {/* Dynamic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8 md:px-20 py-6 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent'}`}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF4F6E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4F6E]/20">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
               </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Dreams</span>
          </div>
          <div className="hidden md:flex items-center gap-12 text-[13px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#features" className="hover:text-[#FF4F6E] transition-colors">Tính năng</a>
            <a href="#mission" className="hover:text-[#FF4F6E] transition-colors">Sứ mệnh</a>
            <button 
              onClick={handleStart}
              className="px-8 py-3 bg-[#FF4F6E] text-white rounded-xl hover:bg-[#e64663] transition-all shadow-lg shadow-[#FF4F6E]/20 font-black uppercase tracking-widest text-[12px]"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full max-w-[1440px] mx-auto px-8 md:px-20 pt-40 pb-24 flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#FF4F6E]/5 rounded-full blur-[120px] -z-10" />

          {/* Left Content */}
          <div data-reveal data-delay="0" className="scroll-reveal lg:w-[55%] space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">

            <div className="space-y-8">
              <h1 className="text-5xl md:text-[72px] font-black text-slate-900 leading-[1.1] tracking-tight max-w-4xl">
                Lắng nghe bằng <span className="text-[#FF4F6E] italic inline-block no-underline">đôi mắt</span>, học tập từ trái tim.
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                Xóa bỏ rào cản giao tiếp cho người khiếm thính. Dreams chuyển hóa mọi bài giảng thành trải nghiệm trực quan sống động và dễ tiếp cận nhất.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto px-12 py-6 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-2xl shadow-[#FF4F6E]/30 hover:bg-[#e64663] transition-all hover:scale-105 active:scale-[0.98] text-lg"
              >
                Khám phá Dreams ngay
              </button>
              <button className="flex items-center gap-4 text-slate-900 font-black hover:text-[#FF4F6E] transition-colors group">
                 <div className="w-14 h-14 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-[#FF4F6E] transition-all">
                    <Play size={20} fill="currentColor" />
                 </div>
                 Xem câu chuyện
              </button>
            </div>
          </div>

          {/* Right Hero Image */}
          <div data-reveal data-delay="120" className="scroll-reveal lg:w-[45%] relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
             <div className="relative z-10 rounded-[60px] overflow-hidden shadow-2xl border-[16px] border-white bg-white aspect-square">
                <Image 
                  src="/assets/images/hero-final-v2.png" 
                  alt="Học viên Dreams" 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-contain p-4"
                />
             </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-32 bg-slate-50/50">
          <div className="max-w-[1440px] mx-auto px-8 md:px-20">
             <div data-reveal data-delay="0" className="scroll-reveal text-center max-w-3xl mx-auto mb-24 space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">Công nghệ đột phá cho <span className="text-[#FF4F6E]">Giáo dục hòa nhập</span></h2>
                <p className="text-lg text-slate-500 font-medium">Giải pháp tối ưu được thiết kế riêng cho nhu cầu của người học khiếm thính.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div data-reveal data-delay="0" className="scroll-reveal bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-white hover:border-[#FF4F6E]/10 group">
                   <div className="w-16 h-16 bg-[#FF4F6E]/5 text-[#FF4F6E] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Eye size={32} />
                   </div>
                   <h3 className="text-2xl font-black mb-4">Phụ đề Trực quan</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">
                      Tự động chuyển đổi âm thanh thành phụ đề thời gian thực sắc nét, truyền tải trọn vẹn tông điệu và cảm xúc.
                   </p>
                </div>

                <div data-reveal data-delay="140" className="scroll-reveal bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-white hover:border-[#FF4F6E]/10 group">
                   <div className="w-16 h-16 bg-[#FF4F6E]/5 text-[#FF4F6E] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Zap size={32} fill="currentColor" />
                   </div>
                   <h3 className="text-2xl font-black mb-4">Tóm lược AI</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">
                      Công nghệ AI tự động ghi chú và tóm tắt nội dung trọng tâm, giúp bạn nắm bắt kiến thức cốt lõi ngay tức thì.
                   </p>
                </div>

                <div data-reveal data-delay="280" className="scroll-reveal bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-white hover:border-[#FF4F6E]/10 group">
                   <div className="w-16 h-16 bg-[#FF4F6E]/5 text-[#FF4F6E] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <MessageSquare size={32} />
                   </div>
                   <h3 className="text-2xl font-black mb-4">Kết nối Đa chiều</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">
                      Tương tác không giới hạn với giảng viên và bạn học thông qua các công cụ phản hồi trực quan sinh động.
                   </p>
                </div>
             </div>
          </div>
        </section>

        {/* MISSION SECTION */}
        <section id="mission" className="py-32">
          <div className="max-w-[1440px] mx-auto px-8 md:px-20">
             <div className="flex flex-col lg:flex-row items-center gap-24">
                <div data-reveal data-delay="0" className="scroll-reveal lg:w-1/2 relative">
                   <div className="rounded-[60px] overflow-hidden shadow-2xl aspect-square relative">
                      <Image 
                        src="/assets/images/mission-final-v2.png" 
                        alt="Sứ mệnh Dreams" 
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-4"
                      />
                   </div>
                </div>
                <div data-reveal data-delay="140" className="scroll-reveal lg:w-1/2 space-y-10">
                   <span className="text-[#FF4F6E] font-black uppercase tracking-[0.3em] text-xs">Giá trị cốt lõi</span>
                                       <h2 className="text-3xl md:text-5xl font-black leading-tight max-w-xl">Bình đẳng giáo dục là <span className="text-[#FF4F6E]">Nền tảng</span> bền vững.</h2>

                   <p className="text-xl text-slate-500 font-medium leading-relaxed">
                      Chúng tôi tin rằng tri thức là dành cho tất cả mọi người. Dreams sinh ra để xóa nhòa những bức tường vô hình trong môi trường sư phạm truyền thống.
                   </p>
                   <ul className="space-y-6">
                      {[
                        "Phụ đề thời gian thực tích hợp nhận diện cảm xúc",
                        "Tóm tắt video bài giảng thông minh bằng AI",
                        "Môi trường học tập tương tác trực quan 360°",
                        "Lộ trình học tập cá nhân hóa cho từng học viên"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 font-bold text-slate-700">
                           <div className="w-6 h-6 bg-[#FF4F6E]/10 text-[#FF4F6E] rounded-full flex items-center justify-center">
                              <CheckCircle2 size={14} strokeWidth={3} />
                           </div>
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 bg-[#1A1A1A] text-white relative overflow-hidden">
           <div className="max-w-[1440px] mx-auto px-8 md:px-20 relative z-10 flex flex-col lg:flex-row items-center gap-20">
              <div data-reveal data-delay="0" className="scroll-reveal lg:w-1/2 space-y-10">
                 <h2 className="text-4xl md:text-6xl font-black leading-tight max-w-2xl">Chinh phục ước mơ cùng <span className="text-[#FF4F6E]">Dreams</span></h2>
                 <p className="text-xl text-slate-400 font-medium">Gia nhập cộng đồng học tập không rào cản, nơi mọi thanh âm đều được thấu hiểu bằng đôi mắt.</p>
                 <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={handleStart}
                      className="px-12 py-6 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-2xl hover:bg-[#e64663] transition-all hover:scale-105 active:scale-[0.98] text-lg"
                    >
                      Bắt đầu Miễn phí
                    </button>
                    <button className="px-10 py-6 border-2 border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                       Liên hệ Nhà trường
                    </button>
                 </div>
              </div>
              <div data-reveal data-delay="160" className="scroll-reveal lg:w-1/2">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-[#FF4F6E] rounded-[60px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Image 
                      src="/assets/images/community-img.png" 
                      alt="Student Community" 
                      width={600} 
                      height={600} 
                      className="relative z-10 object-contain drop-shadow-2xl"
                    />
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="px-8 py-20 md:px-20 bg-white border-t border-slate-50">
         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-[#FF4F6E] rounded-lg flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                     <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                     <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
               </div>
               <span className="text-xl font-black text-slate-900">Dreams</span>
            </div>
            <div className="flex gap-12 text-[11px] font-black uppercase tracking-widest text-slate-400">
               <a href="#" className="hover:text-[#FF4F6E] transition-colors">Cách hoạt động</a>
               <a href="#" className="hover:text-[#FF4F6E] transition-colors">Quyền riêng tư</a>
               <a href="#" className="hover:text-[#FF4F6E] transition-colors">Liên hệ</a>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Dreams. Được xây dựng vì sự hòa nhập.</p>
         </div>
      </footer>
    </div>
  );
}
