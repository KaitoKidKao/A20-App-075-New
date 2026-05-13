'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Play, 
  FileText, 
  Sparkles,
  Clock,
  Zap,
  HelpCircle,
  BookOpen,
  Target,
  List,
  Eye,
  Film,
  CheckCircle,
  Hand,
  Sparkle,
  Brain,
  Lightbulb,
  Rocket,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api, type HandsSignGloss } from '@/lib/api';
import SignAvatar2D from '@/components/SignAvatar2D';
import { InfographicViewer, type InfographicData } from '@/components/infographic/InfographicViewer';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

type TranscriptByLanguage = Record<string, TranscriptSegment[]>;

function isMostlyEnglish(text: string): boolean {
  const t = (text || "").trim();
  if (!t) return false;
  const asciiLetters = (t.match(/[A-Za-z]/g) || []).length;
  const viChars = (t.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi) || []).length;
  return asciiLetters > 25 && viChars < 5;
}

function splitSentences(text: string): string[] {
  return (text || "")
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function alignTextToTimeline(sourceText: string, timelineSegments: TranscriptSegment[]): TranscriptSegment[] {
  const parts = splitSentences(sourceText);
  if (parts.length === 0) return timelineSegments;
  const result: TranscriptSegment[] = [];
  const totalChars = parts.reduce((acc, p) => acc + p.length, 0);
  let cursor = 0;
  for (const seg of timelineSegments) {
    const segDuration = Math.max(0.2, seg.end - seg.start);
    const ratio = segDuration / Math.max(0.2, timelineSegments[timelineSegments.length - 1].end - timelineSegments[0].start);
    const charsForSeg = Math.max(8, Math.round(totalChars * ratio));
    let text = "";
    while (cursor < parts.length && text.length < charsForSeg) {
      text += (text ? " " : "") + parts[cursor];
      cursor += 1;
    }
    if (!text && cursor < parts.length) {
      text = parts[cursor];
      cursor += 1;
    }
    result.push({ ...seg, text: text || seg.text });
  }
  return result;
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

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
}

interface VisualData {
  infographic?: InfographicData;
  charts?: Record<string, unknown>;
  cover_image_url?: string | null;
}

const flashcardBackgroundImages = Array.from({ length: 10 }, (_, i) => `/assets/images/flashcards/flashcard_${i + 1}.png`);

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoLessonPage() {
  const params = useParams();
  const videoId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSourceModeRef = useRef<'byId' | 'demo'>('byId');
  
  const [activeTab, setActiveTab] = useState('transcript');
  const [currentTime, setCurrentTime] = useState(0);
  
  // Data state
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [language, setLanguage] = useState('vi');
  const [segmentsByLanguage, setSegmentsByLanguage] = useState<TranscriptByLanguage>({});
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [visualData, setVisualData] = useState<VisualData | null>(null);
  const [handsignGlosses, setHandsSignGlosses] = useState<HandsSignGloss[]>([]);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(true);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState('');
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('transcript');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const dragStartXRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  /** Ưu tiên stream file theo videoId (Next proxy → data/uploads/videos); lỗi thì dùng video mẫu. */
  const [videoSourceMode, setVideoSourceMode] = useState<'byId' | 'demo'>('byId');
  const [videoBroken, setVideoBroken] = useState(false);

  const videoSrc = videoSourceMode === 'demo' ? '/demo-video.mp4' : `/api/video/${videoId}`;
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const data = await api.videos.getTranscript(videoId);
        const fromApi = (data.segments_by_language || {}) as TranscriptByLanguage;
        const normalized: TranscriptByLanguage = { ...fromApi };

        if (!normalized.vi && Array.isArray(data.segments)) normalized.vi = data.segments;

        // Legacy transcript compatibility:
        // Some old files store mixed EN/VI in one segments array.
        if (Array.isArray(data.segments) && !fromApi.en) {
          const enSegments = data.segments.filter((s: TranscriptSegment) => isMostlyEnglish(s.text));
          if (enSegments.length >= 3) {
            normalized.en = enSegments;
            if (!fromApi.vi) {
              const viSegments = data.segments.filter((s: TranscriptSegment) => !isMostlyEnglish(s.text));
              normalized.vi = viSegments.length > 0 ? viSegments : data.segments;
            }
            // Fallback for corrupted legacy transcript.
            if ((normalized.vi?.length || 0) <= 1 && enSegments.length > 3) {
              const longViText = normalized.vi?.[0]?.text || "";
              normalized.vi = longViText
                ? alignTextToTimeline(longViText, enSegments)
                : enSegments;
            }
          }
        }

        const availableLangs = Object.keys(normalized).filter(
          (k) => Array.isArray(normalized[k]) && normalized[k].length > 0
        );
        const sourceLang = String(data.source_language || '').toLowerCase();
        const defaultLang = availableLangs.includes(sourceLang)
          ? sourceLang
          : (availableLangs.includes('vi') ? 'vi' : (availableLangs[0] || data.language || 'vi'));

        setSegmentsByLanguage(normalized);
        setLanguage(defaultLang);
        setSegments(normalized[defaultLang] || data.segments || []);
        if (!data.segments && availableLangs.length === 0) {
          setSegments([]);
        }
      } catch (err) {
        console.error('Transcript fetch error:', err);
      } finally {
        setIsLoadingTranscript(false);
      }
    };

    fetchTranscript();
  }, [videoId]);

  useEffect(() => {
    if (!language) return;
    const next = segmentsByLanguage[language];
    if (Array.isArray(next)) {
      setSegments(next);
    }
  }, [language, segmentsByLanguage]);

  useEffect(() => {
    setVideoSourceMode('byId');
    setVideoBroken(false);
  }, [videoId]);

  useEffect(() => {
    videoSourceModeRef.current = videoSourceMode;
  }, [videoSourceMode]);

  const fetchAllMetadata = useCallback(async () => {
    setIsLoadingMetadata(true);
    setMetadataError('');
    try {
      const [timelineRes, highlightsRes, questionsRes, briefingRes, flashcardsRes, vizDataRes] = await Promise.all([
        api.videos.getTimeline(videoId),
        api.videos.getHighlights(videoId),
        api.videos.getQuestions(videoId),
        api.videos.getBriefing(videoId),
        api.videos.getFlashcards(videoId),
        api.videos.getVizData(videoId),
      ]);

      setTimeline(timelineRes.timeline || []);
      setHighlights(highlightsRes.highlights || []);
      setQuestions(questionsRes.questions || []);
      setBriefing(briefingRes.briefing || null);
      setFlashcards(flashcardsRes.flashcards || []);
      const nextVisualData = vizDataRes.visual_data || null;
      if (nextVisualData?.infographic && vizDataRes.cover_image_url) {
        nextVisualData.infographic.cover_image_url = vizDataRes.cover_image_url;
      }
      setVisualData(nextVisualData);
    } catch (err) {
      console.error('Metadata fetch error:', err);
      setMetadataError('Tài nguyên học tập chưa sẵn sàng. Vui lòng tải lại sau khi xử lý hoàn tất.');
    } finally {
      setIsLoadingMetadata(false);
    }

    try {
      const handsignRes = await api.videos.getHandsSign(videoId);
      const raw = handsignRes.handsign_data || [];
      setHandsSignGlosses(
        [...raw].sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0))
      );
    } catch (err) {
      console.error('Handsign fetch error:', err);
      setHandsSignGlosses([]);
    }

    try {
      const avatarRes = await api.videos.getAvatar(videoId);
      const rawUrl = avatarRes?.avatar_video_url;
      if (!rawUrl) {
        setAvatarVideoUrl(null);
      } else if (typeof rawUrl === 'string' && rawUrl.startsWith('/api/avatar-video/')) {
        setAvatarVideoUrl(`${backendBaseUrl}${rawUrl}`);
      } else {
        setAvatarVideoUrl(rawUrl);
      }
    } catch (err) {
      console.error('Avatar state fetch error:', err);
      setAvatarVideoUrl(null);
    }
  }, [backendBaseUrl, videoId]);

  useEffect(() => {
    if (!isLoadingTranscript && segments.length > 0) {
      fetchAllMetadata();
    }
  }, [fetchAllMetadata, isLoadingTranscript, segments]);

  useEffect(() => {
    setCurrentFlashcardIndex(0);
    setIsFlashcardFlipped(false);
    setDragOffsetX(0);
  }, [videoId, flashcards.length]);

  useEffect(() => {
    setHandsSignGlosses([]);
    setAvatarVideoUrl(null);
    setAvatarError('');
    setIsGeneratingAvatar(false);
  }, [videoId]);

  const handleGenerateAvatarVideo = async () => {
    setIsGeneratingAvatar(true);
    setAvatarError('');
    try {
      const result = await api.videos.generateAvatar(videoId);
      const rawUrl = result?.avatar_video_url;
      if (!rawUrl) {
        throw new Error('Backend chưa trả về URL video avatar.');
      }
      if (typeof rawUrl === 'string' && rawUrl.startsWith('/api/avatar-video/')) {
        setAvatarVideoUrl(`${backendBaseUrl}${rawUrl}`);
      } else {
        setAvatarVideoUrl(rawUrl);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo video avatar.';
      setAvatarError(message);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const seekToSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const seekTo = (timeStr: string) => {
    const [m, s] = timeStr.split(':').map(Number);
    const totalSeconds = m * 60 + s;
    if (videoRef.current) {
      videoRef.current.currentTime = totalSeconds;
      videoRef.current.play();
    }
  };

  const handleGetSummary = async () => {
    if (summaryPoints.length > 0) return;
    setIsLoadingSummary(true);
    try {
      const data = await api.videos.getSummary(videoId);
      setSummaryPoints(data.summary || []);
    } catch (err) {
      console.error('Summary fetch error:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleDownloadHandsSignExport = useCallback(async () => {
    try {
      const manifest = await api.videos.getHandsSignExport(videoId);
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `handsign-export-${videoId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Hands sign export download error:', err);
    }
  }, [videoId]);

  const activeSegment = useMemo(
    () => segments.find((s) => currentTime >= s.start && currentTime <= s.end),
    [segments, currentTime]
  );

  const visibleCaptionWords = useMemo(() => {
    if (!activeSegment) return [] as string[];

    const words = activeSegment.text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [] as string[];

    const elapsed = Math.max(0, currentTime - activeSegment.start);
    const duration = Math.max(0.2, activeSegment.end - activeSegment.start);
    const progress = Math.min(1, elapsed / duration);
    const visibleCount = Math.max(1, Math.ceil(progress * words.length));
    return words.slice(0, visibleCount);
  }, [activeSegment, currentTime]);

  const renderPanelState = (message: string) => (
    <div className="p-8 rounded-3xl bg-slate-50 text-slate-500 font-bold text-center leading-relaxed">
      {message}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Subtle Overlay to ensure readability */}
      <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />

      <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8 relative z-10">
        
        {/* Header - Inclusive Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight italic">
                Bài học <span className="text-[#FF4F6E]">trực quan</span> nâng cao
              </h1>
           </div>
           {/* Sign Language toggle removed per user request */}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column: Player & Smart Content (Wider) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Main Video Player — Giai đoạn D: ưu tiên /api/video/[id] khớp file đã upload */}
            <div className="bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white relative aspect-video group">
              {videoSourceMode === 'demo' && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none rounded-full bg-amber-500/95 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 shadow-lg max-w-[90%]">
                  Chế độ demo: không tìm thấy file video trên máy chủ, hệ thống đang phát video mẫu.
                </div>
              )}

              <video
                key={`${videoId}-${videoSourceMode}`}
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                className={cn('w-full h-full object-cover opacity-90', videoBroken && 'hidden')}
                controls
                src={videoSrc}
                preload="metadata"
                onError={() => {
                  if (videoSourceModeRef.current === 'byId') {
                    setVideoSourceMode('demo');
                    return;
                  }
                  setVideoBroken(true);
                }}
              />

              {/* Subtitle Overlay - bottom-center with realtime word reveal */}
              {activeSegment && (
                <div
                  key={`${activeSegment.start}-${activeSegment.end}`}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[86%] pointer-events-none z-30"
                >
                  <div className="px-1 md:px-2 py-1">
                    <div className="flex items-center gap-2 justify-center">
                      <p className="text-center text-xs md:text-sm font-black leading-relaxed tracking-tight text-white">
                      {visibleCaptionWords.map((word, idx) => (
                        <span
                          key={`${word}-${idx}`}
                          className="inline-block mr-2 caption-word-pop"
                          style={{ animationDelay: `${idx * 24}ms` }}
                        >
                          {word}
                        </span>
                      ))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback if cả proxy và demo đều lỗi */}
              <div
                id="video-fallback"
                className={cn(
                  'absolute inset-0 flex flex-col items-center justify-center text-white/50',
                  !videoBroken && 'hidden'
                )}
              >
                 <Film size={64} className="mb-6 opacity-30" />
                 <p className="font-black tracking-[0.2em] uppercase text-sm">Không thể phát video</p>
                 <p className="text-[11px] mt-3 max-w-xs text-center opacity-60 font-bold">The video file appears to be corrupted or missing.</p>
              </div>
              
              {/* Visual Sound Pulse REMOVED per user request */}
            </div>

            {/* AI Smart Analysis Panel - High Accessibility for Deaf Users */}
            <div className="bg-white/95 backdrop-blur-md rounded-[40px] p-10 border border-white/20 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles size={120} className="text-[#FF4F6E]" />
               </div>
               
               <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-[#FF4F6E]/10 rounded-[28px] flex items-center justify-center text-[#FF4F6E] animate-pulse">
                        <Sparkles size={32} />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Trí tuệ trực quan</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Tóm tắt AI tức thì cho người học trực quan</p>
                     </div>
                  </div>
                  
                  <button 
                    onClick={handleGetSummary}
                    disabled={isLoadingSummary}
                    className="w-full md:w-auto px-10 py-5 bg-[#FF4F6E] text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-[#FF4F6E]/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isLoadingSummary ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Zap size={20} fill="currentColor" />
                        Tạo tóm tắt bằng AI
                      </>
                    )}
                  </button>
               </div>

               {summaryPoints.length > 0 && (
                 <div className="mt-10 grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    {summaryPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-4 p-6 bg-slate-50 rounded-[28px] border border-slate-100/50 hover:bg-white hover:shadow-xl transition-all group/card">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#FF4F6E] shadow-sm shrink-0 group-hover/card:scale-110 transition-transform">
                           <CheckCircle size={18} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{pt}</p>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Smart Content Section - Expanded Layout */}
            <div className="space-y-6">
               {/* Full Width Briefing Banner */}
               {briefing && (
                 <div className="bg-slate-50 rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                       <Target size={150} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                            <Target size={24} />
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mục tiêu bài giảng</h3>
                      </div>
                      <p className="text-base md:text-lg font-bold text-slate-600 leading-relaxed italic mb-6 max-w-3xl">
                        &ldquo;{briefing.objective}&rdquo;
                      </p>
                      <div className="flex flex-wrap gap-2">
                         {briefing.key_terms.map((term, i) => (
                           <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest shadow-sm">
                             {term}
                           </span>
                         ))}
                      </div>
                    </div>
                 </div>
               )}

               {/* Visual Tabs Section */}
               <div className="bg-white/95 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/20 shadow-xl shadow-slate-200/20">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-slate-100 mb-10 pb-2">
                     {[
                       { id: 'timeline', label: 'Cấu trúc thời gian', icon: Clock },
                       { id: 'highlights', label: 'Điểm nhấn chính', icon: Zap },
                       { id: 'questions', label: 'Làm rõ khái niệm', icon: HelpCircle },
                       { id: 'flashcards', label: 'Thẻ ghi nhớ', icon: BookOpen },
                       { id: 'visuals', label: 'Trực quan hóa', icon: Eye },
                       { id: 'handsign', label: 'Avatar VSL', icon: Hand },
                     ].map((tab) => (
                       <button 
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id)}
                         className={cn(
                           "pb-6 text-[12px] font-black uppercase tracking-[0.15em] transition-all relative flex items-center gap-3 shrink-0",
                           activeTab === tab.id ? "text-[#FF4F6E]" : "text-slate-400 hover:text-slate-600"
                         )}
                       >
                         <tab.icon size={18} />
                         {tab.label}
                         {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#FF4F6E] rounded-t-full" />}
                       </button>
                     ))}
                  </div>

                  <div className="min-h-[350px]">
                     {activeTab === 'timeline' && (
                       isLoadingMetadata ? renderPanelState('Đang tải mốc thời gian...') : metadataError ? renderPanelState(metadataError) : timeline.length === 0 ? renderPanelState('Chưa có dữ liệu mốc thời gian.') : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {timeline.map((item, i) => (
                            <div 
                              key={i} 
                              onClick={() => seekTo(item.time)}
                              className="flex items-start gap-5 p-6 rounded-[28px] bg-slate-50 border border-transparent hover:border-[#FF4F6E]/30 hover:bg-white hover:shadow-2xl hover:shadow-[#FF4F6E]/5 transition-all cursor-pointer group"
                            >
                               <div className="w-16 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[11px] font-black text-[#FF4F6E] group-hover:bg-[#FF4F6E] group-hover:text-white transition-colors shrink-0">
                                  {item.time}
                               </div>
                               <span className="text-base font-black text-slate-700 group-hover:text-slate-900 leading-snug pt-1">{item.title}</span>
                            </div>
                          ))}
                       </div>
                       )
                     )}

                     {activeTab === 'highlights' && (
                       isLoadingMetadata ? renderPanelState('Đang tải điểm nhấn...') : metadataError ? renderPanelState(metadataError) : highlights.length === 0 ? renderPanelState('Chưa có dữ liệu điểm nhấn.') : (
                       <div className="space-y-6">
                          {highlights.map((item, i) => (
                            <div key={i} className="bg-[#FF4F6E]/5 rounded-[32px] p-8 md:p-10 border border-[#FF4F6E]/10 relative group overflow-hidden transition-all hover:bg-[#FF4F6E]/10">
                               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                  <Zap size={150} fill="currentColor" className="text-[#FF4F6E]" />
                               </div>
                               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                  <div className="w-24 h-24 bg-white rounded-[28px] shadow-xl shadow-[#FF4F6E]/10 flex flex-col items-center justify-center shrink-0 border border-[#FF4F6E]/20">
                                     <span className="text-[10px] font-black text-[#FF4F6E] uppercase tracking-widest mb-1">Trọng tâm</span>
                                     <span className="text-xl font-black text-slate-900">{item.time}</span>
                                  </div>
                                  <div className="space-y-3">
                                     <h4 className="text-2xl font-black text-slate-900 leading-tight">{item.reason}</h4>
                                     <p className="text-base font-bold text-slate-500 italic">&ldquo;{item.context}&rdquo;</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                       )
                     )}

                     {activeTab === 'questions' && (
                       isLoadingMetadata ? renderPanelState('Đang tải phần làm rõ khái niệm...') : metadataError ? renderPanelState(metadataError) : questions.length === 0 ? renderPanelState('Chưa có dữ liệu làm rõ khái niệm.') : (
                       <div className="space-y-8">
                          {questions.map((item, i) => (
                            <div key={i} className="bg-white border-2 border-slate-50 rounded-[40px] p-10 shadow-lg hover:shadow-2xl transition-all">
                               <div className="flex items-center gap-4 mb-8">
                                  <div className="w-14 h-14 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500">
                                     <HelpCircle size={28} />
                                  </div>
                                  <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Công cụ làm rõ</span>
                               </div>
                               <div className="grid md:grid-cols-2 gap-10 items-start">
                                  <div className="opacity-50">
                                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ngữ cảnh gốc</p>
                                     <p className="text-base font-bold text-slate-500 line-through leading-relaxed">{item.original}</p>
                                  </div>
                                  <div className="p-8 bg-amber-50/50 rounded-[32px] border border-amber-100 relative">
                                     <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Sparkles size={40} className="text-amber-500" />
                                     </div>
                                     <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3">Cách hiểu trực quan</p>
                                     <p className="text-xl font-black text-slate-900 leading-tight">{item.rephrased}</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                       )
                     )}

                     {activeTab === 'flashcards' && (
                       <div className="space-y-6">
                          {isLoadingMetadata && renderPanelState('Đang tải thẻ ghi nhớ...')}
                          {!isLoadingMetadata && metadataError && renderPanelState(metadataError)}
                          {!isLoadingMetadata && !metadataError && flashcards.length === 0 && renderPanelState('Chưa có thẻ ghi nhớ.')}
                          {!isLoadingMetadata && !metadataError && flashcards.length > 0 && (
                            <>
                              <div className="flex items-center justify-center">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-black">
                                  Thẻ {currentFlashcardIndex + 1} / {flashcards.length}
                                </p>
                              </div>

                              <div className="relative [perspective:1200px] flex justify-center">
                                <Sparkle className="absolute -top-5 left-[16%] w-5 h-5 text-[#FF4F6E]/65 dark:text-pink-300/70" />
                                <Brain className="absolute top-[18%] -left-2 w-5 h-5 text-indigo-500/55 dark:text-indigo-300/70" />
                                <Lightbulb className="absolute top-[20%] -right-2 w-5 h-5 text-amber-500/60 dark:text-amber-300/75" />
                                <Rocket className="absolute -bottom-5 right-[14%] w-5 h-5 text-emerald-500/60 dark:text-emerald-300/70" />
                                <button
                                  key={flashcards[currentFlashcardIndex].id || currentFlashcardIndex}
                                  onPointerDown={(e) => {
                                    dragStartXRef.current = e.clientX;
                                    dragMovedRef.current = false;
                                    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                                  }}
                                  onPointerMove={(e) => {
                                    if (dragStartXRef.current === null) return;
                                    const delta = e.clientX - dragStartXRef.current;
                                    if (Math.abs(delta) > 4) dragMovedRef.current = true;
                                    setDragOffsetX(delta);
                                  }}
                                  onPointerUp={() => {
                                    const threshold = 70;
                                    if (dragOffsetX <= -threshold) {
                                      setIsFlashcardFlipped(false);
                                      setCurrentFlashcardIndex((prev) => (prev + 1) % flashcards.length);
                                    } else if (dragOffsetX >= threshold) {
                                      setIsFlashcardFlipped(false);
                                      setCurrentFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
                                    } else if (!dragMovedRef.current) {
                                      setIsFlashcardFlipped((prev) => !prev);
                                    }
                                    dragStartXRef.current = null;
                                    dragMovedRef.current = false;
                                    setDragOffsetX(0);
                                  }}
                                  onPointerCancel={() => {
                                    dragStartXRef.current = null;
                                    dragMovedRef.current = false;
                                    setDragOffsetX(0);
                                  }}
                                  className="block w-full max-w-[380px] mx-auto aspect-[3/4] rounded-[32px] text-left focus:outline-none focus:ring-2 focus:ring-[#FF4F6E]/40 animate-in fade-in slide-in-from-bottom-4 duration-300 touch-pan-y select-none"
                                  aria-label="Flip flashcard"
                                  style={{
                                    transform: `translateX(${dragOffsetX}px) rotate(${dragOffsetX * 0.03}deg)`,
                                    transition: dragStartXRef.current === null ? 'transform 180ms ease-out' : 'none',
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500",
                                      isFlashcardFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
                                    )}
                                  >
                                    <div className="absolute inset-0 rounded-[32px] border border-slate-200 shadow-lg [backface-visibility:hidden] overflow-hidden">
                                      <Image
                                        src={flashcardBackgroundImages[currentFlashcardIndex % flashcardBackgroundImages.length]}
                                        alt="Flashcard background"
                                        fill
                                        className="object-cover"
                                        unoptimized={true}
                                      />
                                      <div className="absolute inset-0 bg-white/52 dark:bg-slate-900/50" />
                                      <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
                                        <div className="absolute top-4 right-4 rounded-full bg-white/55 dark:bg-slate-900/45 p-1.5 border border-white/50 dark:border-slate-400/30">
                                          <Sparkle size={14} className="text-[#FF4F6E] dark:text-pink-300" />
                                        </div>
                                        <div className="absolute bottom-4 left-4 rounded-full bg-white/50 dark:bg-slate-900/45 p-1.5 border border-white/50 dark:border-slate-400/30">
                                          <Lightbulb size={14} className="text-amber-500 dark:text-amber-300" />
                                        </div>
                                        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300 font-black mb-3">Câu hỏi</p>
                                        <p className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-50 leading-snug">
                                        {flashcards[currentFlashcardIndex].front}
                                        </p>
                                        {flashcards[currentFlashcardIndex].hint ? (
                                          <p className="absolute bottom-8 left-8 right-8 text-[11px] md:text-xs font-bold text-slate-600 dark:text-slate-200 text-center">
                                            Gợi ý: {flashcards[currentFlashcardIndex].hint}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>

                                    <div className="absolute inset-0 rounded-[32px] border border-slate-800 shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
                                      <Image
                                        src={flashcardBackgroundImages[currentFlashcardIndex % flashcardBackgroundImages.length]}
                                        alt="Flashcard background back"
                                        fill
                                        className="object-cover"
                                        unoptimized={true}
                                      />
                                      <div className="absolute inset-0 bg-slate-900/58 dark:bg-slate-950/64" />
                                      <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
                                        <div className="absolute top-4 right-4 rounded-full bg-black/35 dark:bg-white/10 p-1.5 border border-white/25">
                                          <Brain size={14} className="text-cyan-200 dark:text-cyan-300" />
                                        </div>
                                        <div className="absolute bottom-4 left-4 rounded-full bg-black/30 dark:bg-white/10 p-1.5 border border-white/25">
                                          <Rocket size={14} className="text-emerald-200 dark:text-emerald-300" />
                                        </div>
                                        <p className="text-xs uppercase tracking-[0.15em] text-slate-300 font-black mb-3">Đáp án</p>
                                        <p className="text-base md:text-lg font-black text-white dark:text-slate-50 leading-snug">
                                          {flashcards[currentFlashcardIndex].back}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </div>
                              <p className="text-center text-[11px] text-slate-400 font-bold">
                                Kéo trái/phải để chuyển thẻ. Chạm để lật thẻ.
                              </p>
                            </>
                          )}
                       </div>
                     )}

                     {activeTab === 'visuals' && (
                       <div className="space-y-6">
                          {isLoadingMetadata ? renderPanelState('Đang tải infographic...') : metadataError ? renderPanelState(metadataError) : visualData?.infographic ? (
                            <InfographicViewer data={visualData.infographic} />
                          ) : (
                            renderPanelState('Chưa có dữ liệu trực quan hóa.')
                          )}
                       </div>
                     )}


                     {activeTab === 'handsign' && (
                       <div className="space-y-8">
                         {isLoadingMetadata ? (
                           renderPanelState('Đang tải dữ liệu avatar VSL...')
                         ) : handsignGlosses.length === 0 ? (
                           renderPanelState('Chưa có dữ liệu avatar VSL. Dữ liệu sẽ xuất hiện sau khi server xử lý xong video này.')
                         ) : (
                           <>
                             <div className="rounded-3xl border border-slate-200 bg-white p-5">
                               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                 <div>
                                   <p className="text-sm font-black text-slate-900">Generate Video</p>
                                   <p className="text-xs font-bold text-slate-500">
                                     Tạo video avatar từ dữ liệu VSL của bài học này.
                                   </p>
                                 </div>
                                 <button
                                   type="button"
                                   onClick={handleGenerateAvatarVideo}
                                   disabled={isGeneratingAvatar}
                                   className={cn(
                                     'rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all',
                                     isGeneratingAvatar
                                       ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                                       : 'bg-[#FF4F6E] text-white hover:bg-[#e64663]'
                                   )}
                                 >
                                   {isGeneratingAvatar ? 'Generating...' : 'Generate Video'}
                                 </button>
                               </div>
                               {avatarError && (
                                 <p className="mt-3 text-sm font-bold text-red-600">{avatarError}</p>
                               )}
                             </div>

                             {avatarVideoUrl && (
                               <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                 <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
                                   Avatar Video Preview
                                 </p>
                                 <video
                                   controls
                                   className="w-full rounded-2xl bg-black"
                                   src={avatarVideoUrl}
                                 />
                               </div>
                             )}

                             <div className="flex flex-col items-center gap-4">
                               <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400 font-black text-center">
                                 Đồng bộ theo thời gian phát video
                               </p>
                               <SignAvatar2D vslData={handsignGlosses} currentTime={currentTime} />
                               <button
                                 type="button"
                                 onClick={handleDownloadHandsSignExport}
                                 className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                               >
                                 <Download size={14} />
                                 Tải manifest render (JSON)
                               </button>
                             </div>
                             <div>
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Chuỗi gloss</p>
                               <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
                                 {handsignGlosses.map((g, i) => {
                                   const nextT = handsignGlosses[i + 1]?.time ?? Infinity;
                                   const isGlossActive = currentTime >= g.time && currentTime < nextT;
                                   return (
                                     <button
                                       key={`${g.time}-${g.word}-${i}`}
                                       type="button"
                                       onClick={() => seekToSeconds(g.time)}
                                       className={cn(
                                         'text-xs font-bold px-3 py-2 rounded-2xl border transition-all',
                                         isGlossActive
                                           ? 'bg-[#FF4F6E] text-white border-[#FF4F6E]'
                                           : 'bg-white text-slate-600 border-slate-200 hover:border-[#FF4F6E]/40'
                                       )}
                                     >
                                       {g.word.replace(/_/g, ' ')}
                                       <span className="opacity-70 ml-1 tabular-nums">{formatTime(g.time)}</span>
                                     </button>
                                   );
                                 })}
                               </div>
                             </div>
                           </>
                         )}
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Dynamic Panel (Transcript or Lessons) */}
          <div className="lg:col-span-5 relative">
             <div className="sticky top-28 bg-white/95 backdrop-blur-md border border-white/20 rounded-[40px] shadow-2xl shadow-slate-200/40 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
                
                {/* Panel Tabs */}
                <div className="flex border-b border-slate-50">
                   <button 
                     onClick={() => setRightPanelTab('transcript')}
                     className={cn(
                       "flex-1 py-8 flex items-center justify-center gap-3 transition-all",
                       rightPanelTab === 'transcript' ? "bg-white text-slate-900" : "bg-slate-50 text-slate-400 hover:text-slate-600"
                     )}
                   >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", rightPanelTab === 'transcript' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-200 text-slate-500")}>
                         <FileText size={20} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">Phụ đề</span>
                   </button>
                   <button 
                     onClick={() => setRightPanelTab('lessons')}
                     className={cn(
                       "flex-1 py-8 flex items-center justify-center gap-3 transition-all",
                       rightPanelTab === 'lessons' ? "bg-white text-slate-900" : "bg-slate-50 text-slate-400 hover:text-slate-600"
                     )}
                   >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", rightPanelTab === 'lessons' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-200 text-slate-500")}>
                         <List size={20} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">Bài học</span>
                   </button>
                </div>
                <div className="px-8 pt-4">
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {["vi", "en"].map((lang) => {
                      const enabled = Array.isArray(segmentsByLanguage[lang]) && segmentsByLanguage[lang].length > 0;
                      return (
                        <button
                          key={lang}
                          type="button"
                          disabled={!enabled}
                          onClick={() => enabled && setLanguage(lang)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-colors",
                            language === lang ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                            !enabled && "opacity-40 cursor-not-allowed hover:text-slate-500"
                          )}
                        >
                          {lang.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                   {rightPanelTab === 'transcript' ? (
                     <>
                        {isLoadingTranscript && renderPanelState('Đang tải phụ đề...')}
                        {!isLoadingTranscript && segments.length === 0 && renderPanelState('Chưa có phụ đề.')}
                        {segments.map((s, i) => {
                           const isActive = currentTime >= s.start && currentTime <= s.end;
                           return (
                              <div 
                                key={i} 
                                onClick={() => seekTo(formatTime(s.start))}
                                className={cn(
                                  "p-6 rounded-[32px] transition-all cursor-pointer group relative",
                                  isActive ? "bg-[#FF4F6E] text-white shadow-2xl shadow-[#FF4F6E]/30 scale-[1.02]" : "hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-600"
                                )}
                              >
                                 <span className={cn(
                                   "text-[10px] font-black uppercase tracking-[0.2em] mb-3 block",
                                   isActive ? "text-white/70" : "text-[#FF4F6E]"
                                 )}>
                                   {formatTime(s.start)}
                                 </span>
                                 <p className={cn(
                                   "text-base leading-relaxed",
                                   isActive ? "font-black" : "font-bold"
                                 )}>
                                    {s.text}
                                 </p>
                                 {isActive && (
                                   <div className="absolute top-8 right-8 animate-ping w-3 h-3 bg-white rounded-full" />
                                 )}
                              </div>
                           );
                        })}
                     </>
                   ) : (
                     <div className="space-y-4">
                        {[
                           { id: 'vid-001', title: 'Bắt đầu với lập trình', duration: '12:45', thumb: 'https://picsum.photos/seed/v1/200/120' },
                           { id: 'vid-002', title: 'Nền tảng Deep Learning', duration: '15:20', thumb: 'https://picsum.photos/seed/v2/200/120' },
                           { id: 'vid-003', title: 'Giới thiệu Machine Learning', duration: '22:10', thumb: 'https://picsum.photos/seed/v3/200/120' },
                           { id: 'vid-004', title: 'AI cho người học trực quan', duration: '08:45', thumb: 'https://picsum.photos/seed/v4/200/120' },
                           { id: 'vid-005', title: 'Mạng nơ-ron nâng cao', duration: '30:15', thumb: 'https://picsum.photos/seed/v5/200/120' },
                           { id: 'vid-006', title: 'Ứng dụng AI thực tiễn', duration: '18:30', thumb: 'https://picsum.photos/seed/v6/200/120' },
                        ].map((lesson, idx) => (
                           <div 
                             key={lesson.id}
                             onClick={() => {
                               window.location.href = `/student/videos/${lesson.id}`;
                             }}
                             className={cn(
                               "flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border-2",
                               videoId === lesson.id ? "border-[#FF4F6E] bg-white shadow-lg" : "border-transparent hover:bg-slate-50"
                             )}
                           >
                              <div className="relative w-24 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                 <Image src={lesson.thumb} alt={lesson.title} fill className="object-cover" unoptimized={true} />
                                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play size={16} className="text-white" fill="currentColor" />
                                 </div>
                              </div>
                              <div className="space-y-1">
                                 <h4 className={cn("text-xs font-black leading-tight", videoId === lesson.id ? "text-slate-900" : "text-slate-500")}>
                                    {idx + 1}. {lesson.title}
                                 </h4>
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <Clock size={10} />
                                    {lesson.duration}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                   <div className="inline-flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Đồng bộ trực tiếp: {language.toUpperCase()}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
      <style jsx global>{`
        @keyframes captionWordPop {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.86);
          }
          70% {
            opacity: 1;
            transform: translateY(-2px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .caption-word-pop {
          animation: captionWordPop 260ms ease-out both;
        }
      `}</style>
    </div>
  );
}
