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
    <div className="min-h-screen">
      <div className="p-8">
        
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content (Video + Tabs) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video Player Area */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-slate-200 relative aspect-video group">
              {/* === HƯỚNG DẪN CHÈN ẢNH VIDEO/THUMBNAIL === 
                  Bạn chèn thẻ <img src="..." /> hoặc <Image src="..." /> vào đây để làm hình nền video (thumbnail) 
                  Ví dụ: <img src="/images/video-thumbnail.jpg" alt="Video Thumbnail" className="w-full h-full object-cover" />
              */}
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                {/* Giả lập Subtitle */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white text-xl md:text-2xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center w-full px-4">
                  Xin chào, tôi là Margaret Moloney
                </div>
                <Play size={80} className="text-white/40 group-hover:text-white/80 transition-all cursor-pointer" />
              </div>
              
              {/* Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/60 backdrop-blur-sm flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                  <Play size={20} className="text-white fill-white cursor-pointer hover:scale-110 transition-transform" />
                  <Volume2 size={20} className="text-white cursor-pointer hover:scale-110 transition-transform" />
                  <span className="text-white text-sm font-bold">0:01 / 3:10</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-white text-sm font-bold cursor-pointer hover:text-primary transition-colors">1x</span>
                  <Settings size={20} className="text-white cursor-pointer hover:rotate-90 transition-transform" />
                  <Maximize size={20} className="text-white cursor-pointer hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>

            {/* Title & Save Note */}
            <div className="flex items-center justify-between pt-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome to the Capstone!</h1>
              <button className="flex items-center gap-2 text-primary font-bold hover:underline hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                <Save size={18} />
                Save note
              </button>
            </div>

            {/* AI Assistant Area */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-lg text-slate-700">coach</span>
                <ChevronDown size={20} className="text-slate-400" />
              </div>
              <p className="text-base text-slate-600 font-medium mb-6">
                Let me know if you have any questions about this material. I'm here to help!
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Give me practice questions
                </button>
                <button className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Explain this topic in simple terms
                </button>
                <button className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Give me a summary
                </button>
                <button className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4C40ED] hover:bg-[#4C40ED] hover:text-white hover:border-[#4C40ED] transition-all flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> Give me real-life examples
                </button>
              </div>
            </div>

            {/* Lower Tabs Area */}
            <div className="pt-4">
              <div className="border-b border-slate-200 mb-6 flex gap-8">
                {['Transcript', 'Notes', 'Downloads'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={cn(
                      "pb-4 text-base font-extrabold transition-all relative",
                      activeTab === tab.toLowerCase() ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4 pb-12">
                <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#4C40ED] text-[#4C40ED] font-bold rounded-xl hover:bg-[#4C40ED]/5 transition-colors">
                  Go to next item
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar (Transcript Right Column) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 bg-white border border-slate-200 rounded-2xl flex flex-col h-[calc(100vh-140px)] shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center gap-6">
                <button className="text-sm font-extrabold text-slate-900 border-b-2 border-slate-900 pb-1">Transcript</button>
                <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1">Notes</button>
                <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1">Downloads</button>
              </div>

              <div className="px-6 py-4 border-b border-slate-100 flex items-center">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  Language: <span className="text-slate-900 ml-1">English</span> <ChevronDown size={14} className="ml-1 text-slate-400" />
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin">
                {[
                  { time: '0:00', text: 'Hi, Margaret Maloney here, and welcome to the Introduction to Project Management Capstone course. This is the course that brings it all together. You\'ve been learning about what project managers do, and best practices for managing projects. Now it is your turn to put the best practices in your own practice.' },
                  { time: '0:35', text: 'The deliverables you are creating are all part of the planning what you would do with your team at the start of a project. With regard to project, you may select whatever you wish. In a perfect world, you would select something that is both useful and interesting for you. Your selection might be a real project, it might be made up...' },
                  { time: '1:20', text: 'It might be something that is really happening in your personal life, it could be something you\'re working on in your professional life. It\'s a real-world case.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group cursor-pointer hover:bg-slate-50 p-3 -mx-3 rounded-xl transition-all">
                    <span className="text-xs font-bold text-slate-400 mt-1 shrink-0">{item.time}</span>
                    <p className="text-[15px] font-medium text-slate-700 leading-relaxed group-hover:text-slate-900">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
