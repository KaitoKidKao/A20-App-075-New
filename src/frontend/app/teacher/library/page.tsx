'use client';

import React from 'react';
import { 
  Plus, 
  BarChart3, 
  Users, 
  Clock, 
  Video,
  MoreVertical,
  Eye,
  Share2,
  Trash2,
  Download
} from 'lucide-react';
import { mockLectures } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TeacherLibraryPage() {
  const stats = [
    { label: 'Tổng bài giảng', value: '24', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lượt xem (Tuần)', value: '1,234', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Thời gian AI xử lý', value: '2.4m', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tỷ lệ dùng Caption', value: '94%', icon: BarChart3, color: 'text-primary', bg: 'bg-primary-soft' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thư viện bài giảng</h1>
          <p className="text-neutral mt-1">Quản lý nội dung giảng dạy và theo dõi hiệu quả trợ năng.</p>
        </div>
        <Link 
          href="/teacher/upload" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary/95 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Tải bài giảng mới</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Danh sách bài giảng</h2>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold border rounded-xl hover:bg-slate-50 transition-colors">Bộ lọc</button>
            <button className="px-4 py-2 text-sm font-semibold border rounded-xl hover:bg-slate-50 transition-colors">Xuất báo cáo</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b">
                <th className="px-6 py-4">Bài giảng</th>
                <th className="px-6 py-4">Môn / Lớp</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Sinh viên xem</th>
                <th className="px-6 py-4">Ngày tải</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockLectures.map((lecture) => (
                <tr key={lecture.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden border border-border relative shrink-0">
                        {lecture.thumbnail && (
                          <img src={lecture.thumbnail} className="w-full h-full object-cover opacity-80" alt="" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate max-w-[200px]">{lecture.title}</p>
                        <p className="text-xs text-neutral">{lecture.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{lecture.subject}</span>
                      <span className="text-xs text-neutral">{lecture.classGroup}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lecture.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${Math.random() * 80 + 20}%` }} />
                      </div>
                      <span className="text-sm font-semibold">{Math.floor(Math.random() * 100)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-neutral">22/04/2026</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-neutral hover:text-primary hover:bg-primary-soft rounded-lg transition-all" title="Xem kết quả">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-neutral hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Tải xuống transcript">
                        <Download size={18} />
                      </button>
                      <div className="relative group/menu">
                        <button className="p-2 text-neutral hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-6 border-t border-border flex items-center justify-between text-sm text-neutral">
          <p>Hiển thị 1 - {mockLectures.length} trong số 24 bài giảng</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-lg disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 border rounded-lg bg-primary text-white font-bold">1</button>
            <button className="px-3 py-1 border rounded-lg hover:bg-slate-50 transition-colors">2</button>
            <button className="px-3 py-1 border rounded-lg hover:bg-slate-50 transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
