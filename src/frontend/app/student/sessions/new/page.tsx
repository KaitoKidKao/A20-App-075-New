'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  Mic, 
  Monitor, 
  QrCode, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MicLevelVisualizer } from '@/components/ui/MicLevelVisualizer';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NewSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    name: 'Toán lớp 10A — 22/04',
    subject: 'Toán',
    group: '10A',
  });

  const handleStart = () => {
    router.push('/student/sessions/demo-live-123/live');
  };

  return (
    <div className="max-w-[720px] mx-auto py-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-soft text-primary rounded-2xl flex items-center justify-center">
          <Radio size={24} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Bắt đầu phiên học LIVE</h1>
          <p className="text-neutral">Chuẩn bị phòng học và thiết bị âm thanh cho sinh viên.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Info */}
        <div className={cn(
          "bg-card p-8 rounded-3xl border shadow-sm transition-all",
          step > 1 ? "opacity-60 scale-98" : "border-primary/20 ring-4 ring-primary/5"
        )}>
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
               <h2 className="text-xl font-bold">Thông tin phiên học</h2>
             </div>
             {step > 1 && <CheckCircle2 className="text-green-500" />}
           </div>

           <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral uppercase tracking-widest pl-1">Tên phiên học *</label>
                <input 
                  type="text" 
                  value={sessionData.name}
                  onChange={e => setSessionData({...sessionData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral uppercase tracking-widest pl-1">Môn học</label>
                <select className="w-full px-4 py-3 rounded-xl border border-border focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all appearance-none bg-white">
                  <option>Toán</option>
                  <option>Lý</option>
                  <option>Hóa</option>
                </select>
              </div>
           </div>
           
           {step === 1 && (
             <button 
               onClick={() => setStep(2)}
               className="mt-8 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
             >
               Tiếp tục
               <ChevronRight size={18} />
             </button>
           )}
        </div>

        {/* Step 2: Mic Check */}
        <div className={cn(
          "bg-card p-8 rounded-3xl border shadow-sm transition-all",
          step === 2 ? "border-primary/20 ring-4 ring-primary/5" : step < 2 ? "opacity-40 grayscale" : "opacity-60"
        )}>
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
               <h2 className="text-xl font-bold">Kiểm tra Micro</h2>
             </div>
             {step > 2 && <CheckCircle2 className="text-green-500" />}
           </div>

           {step >= 2 && (
             <div className="space-y-6">
               <div className="p-6 bg-slate-50 border rounded-2xl">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Mic size={18} className="text-primary" />
                      <span>Input Level</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase">Đang hoạt động</span>
                 </div>
                 <MicLevelVisualizer isActive={step === 2} className="h-16" />
                 <p className="mt-4 text-xs text-neutral">
                    Vui lòng nói thử vài câu để đảm bảo micro đang thu âm tốt. Phụ đề sẽ được tạo từ nguồn âm thanh này.
                 </p>
               </div>
               
               {step === 2 && (
                 <button 
                  onClick={() => setStep(3)}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Cấu hình xong Mic
                  <ChevronRight size={18} />
                </button>
               )}
             </div>
           )}
        </div>

        {/* Step 3: Setup targets */}
        <div className={cn(
          "bg-card p-8 rounded-3xl border shadow-sm transition-all",
          step === 3 ? "border-primary/20 ring-4 ring-primary/5" : "opacity-40 grayscale"
        )}>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
             <h2 className="text-xl font-bold">Hiển thị & Kết nối</h2>
           </div>

           {step === 3 && (
             <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="grid gap-4">
                   <div className="p-4 rounded-2xl border-2 border-primary bg-primary-soft/30 flex items-center gap-4">
                      <div className="bg-primary text-white p-3 rounded-xl">
                        <Monitor size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">Màn hình sinh viên</p>
                        <p className="text-xs text-neutral">Caption sẽ hiển thị trên web/điện thoại của học sinh.</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                        <CheckCircle2 size={16} />
                      </div>
                   </div>

                   <div className="p-6 bg-slate-50 border rounded-2xl flex flex-col items-center gap-4 text-center">
                      <div className="bg-white p-3 rounded-2xl border flex items-center justify-center">
                        <QrCode size={120} className="text-slate-900" />
                      </div>
                      <p className="text-sm font-medium">Học sinh quét mã để tham gia nhận caption</p>
                   </div>
                </div>

                <div className="pt-6 border-t font-medium text-sm text-neutral flex gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  Khi bắt đầu, toàn bộ âm thanh sẽ được mã hóa và truyền tải dưới dạng văn bản tức thì.
                </div>

                <button 
                  onClick={handleStart}
                  className="w-full py-6 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Radio size={24} className="animate-pulse" />
                  BẮT ĐẦU PHIÊN HỌC NGAY
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
