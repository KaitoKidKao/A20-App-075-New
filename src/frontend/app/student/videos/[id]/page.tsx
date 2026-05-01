'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Clock,
  Zap,
  HelpCircle,
  BookOpen,
  Target,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

const API_BASE = 'http://localhost:8000';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TimelineItem {
  time: string;
  title: string;
}

interface HighlightItem {
  time: string;
  reason: string;
  context: string;
}

interface QuestionItem {
  time: string;
  original: string;
  rephrased: string;
}

interface BriefingData {
  objective: string;
  key_terms: string[];
  summary: string;
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
  
  // New Features state
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

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

  // Fetch all metadata on demand or mount
  const fetchAllMetadata = async () => {
    setIsLoadingMetadata(true);
    try {
      const [timelineRes, highlightsRes, questionsRes, briefingRes] = await Promise.all([
        fetch(`${API_BASE}/api/videos/${videoId}/timeline`).then(r => r.json()),
        fetch(`${API_BASE}/api/videos/${videoId}/highlights`).then(r => r.json()),
        fetch(`${API_BASE}/api/videos/${videoId}/questions`).then(r => r.json()),
        fetch(`${API_BASE}/api/videos/${videoId}/briefing`).then(r => r.json())
      ]);

      setTimeline(timelineRes.timeline || []);
      setHighlights(highlightsRes.highlights || []);
      setQuestions(questionsRes.questions || []);
      setBriefing(briefingRes.briefing || null);
    } catch (err) {
      console.error('Metadata fetch error:', err);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  useEffect(() => {
    if (!isLoadingTranscript && segments.length > 0) {
      fetchAllMetadata();
    }
  }, [isLoadingTranscript, segments]);

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
            
            {/* Pre-lecture Briefing Alert */}
            {briefing && (
              <div className="bg-[#FF4F6E]/5 border border-[#FF4F6E]/20 rounded-2xl p-6 animate-in slide-in-from-top duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[#FF4F6E]">
                    <Zap size={20} fill="currentColor" />
                    <span className="font-black uppercase tracking-wider text-sm">Smart Briefing</span>
                  </div>
                  <button 
                    onClick={() => setShowBriefing(!showBriefing)}
                    className="text-xs font-bold text-[#FF4F6E] hover:underline"
                  >
                    {showBriefing ? 'Thu gọn' : 'Xem chi tiết định hướng'}
                  </button>
                </div>
                
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                  Mục tiêu: {briefing.objective}
                </h3>
                
                {showBriefing && (
                  <div className="space-y-4 pt-2 border-t border-[#FF4F6E]/10 mt-4 animate-in fade-in duration-300">
                    <div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Từ khóa quan trọng</span>
                      <div className="flex flex-wrap gap-2">
                        {briefing.key_terms.map((term, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-[#FF4F6E]/20 rounded-lg text-xs font-bold text-[#FF4F6E]">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Tóm tắt định hướng</span>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {briefing.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Player Area */}
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-200 relative aspect-video">
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
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-[#FF4F6E] rounded-lg flex items-center justify-center text-white">
                      <Sparkles size={18} fill="currentColor" />
                   </div>
                   <span className="font-extrabold text-xl text-slate-800 tracking-tight">AI Study Coach</span>
                </div>
                <ChevronDown size={20} className="text-slate-400" />
              </div>
              
              <p className="text-base text-slate-600 font-medium mb-8">
                Tôi đã phân tích bài giảng và trích xuất các thông tin quan trọng. Bạn cần hỗ trợ gì không?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Rephrased Questions Highlight */}
                {questions.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                        <HelpCircle size={20} />
                      </div>
                      <span className="font-bold text-slate-900">Câu hỏi đã làm rõ</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      Làm rõ {questions.length} câu hỏi quan trọng trong bài giảng.
                    </p>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Question Rephrase</span>
                       <ArrowRight size={14} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                )}

                {/* Attention Highlights */}
                {highlights.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                        <Zap size={20} />
                      </div>
                      <span className="font-bold text-slate-900">Điểm nhấn cần lưu ý</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      {highlights.length} khoảnh khắc quan trọng về thi cử & khái niệm.
                    </p>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Attention Highlighting</span>
                       <ArrowRight size={14} className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleGetSummary}
                  disabled={isLoadingSummary}
                  className="bg-[#FF4F6E] px-6 py-3 rounded-2xl text-sm font-bold text-white hover:bg-[#3b30c9] transition-all flex items-center gap-2 shadow-lg shadow-[#FF4F6E]/20 disabled:opacity-50"
                >
                  {isLoadingSummary ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isLoadingSummary ? 'Đang tóm tắt...' : 'Tóm tắt bài giảng ngay'}
                </button>
                <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
                  <BookOpen size={16} /> Câu hỏi luyện tập
                </button>
              </div>

              {/* Summary Output */}
              {summaryPoints.length > 0 && (
                <div className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl animate-in zoom-in-95 duration-500">
                  <h4 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#FF4F6E]" /> AI Summary
                  </h4>
                  <ul className="space-y-3">
                    {summaryPoints.map((point, i) => (
                      <li key={i} className="text-[15px] text-slate-700 font-medium leading-relaxed flex gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-[#FF4F6E] rounded-full shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Lower Tabs Area */}
            <div className="pt-4">
              <div className="border-b border-slate-200 mb-8 flex gap-10 overflow-x-auto no-scrollbar">
                {[
                  { id: 'transcript', label: 'Phiên âm', icon: FileText },
                  { id: 'timeline', label: 'Dòng thời gian', icon: Clock },
                  { id: 'highlights', label: 'Điểm nhấn', icon: Zap },
                  { id: 'questions', label: 'Câu hỏi đã làm rõ', icon: HelpCircle },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "pb-4 text-[15px] font-extrabold transition-all relative flex items-center gap-2 whitespace-nowrap",
                      activeTab === tab.id ? "text-[#FF4F6E] border-b-2 border-[#FF4F6E]" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'transcript' && (
                  <div className="prose prose-slate max-w-none">
                    {isLoadingTranscript ? (
                      <div className="flex items-center gap-3 text-slate-400 py-8">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="font-medium">Đang tải transcript...</span>
                      </div>
                    ) : (
                      <p className="text-[16px] text-slate-700 leading-relaxed font-medium">
                        {fullTranscriptText}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {timeline.length > 0 ? timeline.map((item, i) => (
                      <div key={i} className="flex gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                        <div className="text-sm font-black text-[#FF4F6E] bg-[#FF4F6E]/5 w-16 h-10 flex items-center justify-center rounded-xl shrink-0 group-hover:bg-[#FF4F6E] group-hover:text-white transition-colors">
                          {item.time}
                        </div>
                        <div className="pt-1.5">
                          <h4 className="font-extrabold text-slate-900 group-hover:text-[#FF4F6E] transition-colors mb-1">{item.title}</h4>
                          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 group-hover:bg-[#FF4F6E]/10 transition-colors" />
                        </div>
                      </div>
                    )) : (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                         <Clock size={40} className="mb-4 opacity-20" />
                         <p className="font-bold">Đang phân tích timeline...</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'highlights' && (
                  <div className="grid grid-cols-1 gap-6">
                    {highlights.map((item, i) => (
                      <div key={i} className="bg-rose-50/30 border border-rose-100 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Zap size={80} fill="currentColor" className="text-rose-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                           <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-black">{item.time}</span>
                           <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Attention Highlighting</span>
                        </div>
                        <h4 className="text-lg font-extrabold text-slate-900 mb-2">{item.reason}</h4>
                        <div className="bg-white/80 rounded-2xl p-4 border border-rose-100 text-sm italic text-slate-600 font-medium">
                           "{item.context}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'questions' && (
                  <div className="space-y-6">
                    {questions.map((item, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-lg transition-all border-l-4 border-l-amber-400">
                        <div className="flex items-center gap-3 mb-4">
                           <span className="text-xs font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-lg">{item.time}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Clarification</span>
                        </div>
                        <div className="space-y-6">
                           <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Câu hỏi gốc</span>
                              <p className="text-slate-500 font-medium line-through decoration-slate-300">{item.original}</p>
                           </div>
                           <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                              <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block mb-2">Diễn đạt lại (Clearer)</span>
                              <p className="text-slate-900 font-extrabold text-lg">{item.rephrased}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-8 pb-12 border-t border-slate-100 mt-12">
                <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                  Tiếp tục bài tiếp theo
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar (Transcript Right Column) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl flex flex-col h-[calc(100vh-140px)] shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <span className="font-black text-slate-900">Transcript Phân Đoạn</span>
                <List size={18} className="text-slate-400" />
              </div>

              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-black text-slate-400 flex items-center gap-2">
                  NGÔN NGỮ: <span className="text-[#FF4F6E]">{language?.toUpperCase() || 'LOADING...'}</span>
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin">
                {segments.length > 0 ? (
                  segments.map((item, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-4 -mx-4 rounded-2xl transition-all">
                      <span className="text-[10px] font-black text-[#FF4F6E] bg-[#FF4F6E]/5 w-12 h-6 flex items-center justify-center rounded-lg mt-1 shrink-0">{formatTime(item.start)}</span>
                      <p className="text-[14px] font-bold text-slate-600 leading-relaxed group-hover:text-slate-900">
                        {item.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                     <Loader2 size={32} className="animate-spin mb-4 opacity-20" />
                     <p className="text-sm font-bold">Đang tải phụ đề...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
