'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Film,
  Info,
  ChevronLeft
} from 'lucide-react';
import { ProgressStepper, type Step } from '@/components/ui/ProgressStepper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useParams, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function VideoProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // Start at ASR
  const [progress, setProgress] = useState(68);

  const initialSteps: Step[] = [
    { id: '1', name: 'File đã nhận', status: 'completed', duration: '0.3s' },
    { id: '2', name: 'Trích xuất Audio', status: 'completed', duration: '1.2s' },
    { id: '3', name: 'Phiên âm giọng nói (ASR)', status: 'loading', subText: 'Đang xử lý đoạn 7/12...' },
    { id: '4', name: 'Tạo Caption + Transcript', status: 'pending' },
    { id: '5', name: 'Tóm tắt bài giảng', status: 'pending' },
  ];

  const [steps, setSteps] = useState<Step[]>(initialSteps);

  useEffect(() => {
    // Simulated progress increments
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeProcessing();
          return 100;
        }
        return prev + 2;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const completeProcessing = () => {
    setSteps(prev => prev.map(s => ({ ...s, status: 'completed' as const })));
    setCurrentStepIndex(5);
  };

  const isComplete = progress === 100;

  return (
    <div className="max-w-[720px] mx-auto py-12 animate-in fade-in duration-500">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-neutral hover:text-primary mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Quay lại thư viện</span>
      </button>

      <div className="bg-card rounded-3xl border shadow-card overflow-hidden">
        {/* Header Banner */}
        <div className={cn(
          "p-8 transition-colors duration-500",
          isComplete ? "bg-green-50" : "bg-primary-soft/30"
        )}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-20 h-14 bg-slate-200 rounded-xl overflow-hidden border shrink-0 relative">
                 <Film size={24} className="absolute inset-0 m-auto text-slate-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1">Đạo hàm và vi phân</h1>
                <div className="flex items-center gap-2">
                  <StatusBadge status={isComplete ? "ready" : "processing"} />
                  <span className="text-xs text-neutral">45:20 • 124MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Main Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-text">Tiến độ tổng thể</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out shadow-sm" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <p className="text-xs text-neutral flex items-center gap-2">
              <Clock size={12} />
              Dự kiến hoàn thành trong: ~{isComplete ? '0' : '2'} phút
            </p>
          </div>

          {/* Stepper Area */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-neutral">AI Pipeline Status</h3>
            <ProgressStepper steps={steps} />
          </div>

          {/* Action Area */}
          <div className="pt-6 border-t border-dashed">
            {isComplete ? (
              <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm">
                  <CheckCircle2 size={20} />
                  <p className="font-semibold">Xử lý hoàn tất! Bài giảng của bạn đã sẵn sàng với phụ đề và tóm tắt.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push(`/videos/demo-vid-123`)}
                    className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
                  >
                    Xem kết quả
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => router.push('/teacher/library')}
                    className="px-8 py-4 bg-card border font-bold rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Về thư viện
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border text-sm text-neutral flex items-start gap-3">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>Bạn có thể rời trang này. Hệ thống sẽ tiếp tục xử lý và gửi thông báo khi hoàn tất.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
