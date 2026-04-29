'use client';

import React, { useState, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import { 
  Play, 
  MessageSquare, 
  FileText, 
  Download, 
  Search, 
  ChevronRight, 
  Maximize, 
  Volume2, 
  Settings,
  Sparkles,
  Save,
  ChevronDown,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useParams } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = 'http://localhost:8000';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoLessonPage() {
  const params = useParams();
  const videoId = params.id as string;
  const [activeTab, setActiveTab] = useState('transcript');
  
  // Transcript state
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [language, setLanguage] = useState('');
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(true);
  const [transcriptError, setTranscriptError] = useState('');
  
  // Summary state
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Fetch transcript on mount
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/videos/${videoId}/transcript`);
        const data = await res.json();
        
        if (data.segments && data.segments.length > 0) {
          setSegments(data.segments);
          setLanguage(data.language || 'Unknown');
        } else {
          setTranscriptError(data.message || 'Transcript chưa sẵn sàng.');
        }
      } catch (err) {
        console.error('Transcript fetch error:', err);
        setTranscriptError('Không thể kết nối Backend. Đảm bảo server đang chạy.');
      } finally {
        setIsLoadingTranscript(false);
      }
    };

    fetchTranscript();
  }, [videoId]);

  // Fetch summary on demand
  const handleGetSummary = async () => {
    if (summaryPoints.length > 0) return; // Already loaded
    setIsLoadingSummary(true);
    setSummaryError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/videos/${videoId}/summary`);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      setSummaryPoints(data.summary || []);
    } catch (err: any) {
      console.error('Summary fetch error:', err);
      setSummaryError(err.message || 'Lỗi khi tạo tóm tắt.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Calculate total duration from segments
  const totalDuration = segments.length > 0 
    ? formatTime(segments[segments.length - 1].end) 
    : '0:00';

  // Full transcript text for display
  const fullTranscriptText = segments.map(s => s.text).join(' ');

  return (
    <div className="min-h-screen">
      <div className="p-8 max-w-6xl mx-auto">
        
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content (Video + Tabs) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video Player Area */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-slate-200 relative aspect-video">
              <video
                className="w-full h-full object-contain bg-black"
                controls
                autoPlay={false}
                preload="metadata"
                crossOrigin="anonymous"
                src={`/api/video/${videoId}`}
              >
                <track
                  kind="subtitles"
                  src={`/api/video/${videoId}/subtitle`}
                  srcLang={language || 'en'}
                  label={language === 'vi' ? 'Tiếng Việt' : 'English'}
                  default
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Title & Info */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Video Lesson</h1>
                {language && (
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Language: <span className="text-slate-600 font-semibold">{language}</span> · ID: <span className="font-mono text-xs">{videoId.slice(0, 8)}</span>
                  </p>
                )}
              </div>
              <button className="flex items-center gap-2 text-primary font-bold hover:underline hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                <Save size={18} />
                Save note
              </button>
            </div>

            {/* AI Assistant Area */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-lg text-slate-700">coach</span>
                <ChevronDown size={20} className="text-slate-400" />
              </div>
              <p className="text-base text-slate-600 font-medium mb-6">
                Let me know if you have any questions about this material. I&apos;m here to help!
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Give me practice questions
                </button>
                <button className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Explain this topic in simple terms
                </button>
                <button 
                  onClick={handleGetSummary}
                  disabled={isLoadingSummary}
                  className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isLoadingSummary ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isLoadingSummary ? 'Generating...' : 'Give me a summary'}
                </button>
                <button className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Give me real-life examples
                </button>
              </div>

              {/* Summary Output */}
              {summaryPoints.length > 0 && (
                <div className="mt-6 p-5 bg-white border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#4C40ED]" /> AI Summary
                  </h4>
                  <ul className="space-y-2">
                    {summaryPoints.map((point, i) => (
                      <li key={i} className="text-sm text-slate-700 font-medium leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {summaryError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle size={14} /> {summaryError}
                </div>
              )}
            </div>

            {/* Lower Tabs Area */}
            <div className="pt-4">
              <div className="border-b border-slate-200 mb-6 flex gap-8">
                {['Transcript', 'Notes', 'Downloads'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={cn(
                      "pb-4 text-base font-extrabold transition-all relative",
                      activeTab === tab.toLowerCase() ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'transcript' && (
                <div className="prose prose-slate max-w-none">
                  {isLoadingTranscript ? (
                    <div className="flex items-center gap-3 text-slate-400 py-8">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="font-medium">Đang tải transcript...</span>
                    </div>
                  ) : transcriptError ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                      {transcriptError}
                    </div>
                  ) : (
                    <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                      {fullTranscriptText}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4 pb-12">
                <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#4C40ED] text-[#4C40ED] font-bold rounded-xl hover:bg-[#4C40ED]/5 transition-colors">
                  Go to next item
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar (Transcript Right Column) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 bg-white border border-slate-200 rounded-2xl flex flex-col h-[calc(100vh-140px)] shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center gap-6">
                <button className="text-sm font-extrabold text-slate-900 border-b-2 border-slate-900 pb-1">Transcript</button>
                <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1">Notes</button>
                <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1">Downloads</button>
              </div>

              <div className="px-6 py-4 border-b border-slate-100 flex items-center">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  Language: <span className="text-slate-900 ml-1">{language || 'Loading...'}</span> <ChevronDown size={14} className="ml-1 text-slate-400" />
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin">
                {isLoadingTranscript ? (
                  <div className="flex items-center gap-3 text-slate-400 py-8">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-sm font-medium">Đang tải transcript...</span>
                  </div>
                ) : transcriptError ? (
                  <div className="text-sm text-amber-600 font-medium py-4">
                    {transcriptError}
                  </div>
                ) : segments.length > 0 ? (
                  segments.map((item, i) => (
                    <div key={i} className="flex gap-5 group cursor-pointer hover:bg-slate-50 p-3 -mx-3 rounded-xl transition-all">
                      <span className="text-xs font-bold text-slate-400 mt-1 shrink-0">{formatTime(item.start)}</span>
                      <p className="text-[15px] font-medium text-slate-700 leading-relaxed group-hover:text-slate-900">
                        {item.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 py-4">Không có dữ liệu transcript.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
