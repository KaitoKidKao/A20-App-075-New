'use client';

import React from 'react';
import { 
  BookOpen, 
  Library, 
  CheckCircle, 
  Clock, 
  Play, 
  User, 
  MoreHorizontal,
  Star,
  Sparkles,
  LayoutDashboard,
  ArrowRight,
  TrendingUp,
  Award,
  Heart
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function StudentDashboard() {
  const stats = [
    { label: 'Enrolled Courses', value: '12', icon: Library, bg: 'bg-primary/10', text: 'text-primary' },
    { label: 'Active Courses', value: '03', icon: BookOpen, bg: 'bg-primary/10', text: 'text-primary' },
    { label: 'Completed Courses', value: '10', icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ];

  const recentEnrolled = [
    { 
      id: 1, 
      title: 'Information About UI/UX Design Degree', 
      instructor: 'David Benitez', 
      category: 'Design', 
      thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563de4c?q=80&w=2070&auto=format&fit=crop' 
    },
    { 
      id: 2, 
      title: 'Wordpress for Beginners - Master Wordpress Quickly', 
      instructor: 'Ana Reyes', 
      category: 'Wordpress', 
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop' 
    },
    { 
      id: 3, 
      title: 'Sketch from A to Z (2024): Become an app designer', 
      instructor: 'Andrew Pirtle', 
      category: 'Design', 
      thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop' 
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto space-y-10">

        {/* Simple Quiz Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">Quiz : Build Responsive Real World</h3>
              <p className="text-xs font-bold text-slate-400">Answered : 15/22</p>
           </div>
           <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all">
              Continue Quiz
           </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
              <div className={`${stat.bg} ${stat.text} w-14 h-14 rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Recently Enrolled Courses */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900">Recently Enrolled Courses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentEnrolled.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                <div className="relative aspect-video">
                  <Image 
                    src={course.thumbnail} 
                    alt={course.title} 
                    fill 
                    unoptimized={true}
                    className="object-cover" 
                  />
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 shadow-sm cursor-pointer">
                     <Heart size={14} />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden relative">
                          <Image src={`https://i.pravatar.cc/100?img=${course.id + 10}`} alt={course.instructor} fill className="object-cover" />
                       </div>
                       <span className="text-xs font-bold text-slate-400">{course.instructor}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 rounded">
                      {course.category}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 leading-snug line-clamp-2 min-h-[40px]">
                    {course.title}
                  </h4>
                  <Link 
                    href={`/student/courses/${course.id}`}
                    className="block w-full bg-slate-900 text-white text-[11px] font-black py-2.5 rounded-lg text-center uppercase tracking-widest hover:bg-primary transition-colors"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Lists */}
        <div className="grid lg:grid-cols-2 gap-8 pb-10">
          {/* Recent Courses */}
          <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Recent Courses</h3>
            <div className="space-y-6">
              {[
                { name: 'Build Responsive Real World Websites..', sub: 'Information About UI/UX Design Degree', prog: 95 },
                { name: 'Wordpress for Beginners', sub: 'Wordpress for Beginners - Master Wordpress Quickly', prog: 85 },
                { name: 'Information About UI/UX Design Degree', sub: 'Information About UI/UX Design Degree', prog: 85 },
                { name: 'Sketch from A to Z (2026)', sub: 'Wordpress for Beginners - Master Wordpress Quickly', prog: 95 },
                { name: 'Become an app designer', sub: 'Information About UI/UX Design Degree', prog: 95 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 group cursor-pointer">
                  <div className="min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-bold truncate mt-0.5">{item.sub}</p>
                  </div>
                  <div className="w-10 h-10 shrink-0 border-4 border-emerald-500 border-t-transparent rounded-full flex items-center justify-center text-[10px] font-black text-emerald-600">
                    {item.prog}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Latest Quizzes */}
          <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Latest Quizzes</h3>
            <div className="space-y-6">
              {[
                { name: 'Sketch from A to Z (2024)', sub: 'Correct Answer : 15/22 • Date : 15 Jan 2025', prog: 95, color: 'text-emerald-500' },
                { name: 'Build Responsive Real World', sub: 'Correct Answer : 18/22 • Date : 04 Jan 2025', prog: 98, color: 'text-emerald-500' },
                { name: 'UI/UX Design Degree', sub: 'Correct Answer : 25/30 • Date : 26 Dec 2024', prog: 80, color: 'text-emerald-500' },
                { name: 'Build Responsive Real World', sub: 'Correct Answer : 15/20 • Date : 10 Dec 2024', prog: 85, color: 'text-emerald-500' },
                { name: 'Become an app designer', sub: 'Correct Answer : 12/20 • Date : 27 Nov 2024', prog: 20, color: 'text-rose-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 group cursor-pointer">
                  <div className="min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-bold truncate mt-0.5">{item.sub}</p>
                  </div>
                  <div className={`w-10 h-10 shrink-0 border-4 border-current rounded-full flex items-center justify-center text-[10px] font-black ${item.color}`}>
                    {item.prog}%
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
