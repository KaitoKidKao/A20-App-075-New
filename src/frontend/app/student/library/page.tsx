'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Video, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Eye, 
  Trash2,
  Clock,
  PlayCircle,
  FileText,
  BarChart2,
  TrendingUp,
  BookOpen
} from 'lucide-react';

export default function TeacherLibrary() {
  const [activeTab, setActiveTab] = useState('videos');

  const stats = [
    { label: 'Bài giảng đã lưu', value: '24', icon: BookOpen, color: 'text-primary' },
    { label: 'Thời gian học tập', value: '12.5h', icon: Clock, color: 'text-blue-500' },
    { label: 'Độ chính xác caption', value: '98%', icon: BarChart2, color: 'text-emerald-500' },
    { label: 'Tiến độ tuần', value: '+12%', icon: TrendingUp, color: 'text-amber-500' },
  ];

  const videos = [
    { id: 1, title: 'Đạo hàm và vi phân — Toán học 12', subject: 'Toán học', status: 'Sẵn sàng', views: 65, date: '22/04/2026', duration: '45:20' },
    { id: 2, title: 'Phương trình hóa học — Hóa hữu cơ', subject: 'Hóa học', status: 'Đang xử lý', views: 0, date: '22/04/2026', duration: '38:15' },
    { id: 3, title: 'Văn học hiện đại Việt Nam', subject: 'Ngữ văn', status: 'Sẵn sàng', views: 47, date: '22/04/2026', duration: '62:00' },
    { id: 4, title: 'Vật lý lượng tử cơ bản', subject: 'Vật lý', status: 'Lỗi', views: 87, date: '22/04/2026', duration: '55:00' },
  ];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Welcome & Study Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Thư viện bài giảng</h1>
          <p className="text-neutral text-lg font-medium">Chào buổi tối, Nguyễn Minh. Bạn muốn học bài nào hôm nay?</p>
        </div>
        
        <Link href="/student/upload" className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-700 transition-all">
          <Video size={20} />
          <span>Tải bài giảng mới</span>
        </Link>
      </div>

      {/* Simplified Study Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-2xl border border-border/60 shadow-subtle flex flex-col gap-3">
            <div className={`${stat.color} bg-slate-50 w-10 h-10 rounded-lg flex items-center justify-center`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-sm text-neutral font-semibold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area - Focused Reading Library */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-secondary-bg p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'videos' ? 'bg-white text-primary shadow-sm' : 'text-neutral hover:text-text'}`}
            >
              Video Bài Giảng
            </button>
            <button 
              onClick={() => setActiveTab('docs')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'docs' ? 'bg-white text-primary shadow-sm' : 'text-neutral hover:text-text'}`}
            >
              Tài Liệu Đọc
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" size={16} />
              <input 
                type="text" 
                placeholder="Tìm nội dung học tập..." 
                className="pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all w-[240px]"
              />
            </div>
            <button className="p-2 border border-border rounded-lg hover:bg-bg transition-colors text-neutral">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-neutral text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Tên bài giảng</th>
                <th className="px-4 py-4">Môn học</th>
                <th className="px-4 py-4 text-center">Trạng thái AI</th>
                <th className="px-4 py-4 text-center">Thời lượng</th>
                <th className="px-8 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {videos.map((video) => (
                <tr key={video.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-border group-hover:border-primary/20">
                        <PlayCircle size={24} className="text-neutral group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="font-bold text-text group-hover:text-primary transition-colors">{video.title}</p>
                        <p className="text-xs text-neutral font-medium">{video.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                      {video.subject}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        video.status === 'Sẵn sàng' ? 'bg-emerald-50 text-emerald-700' : 
                        video.status === 'Đang xử lý' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          video.status === 'Sẵn sàng' ? 'bg-emerald-600' : 
                          video.status === 'Đang xử lý' ? 'bg-blue-600 animate-pulse' : 'bg-red-600'
                        }`} />
                        {video.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center text-sm font-medium text-neutral">
                    {video.duration}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all hover:shadow-sm" title="Xem bài giảng">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all hover:shadow-sm" title="Tải tài liệu">
                        <Download size={18} />
                      </button>
                      <button className="p-2 hover:bg-white hover:text-red-600 rounded-lg transition-all hover:shadow-sm" title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-border bg-slate-50/30 flex items-center justify-between">
          <p className="text-sm text-neutral font-medium">Đang hiển thị 1 – 4 của 24 bài giảng</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold text-neutral hover:bg-white disabled:opacity-50" disabled>Trước</button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm">1</button>
            <button className="px-4 py-2 border border-border rounded-lg text-sm font-bold text-neutral hover:bg-white">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
