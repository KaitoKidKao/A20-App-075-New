'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';
import { 
  GraduationCap, 
  ArrowRight,
  Accessibility,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { setRole } = useAppStore();

  const handleStart = () => {
    setRole('teacher'); // This is our main "Học sinh" role with advanced features
    router.push('/student/library');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text selection:bg-accent/10 selection:text-accent">
      {/* Quiet Header */}
      <header className="px-8 py-8 md:px-12">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <Accessibility size={28} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">UDL Hearing</span>
        </div>
      </header>

      {/* Focused Entry Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 -mt-16">
        <div className="max-w-3xl w-full text-center space-y-12">
          
          {/* Calm Hero Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
              Học tập trung hơn. <br/> Hiểu bài rõ ràng hơn.
            </h1>
            <p className="text-xl md:text-2xl text-neutral max-w-2xl mx-auto font-medium leading-relaxed">
              Công cụ hỗ trợ đọc bài giảng và chuyển đổi học liệu chuyên sâu cho học sinh.
            </p>
          </div>

          {/* Single Intentional Entry Point */}
          <div className="flex flex-col items-center space-y-8">
            <button
              onClick={handleStart}
              className="group flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-elevated hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              <span>Bắt đầu học tập ngay</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
            </button>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-neutral font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-accent" />
                <span>Phụ đề AI chính xác</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-accent" />
                <span>Tóm tắt bài giảng tự động</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-accent" />
                <span>Giao diện đọc tối ưu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Support Info */}
        <section className="mt-24 w-full max-w-4xl grid md:grid-cols-2 gap-12 border-t border-border pt-16">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Dành cho việc học trên lớp</h2>
            <p className="text-neutral">
              Tải lên video bài giảng để nhận ngay bản ghi văn bản (transcript) và tóm tắt theo từng ý chính. Giúp bạn không bỏ lỡ bất kỳ thông tin quan trọng nào từ giáo viên.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Môi trường đọc yên tĩnh</h2>
            <p className="text-neutral">
              Giao diện được thiết kế để giảm tải áp lực tâm lý. Mọi thứ tập trung vào việc đọc và hiểu, với phông chữ rõ ràng và bố cục không gây xao nhãng.
            </p>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="py-12 px-8 text-center text-sm text-neutral/60 font-medium">
        <span>© 2026 UDL Learning Tool · Designed for Accessibility</span>
      </footer>
    </div>
  );
}
