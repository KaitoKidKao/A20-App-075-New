'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Film,
  Info,
  ChevronLeft,
  AlertTriangle,
  Zap,
  Music,
  FileText,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = 'http://localhost:8000';

function mapStatusToUI(status: string) {
  if (status === 'queued') return { step: 1, progress: 10, label: 'Đang xếp hàng chờ xử lý...' };
  if (status === 'extracting_audio') return { step: 2, progress: 35, label: 'Đang trích xuất dải âm thanh...' };
  if (status === 'transcribing') return { step: 3, progress: 70, label: 'AI đang phân tích và phiên âm...' };
  if (status === 'completed') return { step: 4, progress: 100, label: 'Hoàn tất! Video đã sẵn sàng.' };
  if (status?.startsWith('failed')) return { step: -1, progress: 0, label: status };
  return { step: 0, progress: 5, label: 'Đang khởi tạo hệ thống...' };
}

export default function VideoProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  
  const [progress, setProgress] = useState(5);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('queued');
  const [isFailed, setIsFailed] = useState(false);
  const [failMessage, setFailMessage] = useState('');

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
          setCurrentStep(4);
          return;
        }

        if (status?.startsWith('failed')) {
          setIsFailed(true);
          setFailMessage(status.replace('failed: ', ''));
          return;
        }

        setProgress(ui.progress);
        setCurrentStep(ui.step);

        timeoutId = setTimeout(pollStatus, 3000);
      } catch (err) {
        if (!cancelled) timeoutId = setTimeout(pollStatus, 5000);
      }
    };

    pollStatus();
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [videoId]);

  const isComplete = progress === 100 && currentStatus === 'completed';

  const pipelineSteps = [
    { id: 1, icon: Film, title: 'Chuẩn bị File', desc: 'Kiểm tra và tối ưu hóa video.' },
    { id: 2, icon: Music, title: 'Tách Âm Thanh', desc: 'Trích xuất dải âm thanh chất lượng cao.' },
    { id: 3, icon: Zap, title: 'AI Whisper', desc: 'Nhận diện và chuyển đổi giọng nói.' },
    { id: 4, icon: FileText, title: 'Hoàn thiện', desc: 'Tạo phụ đề và tóm tắt thông minh.' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFE] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <button 
          onClick={() => router.push('/student/upload')}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#FF4F6E] transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Quay lại Upload</span>
        </button>

        <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
          
          {/* Header Area */}
          <div className="p-10 md:p-12 border-b border-slate-50 relative overflow-hidden">
             {/* Background glow */}
             <div className={cn(
               "absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -mr-[200px] -mt-[200px] opacity-20 transition-colors duration-1000",
               isComplete ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-[#FF4F6E]"
             )} />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-3">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Clock size={12} />
                      ID: {videoId.slice(0, 8)}
                   </div>
                   <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                     {isComplete ? 'Processing Complete!' : isFailed ? 'Processing Failed' : 'AI Processing in Progress'}
                   </h1>
                   <p className="text-sm font-bold text-slate-400 max-w-md">
                     {isComplete ? 'Hệ thống đã hoàn tất việc trích xuất và tối ưu hóa bài giảng của bạn.' 
                       : isFailed ? 'Đã xảy ra sự cố trong quá trình xử lý. Vui lòng kiểm tra lỗi.' 
                       : 'Hệ thống đang sử dụng AI để tạo phụ đề và tóm tắt bài giảng. Bạn có thể rời trang này nếu muốn.'}
                   </p>
                </div>

                <div className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center shrink-0 border-8 relative shadow-2xl",
                  isComplete ? "bg-emerald-50 text-emerald-500 border-emerald-100" 
                    : isFailed ? "bg-red-50 text-red-500 border-red-100" 
                    : "bg-white text-[#FF4F6E] border-slate-50"
                )}>
                   {isComplete ? <CheckCircle2 size={48} /> 
                     : isFailed ? <AlertTriangle size={48} /> 
                     : <Loader2 size={48} className="animate-spin" />}
                   
                   {/* Progress Ring Overlay */}
                   {!isComplete && !isFailed && (
                     <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} className="text-[#FF4F6E] transition-all duration-1000 ease-out" />
                     </svg>
                   )}
                </div>
             </div>
          </div>

          <div className="p-10 md:p-12 space-y-12">
            
            {/* Visual Pipeline Steps */}
            {!isFailed && (
              <div className="relative">
                 <div className="absolute top-8 left-0 w-full h-1 bg-slate-100 rounded-full" />
                 <div 
                   className="absolute top-8 left-0 h-1 bg-[#FF4F6E] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_#FF4F6E]"
                   style={{ width: `${progress}%` }}
                 />
                 
                 <div className="grid grid-cols-4 gap-4 relative z-10">
                    {pipelineSteps.map((step) => {
                       const isPast = currentStep >= step.id;
                       const isActive = currentStep === step.id;
                       const Icon = step.icon;
                       
                       return (
                         <div key={step.id} className="flex flex-col items-center text-center group">
                            <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                              isPast ? "bg-[#FF4F6E] text-white shadow-lg shadow-[#FF4F6E]/30 scale-110" : "bg-white border-2 border-slate-100 text-slate-300"
                            )}>
                               <Icon size={24} className={isActive ? "animate-pulse" : ""} />
                            </div>
                            <h3 className={cn("text-xs font-black uppercase tracking-widest mb-1", isPast ? "text-slate-900" : "text-slate-400")}>{step.title}</h3>
                            <p className="text-[10px] font-bold text-slate-400 hidden md:block max-w-[120px]">{step.desc}</p>
                         </div>
                       );
                    })}
                 </div>
              </div>
            )}

            {/* Status Message / Error Area */}
            {isFailed ? (
              <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center space-y-4">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-red-500 shadow-sm mb-6">
                    <AlertTriangle size={24} />
                 </div>
                 <h3 className="text-xl font-black text-red-600">Đã xảy ra lỗi kỹ thuật</h3>
                 <p className="text-red-500/80 font-bold text-sm max-w-md mx-auto">{failMessage}</p>
                 <p className="text-[11px] font-black uppercase tracking-widest text-red-400 pt-4">Gợi ý: Kiểm tra lại cài đặt FFmpeg trên máy chủ hoặc định dạng video.</p>
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="flex items-center justify-center gap-3">
                    {isComplete ? <Sparkles size={20} className="text-emerald-500" /> : <Activity size={20} className="text-[#FF4F6E] animate-pulse" />}
                    <span className="text-sm font-black text-slate-600">{mapStatusToUI(currentStatus).label}</span>
                 </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               {isComplete ? (
                 <>
                   <button 
                     onClick={() => router.push(`/student/videos/${videoId}`)}
                     className="flex-1 py-5 bg-[#FF4F6E] text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                   >
                     Vào học ngay <ArrowRight size={18} />
                   </button>
                   <button 
                     onClick={() => router.push('/student/documents')}
                     className="px-8 py-5 bg-white text-slate-900 border border-slate-200 rounded-[20px] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                   >
                     Về Khoá Học
                   </button>
                 </>
               ) : isFailed ? (
                 <button 
                   onClick={() => router.push('/student/upload')}
                   className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                 >
                   Quay lại trang Upload
                 </button>
               ) : (
                 <div className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Info size={14} /> Bạn có thể tắt trình duyệt, tiến trình vẫn tiếp tục ở backend.
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
