'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Pause,
  Play,
  Bookmark,
  Settings,
  Activity,
  Clock
} from 'lucide-react';
import { CaptionDisplay } from '@/components/ui/CaptionDisplay';
import { MicLevelVisualizer } from '@/components/ui/MicLevelVisualizer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TeacherLiveSessionPage() {
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [studentCount] = useState(24);
  const [partialText, setPartialText] = useState('Hôm nay chúng ta sẽ ôn lại phần đạo hàm');
  const [finalLines, setFinalLines] = useState([
    'Chào các em, cảm ơn các em đã tham gia đầy đủ.',
    'Chúng ta sẽ bắt đầu tiết học ngay bây giờ.',
    'Nhớ mở thiết bị để theo dõi phụ đề trực tiếp nhé.'
  ]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Simulate incoming captions
  useEffect(() => {
    const mockPhrases = [
      'Khái niệm về giới hạn...',
      'Khi x tiến dần tới x0...',
      'Tỷ số của dy và dx...',
      'Công thức tính nhanh đạo hàm...'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (isPaused) return;
      
      setFinalLines(prev => [...prev, partialText].slice(-5));
      setPartialText(mockPhrases[index % mockPhrases.length]);
      index++;
    }, 5000);

    return () => clearInterval(interval);
  }, [partialText, isPaused]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 top-16 lg:left-[260px] bg-slate-950 text-white flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Top Status Bar */}
      <div className="h-14 bg-red-600 flex items-center justify-between px-6 shrink-0 shadow-lg relative z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">LIVE</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <h2 className="text-sm font-bold truncate max-w-[200px]">Toán lớp 10A — 22/04</h2>
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-white/80">
             <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatTime(timer)}</span>
             <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {studentCount} học sinh</span>
          </div>
        </div>

        <button className="px-4 py-1.5 bg-white text-red-600 text-xs font-black rounded-lg hover:bg-slate-100 transition-all uppercase tracking-tighter">
          Kết thúc phiên học
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Main Monnitor (65%) */}
        <div className="lg:w-[65%] flex flex-col min-h-0 border-r border-white/5">
           <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <span className="text-xs font-bold text-white/60">GIÁM SÁT PHỤ ĐỀ (STUDENT VIEW MIRROR)</span>
              <div className="flex gap-2">
                <button className="p-1 px-2 text-[10px] bg-white/10 rounded">Tự động cuộn: Bật</button>
                <div className="flex items-center gap-1 px-2 border-l border-white/10 ml-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <span className="text-[10px] font-bold">STT: OK</span>
                </div>
              </div>
           </div>
           
           <div className="flex-1 min-h-0 relative">
              <CaptionDisplay 
                finalLines={finalLines} 
                partialText={partialText}
                className="h-full bg-transparent p-12 text-center"
              />
              
              {isPaused && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-10">
                   <Pause size={64} className="text-amber-500" />
                   <h3 className="text-2xl font-bold">Caption đang tạm dừng</h3>
                   <p className="text-slate-400">Âm thanh từ micro vẫn đang được xử lý nhưng không hiển thị cho học sinh.</p>
                   <button 
                    onClick={() => setIsPaused(false)}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-2xl"
                   >
                     Tiếp tục phát ngay
                   </button>
                </div>
              )}
           </div>

           <div className="p-6 bg-white/5 border-t border-white/5 shrink-0">
              <div className="flex items-center justify-between gap-6">
                 <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>MICROPHONE INPUT (REALTIME)</span>
                      <span className="text-green-500">ACTIVE</span>
                    </div>
                    <MicLevelVisualizer isActive={!isPaused} className="bg-white/5 border-white/10 h-10 px-2" />
                 </div>
                 <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isPaused ? "bg-amber-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                   >
                     {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                   </button>
                   <button className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20">
                     <Bookmark size={24} />
                   </button>
                   <button className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20">
                     <Settings size={24} />
                   </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Info & Stats Sidebar (35%) */}
        <div className="lg:w-[35%] bg-slate-900 flex flex-col border-white/5">
           <div className="p-6 space-y-8">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Từ đã dịch</p>
                   <p className="text-xl font-bold">1,234</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Độ trễ trung bình</p>
                   <p className="text-xl font-bold text-primary">0.8s</p>
                 </div>
              </div>

              {/* Realtime Graph Placeholder */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hiệu suất ASR</h3>
                    <Activity size={14} className="text-primary" />
                 </div>
                 <div className="h-24 flex items-end gap-1 px-1">
                    {[45, 60, 55, 70, 65, 80, 75, 90, 85, 100, 95, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                 </div>
              </div>

              {/* Student Connection List */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Học sinh kết nối (24)</h3>
                    <button className="text-[10px] font-bold text-primary">Xem tất cả</button>
                 </div>
                 <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {['Nguyễn Minh Anh', 'Lê Thị Lan', 'Trần Đức Hiếu', 'Phạm Minh Quang'].map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                         <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {name.split(' ').slice(-1)[0][0]}
                            </div>
                            <span className="text-sm font-medium">{name}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold text-green-500 uppercase">Connected</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="mt-auto p-6 bg-black/20 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-primary-soft/5 border border-primary/20 flex flex-col gap-2">
                 <p className="text-[10px] font-black text-primary uppercase">Mã tham gia lớp học</p>
                 <div className="flex items-center justify-between">
                    <p className="text-2xl font-mono font-bold tracking-[0.2em]">UDL-10A</p>
                    <button className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded">Sao chép</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
