'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  Users, 
  Clock,
  ArrowUpRight,
  UploadCloud,
  FileVideo,
  Sparkles,
  MoreVertical,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { StatusBadge, type Status } from '@/components/ui/StatusBadge';
import { api, type AdminDashboard } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminDashboardPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setDashboard(await api.admin.getDashboard());
      } catch (err) {
        console.error('Failed to fetch admin dashboard', err);
      }
    };
    fetchDashboard();
  }, []);

  const kpis = [
    { label: 'Jobs đang xử lý', value: '4', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12%', isUp: true },
    { label: 'Jobs hàng đợi', value: '12', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', trend: '-2', isUp: false },
    { label: 'WER trung bình', value: '3.8%', icon: Zap, color: 'text-[#FF4F6E]', bg: 'bg-[#FF4F6E]/5', trend: '-0.4%', isUp: false },
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

  const dashboardKpis = dashboard ? [
    { label: 'Học sinh', value: String(dashboard.stats.student_count), icon: Users, color: 'text-slate-600', bg: 'bg-slate-50', trend: 'active', isUp: true },
    { label: 'Khóa học', value: String(dashboard.stats.active_courses), icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'live', isUp: true },
    { label: 'Bài học', value: String(dashboard.stats.lesson_count), icon: FileVideo, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'total', isUp: true },
    { label: 'Video lỗi', value: String(dashboard.stats.failed_video_jobs), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'failed', isUp: false },
    { label: 'Tỷ lệ hoàn thành', value: `${dashboard.stats.completion_rate}%`, icon: Zap, color: 'text-[#FF4F6E]', bg: 'bg-[#FF4F6E]/5', trend: 'avg', isUp: true },
    { label: 'Bài phổ biến', value: String(dashboard.popular_lessons.length), icon: Cpu, color: 'text-primary', bg: 'bg-primary-soft', trend: 'top', isUp: true },
  ] : kpis;

  const dashboardJobs = dashboard?.failed_jobs.map((job, index) => ({
    id: `JOB-${index + 1}`,
    type: 'Video',
    status: 'error',
    lessonId: job.lesson_id,
    attempts: job.attempts,
  })) ?? jobs;

  const handleUploadSim = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    }, 150);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 sm:px-8">
      
      {/* Admin Header Banner */}
      <div className="relative bg-[#14142B] rounded-[40px] p-10 overflow-hidden shadow-2xl group">
         <div className="absolute top-0 right-0 w-[500px] h-full bg-[#FF4F6E]/10 rounded-l-[100px] -z-0" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4F6E]/20 text-[#FF4F6E] rounded-full text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} fill="currentColor" />
                  Administrator Access
               </div>
               <h1 className="text-4xl font-black text-white leading-tight">
                  Systems <span className="text-[#FF4F6E] italic">Dashboard</span>
               </h1>
               <p className="text-white/50 font-bold max-w-md text-sm">
                  Manage inclusive learning materials and monitor real-time AI performance metrics.
               </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-white font-black text-lg">System Healthy</p>
                  <p className="text-[#FF4F6E] text-xs font-bold uppercase tracking-widest">99.9% Uptime</p>
               </div>
               <div className="w-16 h-16 rounded-3xl bg-[#FF4F6E] flex items-center justify-center shadow-xl shadow-[#FF4F6E]/20">
                  <Zap size={32} className="text-white" fill="currentColor" />
               </div>
            </div>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Upload */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Admin Quick Upload Area */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-[#FF4F6E]/10 flex items-center justify-center text-[#FF4F6E]">
                      <UploadCloud size={20} />
                   </div>
                   <div>
                      <h2 className="text-xl font-black text-slate-900">Push New Lectures</h2>
                      <p className="text-xs font-bold text-slate-400">Upload inclusive videos for students</p>
                   </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                   <MoreVertical size={20} className="text-slate-400" />
                </button>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                {/* Upload Zone */}
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={cn(
                    "relative border-4 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center transition-all cursor-pointer group",
                    isUploading ? "bg-slate-50 border-slate-100" : "bg-[#F8F9FB] border-slate-100 hover:bg-white hover:border-[#FF4F6E]/30"
                  )}
                >
                   <input type="file" ref={fileInputRef} className="hidden" />
                   {isUploading ? (
                     <div className="text-center space-y-4">
                        <LoaderIcon className="w-12 h-12 text-[#FF4F6E] animate-spin mx-auto" />
                        <div className="text-xs font-black text-slate-900">{uploadProgress}% Processing...</div>
                     </div>
                   ) : (
                     <>
                       <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-400 group-hover:text-[#FF4F6E] transition-all mb-4">
                          <FileVideo size={32} />
                       </div>
                       <p className="text-sm font-black text-slate-900">Drop Video Here</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Max 1GB • MP4/MOV</p>
                     </>
                   )}
                </div>

                {/* Quick Info & Action */}
                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#FF4F6E] shadow-sm">
                            <Sparkles size={16} fill="currentColor" />
                         </div>
                         <p className="text-[11px] font-bold text-slate-500 leading-tight">
                            AI will automatically generate <span className="text-slate-900 font-black">Subtitles & Visual Notes</span> for deaf students.
                         </p>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm">
                            <ShieldCheck size={16} />
                         </div>
                         <p className="text-[11px] font-bold text-slate-500 leading-tight">
                            Content will be published to the <span className="text-slate-900 font-black">Global Library</span> immediately.
                         </p>
                      </div>
                   </div>
                   <button 
                     onClick={handleUploadSim}
                     disabled={isUploading}
                     className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-[#FF4F6E] hover:shadow-[#FF4F6E]/20 transition-all active:scale-95 disabled:opacity-50"
                   >
                     Deploy Lecture
                   </button>
                </div>
             </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {dashboardKpis.map((kpi, i) => (
              <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-50 shadow-sm group hover:shadow-xl transition-all duration-500">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3", kpi.bg, kpi.color)}>
                  <kpi.icon size={22} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                    kpi.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    {kpi.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Job Table - Refined */}
          <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
               <div>
                  <h2 className="text-xl font-black text-slate-900">Recent Sync Jobs</h2>
                  <p className="text-xs font-bold text-slate-400">Live AI processing status</p>
               </div>
               <button className="px-5 py-2.5 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                  View All Logs
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-50">
                     {dashboardJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">ID</p>
                              <p className="text-sm font-black text-slate-900">{job.id}</p>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <FileVideo size={14} />
                                 </div>
                                 <span className="text-sm font-black text-slate-700">{job.type}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <StatusBadge status={job.status as Status} />
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all">
                                 <ArrowUpRight size={18} className="text-slate-300" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Health & Activity */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm space-y-8">
              <h2 className="text-xl font-black text-slate-900">AI Model Health</h2>
              <div className="space-y-6">
                 {[
                   { name: 'WER (Vietnamese)', val: 96, color: 'bg-[#FF4F6E]' },
                   { name: 'WER (English)', val: 92, color: 'bg-blue-500' },
                   { name: 'VAD Latency', val: 75, color: 'bg-amber-500' },
                 ].map((m, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{m.name}</span>
                         <span className="text-xs font-black text-slate-900">{m.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                         <div className={cn("h-full rounded-full transition-all duration-1000", m.color)} style={{ width: `${m.val}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-5 bg-slate-900 rounded-3xl space-y-4">
                 <div className="flex items-center gap-3 text-white">
                    <Activity size={18} className="text-[#FF4F6E]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Realtime Traffic</span>
                 </div>
                 <div className="flex items-end gap-1.5 h-12">
                    {[40, 70, 45, 90, 65, 80, 50, 85, 60, 40, 75, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#FF4F6E]/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                 </div>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-gradient-to-br from-[#FF4F6E] to-[#e64663] p-8 rounded-[32px] shadow-xl shadow-[#FF4F6E]/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-lg font-black mb-2 italic">Quick Deploy</h3>
              <p className="text-white/70 text-xs font-bold mb-6">Instantly create a new course shell for students.</p>
              <button className="w-full py-4 bg-white text-[#FF4F6E] rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-white/20 transition-all flex items-center justify-center gap-2 group/btn">
                 <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                 New Course
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
