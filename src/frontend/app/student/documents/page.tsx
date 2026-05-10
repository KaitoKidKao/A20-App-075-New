'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function EnrolledCourses() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState('enrolled');
  
  interface Course {
    id: number;
    title: string;
    instructor: string;
    cat: string;
    thumb: string;
  }

  const allCourses: Record<number, Course[]> = {
    1: [
      { id: 1, title: 'Information About UI/UX Design Degree', instructor: 'David Benitez', cat: 'Design', thumb: 'https://picsum.photos/seed/uiux1/800/450' },
      { id: 2, title: 'Wordpress for Beginners - Master Wordpress Quickly', instructor: 'Ana Reyes', cat: 'Wordpress', thumb: 'https://picsum.photos/seed/wp1/800/450' },
      { id: 3, title: 'Sketch from A to Z (2024): Become an app designer', instructor: 'Andrew Pirtle', cat: 'Design', thumb: 'https://picsum.photos/seed/sketch1/800/450' },
      { id: 4, title: 'Build Responsive Real World Websites with Crash Course', instructor: 'Christy Gamer', cat: 'Programming', thumb: 'https://picsum.photos/seed/web1/800/450' },
      { id: 5, title: 'Learn JavaScript and Express to become a Expert', instructor: 'Justin Gregory', cat: 'Programming', thumb: 'https://picsum.photos/seed/js1/800/450' },
      { id: 6, title: 'Introduction to Python Programming Basic to Master', instructor: 'Carolyn Hines', cat: 'Programming', thumb: 'https://picsum.photos/seed/py1/800/450' },
    ],
    // ... Page 2 and 3 omitted for brevity in this specific replacement block but I'll ensure they are maintained
    2: [
      { id: 7, title: 'Advanced Photoshop Techniques for Retouching', instructor: 'Nancy Duarte', cat: 'Design', thumb: 'https://picsum.photos/seed/ps1/800/450' },
      { id: 8, title: 'Digital Painting Masterclass: From Sketch to Final', instructor: 'Marco Rossi', cat: 'Art', thumb: 'https://picsum.photos/seed/art1/800/450' },
      { id: 9, title: 'Logo Design Mastery: Brand Identity from Scratch', instructor: 'Sarah Jenkins', cat: 'Design', thumb: 'https://picsum.photos/seed/logo1/800/450' },
      { id: 10, title: 'Node.js Mastery: Building Scalable APIs', instructor: 'Liam Wilson', cat: 'Programming', thumb: 'https://picsum.photos/seed/node1/800/450' },
      { id: 11, title: 'React Native for Mobile App Development', instructor: 'Elena Rodriguez', cat: 'Mobile', thumb: 'https://picsum.photos/seed/mobile1/800/450' },
      { id: 12, title: 'Cybersecurity Fundamentals: Protecting Data', instructor: 'Kevin Smith', cat: 'IT', thumb: 'https://picsum.photos/seed/cyber1/800/450' },
    ],
    3: [
      { id: 13, title: 'Mastering Excel for Data Analysis', instructor: 'Robert Chen', cat: 'Business', thumb: 'https://picsum.photos/seed/excel1/800/450' },
      { id: 14, title: 'Public Speaking: Command the Room with Ease', instructor: 'Amanda Lee', cat: 'Soft Skills', thumb: 'https://picsum.photos/seed/speech1/800/450' },
      { id: 15, title: 'Photography 101: Mastering Your DSLR', instructor: 'Jack Thompson', cat: 'Photography', thumb: 'https://picsum.photos/seed/photo1/800/450' },
      { id: 16, title: 'Introduction to Artificial Intelligence', instructor: 'Dr. Emily Watson', cat: 'Tech', thumb: 'https://picsum.photos/seed/ai1/800/450' },
      { id: 17, title: 'Video Editing with Adobe Premiere Pro', instructor: 'Chris Miller', cat: 'Media', thumb: 'https://picsum.photos/seed/video1/800/450' },
      { id: 18, title: 'Blogging for Profit: Building a Sustainable Business', instructor: 'Jessica Brown', cat: 'Marketing', thumb: 'https://picsum.photos/seed/blog1/800/450' },
    ]
  };

  // Simulate filtering: For 'active' show only first 4, for 'completed' show only last 2
  const getFilteredCourses = () => {
    const pageCourses = allCourses[currentPage] || [];
    if (activeTab === 'active') return pageCourses.slice(0, 4);
    if (activeTab === 'completed') return pageCourses.slice(4, 6);
    return pageCourses;
  };

  const courses = getFilteredCourses();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto space-y-8">
        
        {/* Simple Tabs Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
           <h2 className="text-xl font-black text-slate-900 capitalize">{activeTab}</h2>
           <div className="flex items-center gap-2">
              {[
                { id: 'enrolled', label: 'Enrolled (09)' },
                { id: 'active', label: 'Active (05)' },
                { id: 'completed', label: 'Completed (03)' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1); // Reset to page 1 on filter change
                  }}
                  className={cn(
                    "px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all",
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
              <div className="relative aspect-video">
                <Image 
                  src={course.thumb} 
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
                        <Image src={`https://i.pravatar.cc/100?img=${course.id + 15}`} alt={course.instructor} fill className="object-cover" />
                     </div>
                     <span className="text-xs font-bold text-slate-400">{course.instructor}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 rounded">
                    {course.cat}
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
        {/* Pagination placeholder */}
        <div className="flex items-center justify-between pt-10 border-t border-slate-50">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of 3</p>
           <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <button 
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-xs font-black transition-all",
                    currentPage === num 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {num}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
