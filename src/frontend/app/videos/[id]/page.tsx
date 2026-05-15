'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  ListChecks, 
  Info, 
  Bookmark,
  ChevronRight,
  Clock,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { TranscriptViewer } from '@/components/ui/TranscriptViewer';
import { mockLectures, mockTranscript, mockSummary } from '@/lib/mockData';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function VideoLearningPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const lecture = mockLectures.find(l => l.id === params.id) || mockLectures[0];
  
  const activeTabFromUrl = (searchParams.get('tab') as 'summary' | 'transcript' | 'info') || 'summary';
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'info'>(activeTabFromUrl);
  const [currentTime, setCurrentTime] = useState(0);
  
  const segment = mockTranscript.find(
    s => currentTime >= s.startTime && currentTime <= s.endTime
  );
  const currentCaption = segment ? segment.text : '';

  const handleSeek = (time: number) => {
    // In a real app we'd trigger a seek on the video element
    // For the simulator, we just update the UI state
    setCurrentTime(time);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Breadcrumb / Top Info */}
      <div className="flex items-center gap-2 text-sm text-neutral mb-4 overflow-hidden">
        <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-primary transition-colors">
           <ChevronLeft size={16} />
           <span>Quay lại</span>
        </button>
        <span className="opacity-30">/</span>
        <span className="truncate">{lecture.subject}</span>
        <span className="opacity-30">/</span>
        <span className="font-semibold text-text truncate">{lecture.title}</span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: Video Pane (60%) */}
        <div className="lg:w-[60%] flex flex-col gap-4 min-h-0">
          <VideoPlayer 
            src="https://www.w3schools.com/html/mov_bbb.mp4" // Placeholder video
            captionText={currentCaption}
            className="flex-1"
          />
          
          <div className="bg-card p-6 rounded-3xl border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">{lecture.title}</h1>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary bg-primary-soft rounded-xl hover:bg-primary/20 transition-all">
                <Bookmark size={18} />
                Lưu bài giảng
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200" />
                <span className="font-medium text-text">{lecture.lecturer}</span>
              </div>
              <div className="w-1 h-1 bg-border rounded-full" />
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>{lecture.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content Pane (40%) */}
        <div className="lg:w-[40%] flex flex-col bg-card rounded-3xl border shadow-card min-h-0">
          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: 'summary', label: 'Tóm tắt', icon: ListChecks },
              { id: 'transcript', label: 'Transcript', icon: FileText },
              { id: 'info', label: 'Thông tin', icon: Info },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'summary' | 'transcript' | 'info')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all",
                  activeTab === tab.id 
                    ? "border-primary text-primary bg-primary-soft/30" 
                    : "border-transparent text-neutral hover:text-text hover:bg-slate-50"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {activeTab === 'summary' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Tóm tắt theo đoạn</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-green-100 text-green-700 rounded">AI Generated</span>
                </div>
                
                {mockSummary.map((block, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-100 space-y-3">
                    <button 
                      onClick={() => handleSeek(parseInt(block.time))} // Simplified seek
                      className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary hover:scale-125 transition-transform"
                    />
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary bg-primary-soft px-2 py-1 rounded w-fit">
                      <Clock size={12} />
                      {block.time}
                    </div>
                    <ul className="space-y-2">
                      {block.bullets.map((bullet, i) => (
                        <li key={i} className="text-sm text-neutral-600 flex gap-2 leading-relaxed">
                          <ChevronRight size={16} className="text-primary shrink-0 mt-0.5" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {block.keywords.map(kw => (
                        <span key={kw} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-border">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <TranscriptViewer 
                  segments={mockTranscript} 
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  className="flex-1 border-none bg-transparent"
                />
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <h3 className="font-bold">Chi tiết bài giảng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border">
                      <p className="text-[10px] font-bold text-neutral uppercase tracking-widest mb-1">Mã bài giảng</p>
                      <p className="text-sm font-semibold">{lecture.id}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border">
                      <p className="text-[10px] font-bold text-neutral uppercase tracking-widest mb-1">Ngôn ngữ</p>
                      <p className="text-sm font-semibold">Tiếng Việt</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border">
                      <p className="text-[10px] font-bold text-neutral uppercase tracking-widest mb-1">AI Model</p>
                      <p className="text-sm font-semibold text-primary">Whisper Large v3</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border">
                      <p className="text-[10px] font-bold text-neutral uppercase tracking-widest mb-1">Độ chính xác</p>
                      <p className="text-sm font-semibold text-green-600">98.2%</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-warning/20 bg-warning/5 text-sm leading-relaxed">
                  <p className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Info size={16} /> Lưu ý trợ năng
                  </p>
                  Bản dịch được tự động tạo bởi AI. Nếu phát hiện lỗi sai chuyên môn, vui lòng báo cáo lỗi để giảng viên cập nhật bản chỉnh sửa.
                </div>

                <button className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-sm font-bold text-neutral hover:bg-slate-50 hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
                  <ExternalLink size={18} />
                  Báo cáo lỗi bản dịch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
