'use client';

import React from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  Users, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminDashboardPage() {
  const kpis = [
    { label: 'Jobs đang xử lý', value: '4', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12%', isUp: true },
    { label: 'Jobs hàng đợi', value: '12', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', trend: '-2', isUp: false },
    { label: 'WER trung bình', value: '3.8%', icon: Zap, color: 'text-green-600', bg: 'bg-green-50', trend: '-0.4%', isUp: false },
    { label: 'ASR Latency', value: '1.2s', icon: Cpu, color: 'text-primary', bg: 'bg-primary-soft', trend: '+0.1s', isUp: true },
    { label: 'Users Active', value: '248', icon: Users, color: 'text-slate-600', bg: 'bg-slate-50', trend: '+24', isUp: true },
    { label: 'Storage Used', value: '1.2 TB', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '84%', isUp: true },
  ];

  const jobs = [
    { id: 'JOB-8821', type: 'Video', status: 'processing', model: 'Whisper-L3', start: '14:20:05', time: '12:30' },
    { id: 'JOB-8820', type: 'Live', status: 'live', model: 'Whisper-Small', start: '14:05:10', time: '27:25' },
    { id: 'JOB-8819', type: 'Video', status: 'ready', model: 'Whisper-L3', start: '13:50:22', time: '04:15' },
    { id: 'JOB-8818', type: 'Audio', status: 'error', model: 'Whisper-L3', start: '13:45:00', time: '01:02' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral mt-1">Trạng thái hệ thống và hiệu năng mô hình AI theo thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">System Healthy</span>
          </div>
          <button className="px-4 py-2 text-sm font-bold bg-card border rounded-xl hover:bg-slate-50 transition-colors">
            Cấu hình ASR
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card p-5 rounded-3xl border shadow-sm">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", kpi.bg, kpi.color)}>
              <kpi.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral">{kpi.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-xl font-bold">{kpi.value}</p>
              <span className={cn(
                "text-[10px] font-bold flex items-center",
                kpi.isUp ? "text-green-600" : "text-red-600"
              )}>
                {kpi.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Job Queue Table */}
        <div className="lg:col-span-2 bg-card rounded-3xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Hàng đợi xử lý</h2>
            <button className="text-sm font-bold text-primary hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                  <th className="px-6 py-4">Job ID</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Mô hình</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Bắt đầu</th>
                  <th className="px-6 py-4">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs">{job.id}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase">{job.type}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">{job.model}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status as any} />
                    </td>
                    <td className="px-6 py-4 text-neutral">{job.start}</td>
                    <td className="px-6 py-4 font-mono text-xs">{job.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Performance Card */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold">Hiệu năng Mô hình</h2>
            <div className="space-y-4">
              {[
                { name: 'Độ chính xác Vietnamese', val: 96, color: 'bg-primary' },
                { name: 'Độ chính xác English', val: 92, color: 'bg-blue-500' },
                { name: 'VAD Sensitivity', val: 75, color: 'bg-amber-500' },
                { name: 'Max Concurrent Jobs', val: 40, color: 'bg-slate-400' },
              ].map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral">{m.name}</span>
                    <span>{m.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 rounded-2xl bg-primary-soft/50 border border-primary/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Model Config</h3>
              <p className="text-sm font-medium leading-relaxed">
                Hệ thống đang chạy <strong>Whisper Large-v3</strong> cho tiếng Việt và <strong>Faster-Whisper</strong> cho Live Sessions.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Activity size={120} />
            </div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Realtime Metrics</h3>
            <p className="text-slate-400 text-sm mb-6 relative z-10">Latency trung bình cho live caption đang ổn định ở mức dưới 1.2s.</p>
            <div className="flex items-end gap-2 h-16 relative z-10">
              {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/40 rounded-t-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
