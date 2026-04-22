'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';
import { 
  GraduationCap, 
  Presentation, 
  Settings, 
  Video, 
  Radio, 
  Accessibility 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function LandingPage() {
  const router = useRouter();
  const { setRole } = useAppStore();

  const handleRoleSelect = (role: 'teacher' | 'student' | 'admin', path: string) => {
    setRole(role);
    router.push(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text selection:bg-primary-soft selection:text-primary">
      {/* Header section (Simple, for landing) */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Accessibility size={28} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">UDL Nền tảng Hỗ trợ</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-12 md:py-20 max-w-[1100px] mx-auto w-full">
        
        {/* Hero Section */}
        <div className="text-center w-full mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-soft text-primary font-semibold rounded-full text-sm">
            <span>AI20K-200 · Universal Design for Learning</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-4xl mx-auto tracking-normal">
            Hỗ trợ học sinh khiếm thính <br className="hidden md:block"/> theo kịp bài giảng
          </h1>
          <p className="text-xl text-neutral max-w-2xl mx-auto leading-relaxed">
            Tự động tạo caption, transcript và tóm tắt bài giảng — realtime và từ video — cho mọi lớp học hòa nhập.
          </p>
        </div>

        {/* Action Call to Role (Moved up slightly to highlight Student first for accessibility) */}
        <section className="w-full mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">Bạn là ai?</h2>
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {/* Student Card - Highly emphasized for accessibility */}
            <button
              onClick={() => handleRoleSelect('student', '/student/library')}
              className={cx(
                "group relative flex flex-col p-8 bg-card rounded-2xl border-2 border-primary shadow-elevated focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-4 overflow-hidden text-left transition-transform hover:-translate-y-1"
              )}
              aria-label="Chọn vai trò: Học sinh khiếm thính"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <GraduationCap size={120} />
              </div>
              <div className="bg-primary text-white p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Học sinh khiếm thính</h3>
              <p className="text-neutral text-lg mb-6 leading-relaxed">
                Xem bài giảng có phụ đề lớn, tùy chỉnh độ tương phản, chữ lớn dễ dọc và tự động cuộn chữ.
              </p>
              <div className="mt-auto inline-flex items-center text-primary font-bold text-lg">
                Vào Demo Sinh viên <span className="ml-2">→</span>
              </div>
            </button>

            {/* Teacher Card */}
            <button
              onClick={() => handleRoleSelect('teacher', '/teacher/library')}
              className="group flex flex-col p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-elevated hover:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-4 text-left transition-all"
              aria-label="Chọn vai trò: Giáo viên / Cán bộ hỗ trợ"
            >
              <div className="bg-neutral/10 text-neutral p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary-soft group-hover:text-primary transition-colors">
                <Presentation size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Giáo viên / Cán bộ</h3>
              <p className="text-neutral mb-6">
                Tải lên video bài giảng để tạo phụ đề tự động hoặc bắt đầu lớp học LIVE có live-caption.
              </p>
              <div className="mt-auto inline-flex items-center text-neutral group-hover:text-primary font-medium transition-colors">
                Vào Demo Giáo viên <span className="ml-2">→</span>
              </div>
            </button>


          </div>
        </section>

        {/* How it works - MVP Features */}
        <section className="w-full">
          <h2 className="text-2xl font-bold text-center mb-10">Tính năng cốt lõi (MVP)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-bg border border-border rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Video className="text-primary" size={24} />
                <h3 className="text-lg font-semibold">Video Caption + Summary</h3>
              </div>
              <p className="text-neutral">
                Upload bài giảng → hệ thống AI xử lý ngay lập tức để nhận caption VTT, transcript đầy đủ và tóm tắt bullet points.
              </p>
            </div>
            
            <div className="p-6 bg-bg border border-border rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="text-success" size={24} />
                <h3 className="text-lg font-semibold">Live Class Transcription</h3>
              </div>
              <p className="text-neutral">
                Sử dụng micro giáo viên → caption realtime hiển thị với độ trễ &lt; 2 giây ngay trên thiết bị điện thoại, máy tính của học sinh.
              </p>
            </div>
            
            <div className="p-6 bg-bg border border-border rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Accessibility className="text-warning" size={24} />
                <h3 className="text-lg font-semibold">Cá nhân hóa tối đa</h3>
              </div>
              <p className="text-neutral">
                Cung cấp font cực lớn, tương phản cao, auto-scroll, dark mode — thiết kế thân thiện, dễ nhìn cho từng học sinh.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
