'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, FileText, CheckCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Tổng số sinh viên', value: '342', trend: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Giờ phát Live', value: '45h', trend: '+5%', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Tài liệu đã chuyển đổi', value: '89', trend: '+22%', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Tỷ lệ hoàn thành AI', value: '98%', trend: '+1%', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="text-primary" />
          Thống kê & Phân tích
        </h1>
        <p className="text-neutral mt-2">Theo dõi chỉ số tương tác và hiệu quả hệ thống hỗ trợ sinh viên.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={14} />
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-neutral text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-4">Lưu lượng truy cập hệ thống trợ năng</h3>
          <div className="flex-1 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-neutral/5">
            <p className="text-neutral text-sm flex flex-col items-center gap-2">
              <BarChart3 size={40} className="text-neutral/40" />
              <span>Biểu đồ sẽ được tích hợp với dữ liệu Backend</span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-4">Tỷ lệ mô hình AI sử dụng</h3>
          <div className="flex-1 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-neutral/5">
            <div className="space-y-4 w-full px-6">
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium"><span>Chandra OCR API</span><span>60%</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium"><span>Local Hunyuan</span><span>30%</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{width: '30%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium"><span>PyMuPDF Fallback</span><span>10%</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-neutral-400 h-2 rounded-full" style={{width: '10%'}}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
