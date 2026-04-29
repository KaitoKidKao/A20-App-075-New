'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Film,
  Info,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';
import { ProgressStepper, type Step } from '@/components/ui/ProgressStepper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useParams, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = 'http://localhost:8000';

// Map BE status → step index and progress
function mapStatusToUI(status: string) {
  if (status === 'queued') return { stepIndex: 0, progress: 10, label: 'Đang chờ trong hàng đợi...' };
  if (status === 'extracting_audio') return { stepIndex: 1, progress: 30, label: 'Đang trích xuất âm thanh...' };
  if (status === 'transcribing') return { stepIndex: 2, progress: 60, label: 'Đang phiên âm giọng nói...' };
  if (status === 'completed') return { stepIndex: 5, progress: 100, label: 'Hoàn tất!' };
  if (status?.startsWith('failed')) return { stepIndex: -1, progress: 0, label: status };
  return { stepIndex: 0, progress: 5, label: 'Đang khởi tạo...' };
}

export default function VideoProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  
  const [progress, setProgress] = useState(5);
  const [currentStatus, setCurrentStatus] = useState('queued');
  const [isFailed, setIsFailed] = useState(false);
  const [failMessage, setFailMessage] = useState('');

  const initialSteps: Step[] = [
    { id: '1', name: 'File đã nhận', status: 'pending' },
    { id: '2', name: 'Trích xuất Audio (FFmpeg)', status: 'pending' },
    { id: '3', name: 'Phiên âm giọng nói (Whisper)', status: 'pending' },
    { id: '4', name: 'Tạo Caption + Transcript', status: 'pending' },
    { id: '5', name: 'Hoàn tất xử lý', status: 'pending' },
  ];

  const [steps, setSteps] = useState<Step[]>(initialSteps);

  const updateSteps = useCallback((stepIndex: number) => {
    setSteps(prev => prev.map((s, i) => {
      if (i < stepIndex) return { ...s, status: 'completed' as const, subText: undefined };
      if (i === stepIndex) return { ...s, status: 'loading' as const, subText: 'Đang xử lý...' };
      return { ...s, status: 'pending' as const, subText: undefined };
    }));
  }, []);

  const completeAllSteps = useCallback(() => {
    setSteps(prev => prev.map(s => ({ ...s, status: 'completed' as const, subText: undefined })));
  }, []);

  // Polling: Ask BE for status every 3 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let cancelled = false;

    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/videos/${videoId}/status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (cancelled) return;

        const status = data.status;
        setCurrentStatus(status);

        const ui = mapStatusToUI(status);

        if (status === 'completed') {
          setProgress(100);
          completeAllSteps();
          return; // Stop polling
        }

        if (status?.startsWith('failed')) {
          setIsFailed(true);
          setFailMessage(status.replace('failed: ', ''));
          return; // Stop polling
        }

        setProgress(ui.progress);
        updateSteps(ui.stepIndex);

        // Continue polling
        timeoutId = setTimeout(pollStatus, 3000);
      } catch (err) {
        console.error('Polling error:', err);
        if (!cancelled) {
          timeoutId = setTimeout(pollStatus, 5000); // Retry slower on error
        }
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [videoId, updateSteps, completeAllSteps]);

  const isComplete = progress === 100 && currentStatus === 'completed';

  return (
    <div className="max-w-[720px] mx-auto py-12 animate-in fade-in duration-500">
      <button 
        onClick={() => router.push('/student/upload')}
        className="flex items-center gap-2 text-sm text-neutral hover:text-primary mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Quay lại Upload</span>
      </button>

      <div className="bg-card rounded-3xl border shadow-card overflow-hidden">
        {/* Header Banner */}
        <div className={cn(
          "p-8 transition-colors duration-500",
          isComplete ? "bg-green-50" : isFailed ? "bg-red-50" : "bg-primary-soft/30"
        )}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-20 h-14 bg-slate-200 rounded-xl overflow-hidden border shrink-0 relative">
                 <Film size={24} className="absolute inset-0 m-auto text-slate-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1">Video Processing</h1>
                <div className="flex items-center gap-2">
                  <StatusBadge status={isComplete ? "ready" : isFailed ? "error" : "processing"} />
                  <span className="text-xs text-neutral font-mono">{videoId.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Error Banner */}
          {isFailed && (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-sm">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Pipeline thất bại</p>
                <p className="font-medium opacity-80">{failMessage}</p>
                <p className="mt-2 text-xs opacity-60">Hãy kiểm tra Backend log để biết chi tiết. Thường gặp nhất: thiếu FFmpeg hoặc lỗi file video.</p>
              </div>
            </div>
          )}

          {/* Main Progress Bar */}
          {!isFailed && (
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
                {isComplete ? 'Hoàn tất!' : `Trạng thái: ${mapStatusToUI(currentStatus).label}`}
              </p>
            </div>
          )}

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
                    onClick={() => router.push(`/student/videos/${videoId}`)}
                    className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
                  >
                    Xem kết quả
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => router.push('/student/library')}
                    className="px-8 py-4 bg-card border font-bold rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Về thư viện
                  </button>
                </div>
              </div>
            ) : isFailed ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/student/upload')}
                  className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Thử upload lại
                </button>
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
