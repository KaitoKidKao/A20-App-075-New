'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Presentation, Download, ArrowRight, FileSliders, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';

type SlideRecord = {
  id: string;
  video_id: string;
  video_title: string;
  filename: string;
  template_id: string;
  num_slides: number;
  download_url: string;
  created_at: string;
};

export default function StudentSlidesPage() {
  const [slides, setSlides] = useState<SlideRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await api.videos.getAllSlideHistory();
      setSlides(data);
    } catch (err) {
      console.error('Failed to fetch slide history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Group slides by video
  const grouped = slides.reduce<Record<string, { title: string; items: SlideRecord[] }>>((acc, item) => {
    if (!acc[item.video_id]) {
      acc[item.video_id] = { title: item.video_title, items: [] };
    }
    acc[item.video_id].items.push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10 md:px-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl tracking-tight">Slide đã tạo</h1>
            <p className="mt-1 text-sm font-bold text-slate-400">
              Tất cả các file PPTX bạn đã tạo bằng AI, được lưu trữ để tải về bất cứ lúc nào.
            </p>
          </div>
          <button
            onClick={fetchSlides}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-[#FF4F6E] hover:text-[#FF4F6E] transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FF4F6E] rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold">Đang tải danh sách slide...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && slides.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[32px] border border-dashed border-slate-200 shadow-sm">
            <FileSliders size={56} className="mb-5 opacity-20" />
            <h3 className="text-lg font-extrabold text-slate-600 mb-2">Chưa có slide nào</h3>
            <p className="text-sm font-bold max-w-sm text-center mb-6">
              Bạn chưa tạo slide nào. Hãy vào một bài học và dùng tính năng <strong>Tạo Slide AI</strong> để bắt đầu!
            </p>
            <Link
              href="/student/library"
              className="flex items-center gap-2 px-6 py-3 bg-[#FF4F6E] text-white rounded-2xl font-extrabold text-sm uppercase tracking-widest shadow-lg shadow-[#FF4F6E]/30 hover:scale-[1.03] transition-all"
            >
              Vào thư viện bài học
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Grouped by video */}
        {!loading && Object.entries(grouped).map(([videoId, group]) => (
          <div key={videoId} className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
            {/* Video header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF4F6E]/10 rounded-xl flex items-center justify-center text-[#FF4F6E] shrink-0">
                  <Presentation size={20} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800 leading-tight">{group.title}</p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{group.items.length} slide đã tạo</p>
                </div>
              </div>
              <Link
                href={`/student/videos/${videoId}`}
                className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF4F6E] uppercase tracking-wider hover:underline"
              >
                Xem bài học
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Slide list */}
            <div className="divide-y divide-slate-50">
              {group.items.map((item) => {
                const date = new Date(item.created_at);
                const label = `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
                return (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-slate-700">
                        Mẫu {item.template_id.replace('template_', '')}
                        <span className="ml-2 text-xs font-bold text-slate-400">· {item.num_slides} trang</span>
                      </p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{label}</p>
                    </div>
                    <a
                      href={`${API_BASE_URL}${item.download_url}`}
                      download
                      className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                    >
                      <Download size={14} />
                      Tải về
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
