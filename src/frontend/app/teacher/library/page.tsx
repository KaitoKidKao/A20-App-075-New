'use client';

import React, { useState } from 'react';
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
  Download,
  Radio,
  FileText,
  Headphones,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { mockLectures } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data for Documents since it's a new feature
const mockDocuments = [
  { id: 'doc-1', title: 'Chương 1: Mở đầu về Cơ học', subject: 'Vật lý', type: 'PDF', status: 'ready', date: '25/04/2026', size: '2.4 MB', duration: '15:20' },
  { id: 'doc-2', title: 'Đề cương ôn tập Toán Cao cấp', subject: 'Toán', type: 'DOCX', status: 'processing', date: '24/04/2026', size: '1.1 MB', duration: '--:--' },
  { id: 'doc-3', title: 'Bài giảng Lịch sử Đảng', subject: 'Lịch sử', type: 'PDF', status: 'ready', date: '20/04/2026', size: '5.6 MB', duration: '45:10' },
];

export default function TeacherLibraryPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'documents'>('videos');

  const stats = [
    { label: 'Tổng bài giảng', value: '24', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lượt xem (Tuần)', value: '1,234', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Thời gian AI xử lý', value: '2.4m', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tỷ lệ dùng Caption', value: '94%', icon: BarChart3, color: 'text-primary', bg: 'bg-primary-soft' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Quick Actions */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Bảng điều khiển Giáo viên</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/teacher/upload" className="group bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">Tải lên Video</h3>
              <p className="text-sm text-neutral">Phân tích caption & tóm tắt</p>
            </div>
          </Link>

          <Link href="/teacher/documents" className="group bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md hover:text-blue-600 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">Chuyển đổi Tài liệu</h3>
              <p className="text-sm text-neutral">Tạo Audio từ PDF/DOCX</p>
            </div>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Library */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="text-primary" size={24} /> 
            Thư viện nội dung
          </h2>
          
          <div className="flex bg-neutral/10 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('videos')}
              className={cn("px-6 py-2 text-sm font-semibold rounded-lg transition-all", activeTab === 'videos' ? "bg-white text-text shadow-sm" : "text-neutral hover:text-text")}
            >
              Video Bài Giảng
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={cn("px-6 py-2 text-sm font-semibold rounded-lg transition-all", activeTab === 'documents' ? "bg-white text-text shadow-sm" : "text-neutral hover:text-text")}
            >
              Tài liệu Âm thanh
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'videos' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <th className="px-6 py-4">Video Bài Giảng</th>
                  <th className="px-6 py-4">Môn / Lớp</th>
                  <th className="px-6 py-4">Trạng thái AI</th>
                  <th className="px-6 py-4">Lượt xem</th>
                  <th className="px-6 py-4">Ngày tải</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockLectures.map((lecture) => (
                  <tr key={lecture.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden border border-border relative shrink-0">
                          {lecture.thumbnail ? (
                            <img src={lecture.thumbnail} className="w-full h-full object-cover opacity-80" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Video size={16} className="text-neutral/50" /></div>
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
                          <div className="h-full bg-primary" style={{ width: `${Math.random() * 80 + 20}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{Math.floor(Math.random() * 100)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-neutral">22/04/2026</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/videos/${lecture.id}`} className="p-2 text-neutral hover:text-primary hover:bg-primary-soft rounded-lg transition-all" title="Xem video">
                          <Eye size={18} />
                        </Link>
                        <button className="p-2 text-neutral hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Tải xuống transcript">
                          <Download size={18} />
                        </button>
                        <button className="p-2 text-neutral hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <th className="px-6 py-4">Tài liệu Gốc</th>
                  <th className="px-6 py-4">Môn học</th>
                  <th className="px-6 py-4">Định dạng</th>
                  <th className="px-6 py-4">Trạng thái Audio</th>
                  <th className="px-6 py-4">Ngày chuyển đổi</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockDocuments.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate max-w-[200px]">{doc.title}</p>
                          <p className="text-xs text-neutral">{doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{doc.subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-neutral/10 text-neutral font-mono text-xs rounded uppercase">{doc.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.status === 'ready' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                          <CheckCircle2 size={14} /> Hoàn tất ({doc.duration})
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                          <AlertCircle size={14} className="animate-pulse" /> Đang xử lý
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-neutral">{doc.date}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button disabled={doc.status !== 'ready'} className="p-2 text-neutral hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Nghe thử">
                          <Headphones size={18} />
                        </button>
                        <button disabled={doc.status !== 'ready'} className="p-2 text-neutral hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Tải xuống MP3">
                          <Download size={18} />
                        </button>
                        <button className="p-2 text-neutral hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-6 border-t border-border flex items-center justify-between text-sm text-neutral">
          <p>Hiển thị 1 - {activeTab === 'videos' ? mockLectures.length : mockDocuments.length} mục</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-slate-50" disabled>Trước</button>
            <button className="px-3 py-1 border rounded-lg bg-primary text-white font-bold">1</button>
            <button className="px-3 py-1 border rounded-lg hover:bg-slate-50 transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
