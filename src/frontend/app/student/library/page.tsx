'use client';

import React, { useState } from 'react';
import { Search, Filter, Play, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { mockLectures } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StudentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');

  const filteredLectures = mockLectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'Tất cả' || lecture.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['Tất cả', 'Toán', 'Lý', 'Hóa', 'Văn', 'Anh'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thư viện học liệu</h1>
          <p className="text-neutral mt-1">Chào mừng bạn quay lại! Hãy tiếp tục hành trình học tập của mình.</p>
        </div>
        <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border shadow-sm">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-neutral font-medium uppercase tracking-wider">Bài giảng đã xem</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài giảng, giảng viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border focus:ring-4 focus:ring-primary/5 focus:border-primary rounded-2xl outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border",
                selectedSubject === subject 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-card text-neutral border-border hover:border-primary/50 hover:text-primary"
              )}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {filteredLectures.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => (
            <Link 
              key={lecture.id} 
              href={lecture.status === 'ready' ? `/videos/${lecture.id}` : '#'}
              className={cn(
                "group flex flex-col bg-card rounded-2xl border border-border shadow-sm hover:shadow-elevated transition-all overflow-hidden",
                lecture.status !== 'ready' && "opacity-80 cursor-not-allowed"
              )}
            >
              {/* Thumbnail Area */}
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                {lecture.thumbnail ? (
                  <img 
                    src={lecture.thumbnail} 
                    alt={lecture.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <GraduationCap size={48} className="text-neutral/20" />
                  </div>
                )}
                
                {/* Overlay on ready */}
                {lecture.status === 'ready' && (
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-primary p-4 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <StatusBadge status={lecture.status} />
                </div>
                
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                  {lecture.duration}
                </div>

                {lecture.status === 'processing' && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6">
                    <div className="w-full max-w-[120px] h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-primary animate-progress" style={{ width: `${lecture.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Đang xử lý {lecture.progress}%</span>
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                    {lecture.subject}
                  </span>
                  <span className="text-[10px] font-bold text-neutral">
                    {lecture.classGroup}
                  </span>
                </div>
                <h3 className="font-bold text-text mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {lecture.title}
                </h3>
                
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <GraduationCap size={12} className="text-slate-500" />
                    </div>
                    <span className="text-xs text-neutral">{lecture.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral">
                    <Clock size={12} />
                    <span className="text-[10px] font-medium">Hôm qua</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-dashed border-border">
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <Search size={48} className="text-neutral/20" />
          </div>
          <h3 className="text-xl font-bold">Không tìm thấy bài giảng nào</h3>
          <p className="text-neutral mt-2">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedSubject('Tất cả');}}
            className="mt-6 text-primary font-bold hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
