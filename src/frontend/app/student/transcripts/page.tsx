'use client';

import React from 'react';
import { FileText, Download, Edit3, Trash2, Search, Filter } from 'lucide-react';
import { StatusBadge, type Status } from '@/components/ui/StatusBadge';

// Giả lập dữ liệu cho bản ghi (transcripts)
const mockTranscripts = [
  { id: 'tr-1', title: 'Lịch sử Cận đại - Buổi 1', classGroup: '11A2', date: '25/04/2026', duration: '45:00', status: 'ready', words: '3,420' },
  { id: 'tr-2', title: 'Toán Đại số - Hệ phương trình', classGroup: '10A1', date: '24/04/2026', duration: '50:15', status: 'ready', words: '2,890' },
  { id: 'tr-3', title: 'Sinh học tế bào - Phần 2', classGroup: '12B1', date: '22/04/2026', duration: '30:00', status: 'processing', words: '--' },
];

export default function TranscriptsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <FileText size={28} />
          </div>
          Quản lý phụ đề
        </h1>
        <p className="text-neutral mt-2">Xem lại, chỉnh sửa và tải xuống bản ghi chép từ các lớp học LIVE trước đó.</p>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm buổi học..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral/5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl font-medium text-neutral hover:bg-neutral/5 transition-all">
            <Filter size={18} />
            Lọc kết quả
          </button>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 border-b">
                <th className="px-6 py-4">Buổi học</th>
                <th className="px-6 py-4">Lớp</th>
                <th className="px-6 py-4">Ngày lưu</th>
                <th className="px-6 py-4">Số từ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockTranscripts.map((tr) => (
                <tr key={tr.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-text">{tr.title}</p>
                    <p className="text-xs text-neutral">{tr.duration}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{tr.classGroup}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral">{tr.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{tr.words}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tr.status as Status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button disabled={tr.status !== 'ready'} className="p-2 text-neutral hover:text-primary hover:bg-primary-soft rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Chỉnh sửa">
                        <Edit3 size={18} />
                      </button>
                      <button disabled={tr.status !== 'ready'} className="p-2 text-neutral hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Tải xuống DOCX/TXT">
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
        </div>
      </div>
    </div>
  );
}
