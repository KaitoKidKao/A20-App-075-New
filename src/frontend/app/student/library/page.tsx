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
  Star
} from 'lucide-react';
import Image from 'next/image';

export default function StudentDashboard() {
  const stats = [
    { label: 'Enrolled Courses', value: '12', icon: Library, bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Active Courses', value: '03', icon: BookOpen, bg: 'bg-rose-50', text: 'text-rose-600' },
    { label: 'Completed Courses', value: '10', icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ];

  const recentEnrolled = [
    { 
      id: 1, 
      title: 'Information About UI/UX Design Degree', 
      instructor: 'David Benitez', 
      category: 'Design', 
      thumbnail: 'https://placehold.co/400x250/F1F5F9/64748B?text=Course+Thumbnail' 
    },
    { 
      id: 2, 
      title: 'Wordpress for Beginners - Master Wordpress Quickly', 
      instructor: 'Ana Reyes', 
      category: 'Wordpress', 
      thumbnail: 'https://placehold.co/400x250/F1F5F9/64748B?text=Wordpress' 
    },
    { 
      id: 3, 
      title: 'Sketch from A to Z (2024): Become an app designer', 
      instructor: 'Andrew Pirtle', 
      category: 'Design', 
      thumbnail: 'https://placehold.co/400x250/F1F5F9/64748B?text=Sketch' 
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-8 md:px-12 py-8">

        {/* Quiz Notification */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-10 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-900">Quiz : Build Responsive Real World</h3>
            <p className="text-sm text-slate-400 font-semibold mt-1 uppercase tracking-wider">Answered : 15/22</p>
          </div>
          <button className="bg-[#4C40ED] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            Continue Quiz
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="card-premium p-8 flex items-center gap-6">
              <div className={`${stat.bg} ${stat.text} w-16 h-16 rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={32} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Recently Enrolled Courses */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Recently Enrolled Courses</h2>
            <button className="text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentEnrolled.map((course) => (
              <div key={course.id} className="card-premium group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {/* Note for User: Chèn ảnh thumbnail khóa học vào đây */}
                  <Image 
                    src={course.thumbnail} 
                    alt={course.title} 
                    fill 
                    unoptimized={true}
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md text-slate-400 hover:text-rose-500 transition-colors">
                    <Star size={16} />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200" />
                      <span className="text-[13px] font-bold text-slate-400">{course.instructor}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border rounded">
                      {course.category}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h4>
                  <button className="bg-slate-900 text-white text-[12px] font-bold px-4 py-2 rounded-lg group-hover:bg-primary transition-colors">
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Lists */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Recent Courses */}
          <section className="card-premium p-8">
            <h3 className="text-xl font-bold mb-8">Recent Courses</h3>
            <div className="space-y-6">
              {[
                { name: 'Build Responsive Real World Websites..', sub: 'Information About UI/UX Design Degree', prog: 95 },
                { name: 'Wordpress for Beginners', sub: 'Wordpress for Beginners - Master Wordpress Quickly', prog: 85 },
                { name: 'Information About UI/UX Design Degree', sub: 'Information About UI/UX Design Degree', prog: 85 },
                { name: 'Sketch from A to Z (2024)', sub: 'Wordpress for Beginners - Master Wordpress Quickly', prog: 95 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-[15px] truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{item.sub}</p>
                  </div>
                  <div className="w-10 h-10 shrink-0 border-4 border-emerald-500 border-t-transparent rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-600">
                    {item.prog}%
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Latest Quizzes */}
          <section className="card-premium p-8">
            <h3 className="text-xl font-bold mb-8">Latest Quizzes</h3>
            <div className="space-y-6">
              {[
                { name: 'Sketch from A to Z (2024)', sub: 'Correct Answer : 15/22 • Date : 15 Jan 2025', prog: 95, color: 'text-emerald-500' },
                { name: 'Build Responsive Real World', sub: 'Correct Answer : 18/22 • Date : 04 Jan 2025', prog: 98, color: 'text-emerald-500' },
                { name: 'UI/UX Design Degree', sub: 'Correct Answer : 25/30 • Date : 26 Dec 2024', prog: 98, color: 'text-emerald-500' },
                { name: 'Build Responsive Real World', sub: 'Correct Answer : 15/20 • Date : 10 Dec 2024', prog: 95, color: 'text-emerald-500' },
                { name: 'Become an app designer', sub: 'Correct Answer : 12/20 • Date : 27 Nov 2024', prog: 26, color: 'text-rose-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-[15px] truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{item.sub}</p>
                  </div>
                  <div className={`w-10 h-10 shrink-0 border-4 border-current rounded-full flex items-center justify-center text-[10px] font-bold ${item.color}`}>
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
