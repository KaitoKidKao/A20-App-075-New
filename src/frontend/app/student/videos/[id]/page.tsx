'use client';

import React, { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { 
  Play, 
  MessageSquare, 
  FileText, 
  Download, 
  Search, 
  ChevronRight, 
  Maximize, 
  Volume2, 
  Settings,
  Sparkles,
  Save,
  ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function VideoLessonPage() {
  const [activeTab, setActiveTab] = useState('transcript');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-8 md:px-12 py-10">
        
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content (Video + Tabs) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Video Player Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <div className="relative aspect-video bg-black group">
                {/* Note for User: Chèn Video Player hoặc Image Placeholder ở đây */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    {/* Captions Overlay Mockup */}
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-xl text-white text-lg font-bold border border-white/20">
                      Xin chào, tôi là Margaret Moloney
                    </div>
                    <Play size={80} className="text-white/40 group-hover:text-white/80 transition-all cursor-pointer" />
                  </div>
                </div>
                
                {/* Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <Play size={20} className="text-white fill-white cursor-pointer" />
                    <Volume2 size={20} className="text-white cursor-pointer" />
                    <span className="text-white text-xs font-bold">0:01 / 3:30</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Settings size={20} className="text-white cursor-pointer" />
                    <Maximize size={20} className="text-white cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-extrabold text-slate-900">Welcome to the Capstone!</h1>
                  <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                    <Save size={16} />
                    Save note
                  </button>
                </div>

                {/* AI Assistant Area */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Sparkles size={20} />
                    </div>
                    <span className="font-bold text-slate-700">AI Learning Coach</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                    Let me know if you have any questions about this material, I'm here to help!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all">Give me practice questions</button>
                    <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all">Explain this topic in simple terms</button>
                    <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all">Give me a summary</button>
                    <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all">Give me real life examples</button>
                  </div>
                </div>

                {/* Lower Tabs */}
                <div className="border-b border-slate-100 mb-6 flex gap-8">
                  {['Transcript', 'Notes', 'Downloads'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={cn(
                        "pb-4 text-sm font-bold transition-all relative",
                        activeTab === tab.toLowerCase() ? "text-primary" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab}
                      {activeTab === tab.toLowerCase() && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-[14px] text-slate-600 leading-relaxed font-medium">
                  {activeTab === 'transcript' && (
                    <p>
                      The deliverables you are creating are all part of the planning what you would do with your team at the start of a project. With regard to project managers, you may select whatever you wish. In a perfect world again, something that is both useful and interesting for you. You may selection might be a real project, it might be made up, it might be something that is really happening in your personal life, it could be something you're working on in your professional life. It's a real-world case...
                    </p>
                  )}
                  {activeTab === 'notes' && <p>Your notes will appear here...</p>}
                  {activeTab === 'downloads' && <p>Downloadable files for this lesson...</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Transcript/Notes/Downloads List) */}
          <div className="lg:col-span-4">
            <div className="card-premium sticky top-28 overflow-hidden h-[calc(100vh-140px)] flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <button className="text-xs font-bold text-primary border-b-2 border-primary pb-1">Transcript</button>
                  <button className="text-xs font-bold text-slate-400 hover:text-slate-600 pb-1">Notes</button>
                  <button className="text-xs font-bold text-slate-400 hover:text-slate-600 pb-1">Downloads</button>
                </div>
              </div>

              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  Language: <span className="text-slate-900">English</span> <ChevronDown size={14} />
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                {[
                  { time: '0:10', text: 'Hi, Margaret Maloney here, and welcome to the introduction to Project Management Capstone course. This is the course that brings it all together.' },
                  { time: '0:35', text: 'The deliverables you are creating are all part of the planning what you would do with your team at the start of a project. With regard to project managers, you may select whatever you wish.' },
                  { time: '1:20', text: 'It might be something that is really happening in your personal life, it could be something you\'re working on in your professional life. It\'s a real-world case.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all">
                    <span className="text-[11px] font-bold text-slate-400 mt-1 shrink-0">{item.time}</span>
                    <p className="text-[13px] font-medium text-slate-600 leading-relaxed group-hover:text-slate-900">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 bg-white">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-primary font-bold text-sm rounded-xl border border-primary/20 hover:bg-primary/5 transition-all">
                  Go to next item
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
