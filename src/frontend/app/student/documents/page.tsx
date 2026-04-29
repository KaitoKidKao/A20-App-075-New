'use client';

import React from 'react';
import { Heart, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Image from 'next/image';

export default function EnrolledCourses() {
  const courses = [
    { id: 1, title: 'Information About UI/UX Design Degree', instructor: 'David Benitez', cat: 'Design', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=UI/UX' },
    { id: 2, title: 'Wordpress for Beginners - Master', instructor: 'Ana Reyes', cat: 'Wordpress', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=Wordpress' },
    { id: 3, title: 'Sketch from A to Z (2024):', instructor: 'Andrew Pirtle', cat: 'Design', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=Sketch' },
    { id: 4, title: 'Build Responsive Real World Websites', instructor: 'Christy Gamer', cat: 'Programming', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=Programming' },
    { id: 5, title: 'Learn JavaScript and Express to become', instructor: 'Justin Gregory', cat: 'Programming', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=JS' },
    { id: 6, title: 'Introduction to Python Programming', instructor: 'Carolyn Hines', cat: 'Programming', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=Python' },
    { id: 7, title: 'Information About Photoshop Design', instructor: 'Nancy Duarte', cat: 'Design', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=Photoshop' },
    { id: 8, title: 'Information About Photoshop Design', instructor: 'Nancy Duarte', cat: 'Design', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=Photoshop' },
    { id: 9, title: 'Information About Photoshop Design', instructor: 'Nancy Duarte', cat: 'Design', thumb: 'https://placehold.co/400x250/F1F5F9/64748B?text=Photoshop' },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-8 md:px-12 py-8 max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Enrolled</h2>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            <button className="bg-[#FF5A1F] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm">Enrolled (09)</button>
            <button className="text-slate-500 px-5 py-2 rounded-lg text-xs font-bold hover:bg-white transition-all">Active (06)</button>
            <button className="text-slate-500 px-5 py-2 rounded-lg text-xs font-bold hover:bg-white transition-all">Completed (03)</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="card-premium group hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <Image src={course.thumb} alt={course.title} fill unoptimized={true} className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md text-slate-400 hover:text-rose-500 transition-colors">
                  <Heart size={16} />
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={12} className="text-slate-400" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-400">{course.instructor}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border rounded">
                    {course.cat}
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

        {/* Pagination */}
        <div className="mt-12 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400">Page 1 of 2</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-colors border border-slate-100">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-lg bg-[#FF5A1F] text-white font-bold text-sm shadow-md">1</button>
            <button className="w-10 h-10 rounded-lg bg-white text-slate-500 font-bold text-sm hover:bg-slate-50 border border-slate-100">2</button>
            <button className="w-10 h-10 rounded-lg bg-white text-slate-500 font-bold text-sm hover:bg-slate-50 border border-slate-100">3</button>
            <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-colors border border-slate-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
