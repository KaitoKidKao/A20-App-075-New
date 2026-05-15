'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  User, 
  Settings as SettingsIcon, 
  Pencil, 
  Type, 
  Sun, 
  Moon, 
  Eye, 
  ScrollText,
  Check,
  Award,
  BookOpen,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { api, StudentProfileData } from '@/lib/api';

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'dashboard' | 'profile' | 'accessibility') || 'dashboard';
  
  const setActiveTab = (tab: 'dashboard' | 'profile' | 'accessibility') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/student/settings?${params.toString()}`);
  };

  const [profileData, setProfileData] = React.useState<StudentProfileData | null>(null);
  const [, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.student.getProfile();
        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const { 
    fontSize, setFontSize, 
    theme, setTheme, 
    highContrast, setHighContrast, 
    autoScroll, setAutoScroll,
    user 
  } = useAppStore();



  return (
    <div className="min-h-screen bg-transparent">
      <div className="px-8 md:px-12 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm",
                activeTab === 'dashboard' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:bg-white/50"
              )}
            >
              <LayoutDashboard size={18} />
              Dashboard học tập
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm",
                activeTab === 'profile' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:bg-white/50"
              )}
            >
              <User size={18} />
              Hồ sơ của tôi
            </button>
            <button 
              onClick={() => setActiveTab('accessibility')}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm",
                activeTab === 'accessibility' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:bg-white/50"
              )}
            >
              <SettingsIcon size={18} />
              Cài đặt trợ năng
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && profileData && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                     { label: 'Đã đăng ký', value: profileData.stats.total_enrollments, icon: BookOpen, color: 'bg-blue-500' },
                     { label: 'Hoàn thành', value: profileData.stats.completed_lessons, icon: Check, color: 'bg-emerald-500' },
                     { label: 'Giờ học', value: `${profileData.stats.total_hours}h`, icon: Clock, color: 'bg-amber-500' },
                     { label: 'Chứng chỉ', value: profileData.stats.certificates_count, icon: Award, color: 'bg-rose-500' },
                   ].map((stat, i) => (
                     <div key={i} className="card-premium p-6 bg-white flex flex-col gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                           <stat.icon size={24} />
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                           <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Certificates List */}
                <div className="card-premium p-10 bg-white">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-8">Chứng chỉ của tôi</h2>
                  {profileData.profile.certifications && profileData.profile.certifications.length > 0 ? (
                    <div className="grid gap-4">
                      {profileData.profile.certifications.map((cert, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                 <Award size={28} />
                              </div>
                              <div>
                                 <h4 className="font-black text-slate-900">{cert.course_title}</h4>
                                 <p className="text-xs font-bold text-slate-400">ID: {cert.cert_id} • Cấp ngày: {new Date(cert.issue_date).toLocaleDateString('vi-VN')}</p>
                              </div>
                           </div>
                           <button className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all">
                              Tải xuống
                           </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                       <Award size={48} className="mx-auto text-slate-200 mb-4" />
                       <p className="text-slate-400 font-bold">Bạn chưa có chứng chỉ nào. Hãy hoàn thành các khóa học để nhận chứng chỉ!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' ? (
              <div className="card-premium p-10 bg-white animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Thông tin cá nhân</h2>
                  <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-slate-200">
                    <Pencil size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-y-8 gap-x-10">
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tên hiển thị</p>
                    <p className="text-[15px] font-bold text-slate-700">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Địa chỉ email</p>
                    <p className="text-[15px] font-bold text-slate-700">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Giới thiệu</p>
                  <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
                    {profileData?.profile.bio || "Bạn chưa có thông tin giới thiệu."}
                  </p>
                </div>
                
                <div className="mt-8">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Mục tiêu học tập</p>
                  <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
                    {profileData?.profile.learning_goals || "Hãy đặt ra mục tiêu để có động lực hơn nhé!"}
                  </p>
                </div>
              </div>
            ) : activeTab === 'accessibility' ? (
              <div className="card-premium p-10 bg-white animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Cấu hình trợ năng</h2>
                </div>

                <div className="space-y-10">
                  {/* Font Size */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Type size={18} className="text-primary" />
                      <h3 className="font-bold">Cỡ chữ</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={cn(
                            "px-6 py-3 rounded-xl font-black transition-all border-2",
                            fontSize === size 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium italic">Điều chỉnh cỡ chữ cho phụ đề và tóm tắt để dễ đọc hơn.</p>
                  </div>

                  {/* Theme Mode */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      {theme === 'light' ? <Sun size={18} className="text-primary" /> : <Moon size={18} className="text-primary" />}
                      <h3 className="font-bold">Giao diện hiển thị</h3>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setTheme('light')}
                        className={cn(
                          "flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                          theme === 'light' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="w-full h-20 bg-slate-50 rounded-xl border border-slate-200 p-2 flex flex-col gap-2">
                           <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                           <div className="h-2 w-1/2 bg-slate-200 rounded-full" />
                        </div>
                        <span className={cn("text-sm font-bold", theme === 'light' ? "text-primary" : "text-slate-500")}>Chế độ sáng</span>
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                          theme === 'dark' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="w-full h-20 bg-slate-900 rounded-xl border border-slate-800 p-2 flex flex-col gap-2">
                           <div className="h-2 w-3/4 bg-slate-800 rounded-full" />
                           <div className="h-2 w-1/2 bg-slate-800 rounded-full" />
                        </div>
                        <span className={cn("text-sm font-bold", theme === 'dark' ? "text-primary" : "text-slate-500")}>Chế độ tối</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Eye size={18} className="text-primary" />
                      <h3 className="font-bold">Tùy chọn hiển thị</h3>
                    </div>
                    
                    <div className="space-y-3">
                       <button 
                         onClick={() => setHighContrast(!highContrast)}
                         className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all"
                       >
                          <div className="flex items-center gap-3">
                             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", highContrast ? "bg-primary text-white" : "bg-white text-slate-400 shadow-sm")}>
                                <Check size={20} />
                             </div>
                             <div className="text-left">
                                <p className="text-sm font-bold text-slate-700">Chế độ tương phản cao</p>
                                <p className="text-xs text-slate-400 font-medium">Giúp chữ rõ nét và dễ đọc hơn.</p>
                             </div>
                          </div>
                          <div className={cn("w-12 h-6 rounded-full transition-all relative", highContrast ? "bg-primary" : "bg-slate-200")}>
                             <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", highContrast ? "right-1" : "left-1")} />
                          </div>
                       </button>

                       <button 
                         onClick={() => setAutoScroll(!autoScroll)}
                         className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all"
                       >
                          <div className="flex items-center gap-3">
                             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", autoScroll ? "bg-primary text-white" : "bg-white text-slate-400 shadow-sm")}>
                                <ScrollText size={20} />
                             </div>
                             <div className="text-left">
                                <p className="text-sm font-bold text-slate-700">Tự cuộn phụ đề</p>
                                <p className="text-xs text-slate-400 font-medium">Tự động bám theo lời nói trong khi phát video.</p>
                             </div>
                          </div>
                          <div className={cn("w-12 h-6 rounded-full transition-all relative", autoScroll ? "bg-primary" : "bg-slate-200")}>
                             <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", autoScroll ? "right-1" : "left-1")} />
                          </div>
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent px-8 py-8 text-sm font-bold text-slate-500">Đang tải cài đặt...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
