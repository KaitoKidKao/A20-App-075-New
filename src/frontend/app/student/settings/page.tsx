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
  Check
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'profile' | 'accessibility') || 'profile';
  
  const setActiveTab = (tab: 'profile' | 'accessibility') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/student/settings?${params.toString()}`);
  };

  const { 
    fontSize, setFontSize, 
    theme, setTheme, 
    highContrast, setHighContrast, 
    autoScroll, setAutoScroll,
    user 
  } = useAppStore();

  const profileData = {
    firstName: user?.name.split(' ')[0] || 'Ronald',
    lastName: user?.name.split(' ')[1] || 'Richard',
    regDate: '16 Jan 2024, 11:15 AM',
    userName: user?.email.split('@')[0] || 'studentdemo',
    phone: '90154-91036',
    email: user?.email || 'student@example.com',
    gender: 'Male',
    dob: '16 Jan 2000',
    bio: "Hello! I'm a student at DreamsLMS. I'm passionate about learning and using AI to enhance my education experience."
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="px-8 md:px-12 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 space-y-2">
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
              My Profile
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
              Accessibility Settings
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' ? (
              <div className="card-premium p-10 bg-white animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Personal Information</h2>
                  <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-slate-200">
                    <Pencil size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-y-8 gap-x-10">
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">First Name</p>
                    <p className="text-[15px] font-bold text-slate-700">{profileData.firstName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Name</p>
                    <p className="text-[15px] font-bold text-slate-700">{profileData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</p>
                    <p className="text-[15px] font-bold text-slate-700">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                    <p className="text-[15px] font-bold text-slate-700">{profileData.phone}</p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Bio</p>
                  <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
                    {profileData.bio}
                  </p>
                </div>
              </div>
            ) : (
              <div className="card-premium p-10 bg-white animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Accessibility Configuration</h2>
                </div>

                <div className="space-y-10">
                  {/* Font Size */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Type size={18} className="text-primary" />
                      <h3 className="font-bold">Text Size (Font Size)</h3>
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
                    <p className="text-xs text-slate-400 font-medium italic">Adjust the font size of transcripts and summaries for better readability.</p>
                  </div>

                  {/* Theme Mode */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      {theme === 'light' ? <Sun size={18} className="text-primary" /> : <Moon size={18} className="text-primary" />}
                      <h3 className="font-bold">Display Theme</h3>
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
                        <span className={cn("text-sm font-bold", theme === 'light' ? "text-primary" : "text-slate-500")}>Light Mode</span>
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
                        <span className={cn("text-sm font-bold", theme === 'dark' ? "text-primary" : "text-slate-500")}>Dark Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Eye size={18} className="text-primary" />
                      <h3 className="font-bold">Visual Preferences</h3>
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
                                <p className="text-sm font-bold text-slate-700">High Contrast Mode</p>
                                <p className="text-xs text-slate-400 font-medium">Makes text sharper and easier to read.</p>
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
                                <p className="text-sm font-bold text-slate-700">Auto-Scroll Transcript</p>
                                <p className="text-xs text-slate-400 font-medium">Follows the speaker automatically during playback.</p>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent px-8 py-8 text-sm font-bold text-slate-500">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
