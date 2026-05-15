'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  Globe,
  Layers,
  MonitorPlay,
  Play,
  User as UserIcon,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, StudentCourseDetail } from '@/lib/api';

function formatDuration(minutes: number): string {
  const h = Math.floor(Math.max(minutes, 0) / 60);
  const m = Math.max(minutes, 0) % 60;
  return `${h}h ${m}m`;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [detail, setDetail] = useState<StudentCourseDetail | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await api.student.getCourseDetail(courseId);
        setDetail(data);
        if (data.modules.length > 0) setActiveAccordion(data.modules[0].id);
      } catch (err) {
        console.error('Failed to fetch course detail', err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      await api.student.enroll(courseId);
      const data = await api.student.getCourseDetail(courseId);
      setDetail(data);
      setShowEnrollModal(true);
      setTimeout(() => setShowEnrollModal(false), 2500);
    } catch (err) {
      console.error('Enrollment failed', err);
    }
  };

  const nextLessonUrl = useMemo(() => {
    if (!detail) return '';
    const target = detail.user_context.next_lesson_id || detail.user_context.first_lesson_id;
    return target ? `/student/videos/${target}` : '';
  }, [detail]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">Loading course...</div>;
  if (!detail) return <div className="min-h-screen flex items-center justify-center font-black text-rose-500">Course not found.</div>;

  const { course, stats, user_context, modules } = detail;
  const courseImage = course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-transparent relative">
      {showEnrollModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} fill="currentColor" className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Enrolled Successfully!</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">Bạn đã đăng ký khóa học <strong>{course.title}</strong>.</p>
            <button onClick={() => setShowEnrollModal(false)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest">
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1C1D1F] text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Link href="/student/library" className="hover:underline">Dashboard</Link>
              <ArrowRight size={14} />
              <span className="text-white/60">Khóa học</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{course.title}</h1>
            <p className="text-lg text-white/80 font-medium max-w-2xl">{course.description || `Nội dung khóa học ${course.title}`}</p>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-white/80">
              <div>{stats.students_enrolled} students enrolled</div>
              <div>{stats.total_lessons} lessons</div>
              <div>{formatDuration(stats.total_duration_minutes)} total length</div>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <div className="flex items-center gap-2"><UserIcon size={16} /><span>Instructor ID: <span className="text-primary underline">{course.instructor_id || 'N/A'}</span></span></div>
              <div className="flex items-center gap-2"><Globe size={16} /><span>{(course.language || 'vi').toUpperCase()}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <div className="border-2 border-slate-100 rounded-2xl p-8 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Tóm tắt khóa học</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm font-bold text-slate-600">
                <div className="flex gap-3"><CheckCircle size={18} className="text-slate-400 shrink-0" />{stats.total_modules} chương</div>
                <div className="flex gap-3"><CheckCircle size={18} className="text-slate-400 shrink-0" />{stats.total_lessons} bài học</div>
                <div className="flex gap-3"><CheckCircle size={18} className="text-slate-400 shrink-0" />{formatDuration(stats.total_duration_minutes)} thời lượng</div>
                <div className="flex gap-3"><CheckCircle size={18} className="text-slate-400 shrink-0" />Tiến trình: {user_context.progress_percent}%</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Course content</h2>
                <div className="text-sm font-bold text-slate-500">{stats.total_lessons} lectures • {formatDuration(stats.total_duration_minutes)}</div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {modules.map((module) => (
                  <div key={module.id} className="border-b border-slate-200 last:border-0">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === module.id ? null : module.id)}
                      className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 font-black text-slate-900 text-sm">
                        <ChevronDown size={18} className={activeAccordion === module.id ? 'rotate-180 transition-transform' : 'transition-transform'} />
                        {module.title}
                      </div>
                      <div className="text-xs font-bold text-slate-500">{module.lessons.length} bài học</div>
                    </button>
                    {activeAccordion === module.id && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {module.lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <MonitorPlay size={16} className="text-slate-400" />
                              <Link href={`/student/videos/${lesson.id}`} className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">
                                {idx + 1}. {lesson.title}
                              </Link>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 rounded">{lesson.content_type}</span>
                              <span className="text-xs font-bold text-slate-400">{lesson.duration_minutes || 0}m</span>
                              <span className="text-xs font-bold text-slate-400">{lesson.is_completed ? 'completed' : lesson.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="relative aspect-video group cursor-pointer">
                <Image src={courseImage} alt="Preview" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900"><Play size={24} fill="currentColor" /></div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {user_context.is_enrolled ? (
                  nextLessonUrl ? (
                    <Link href={nextLessonUrl} className="block w-full py-4 rounded-xl bg-emerald-500 text-white font-black text-sm text-center uppercase tracking-widest">
                      Continue Learning
                    </Link>
                  ) : (
                    <div className="block w-full py-4 rounded-xl bg-slate-200 text-slate-500 font-black text-sm text-center uppercase tracking-widest">
                      No lesson yet
                    </div>
                  )
                ) : (
                  <button onClick={handleEnroll} className="block w-full py-4 rounded-xl bg-slate-900 text-white font-black text-sm text-center uppercase tracking-widest">
                    Enroll Now
                  </button>
                )}

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900">This course includes:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><MonitorPlay size={16} className="text-slate-400" />{stats.total_lessons} on-demand lessons</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><Clock size={16} className="text-slate-400" />Full lifetime access</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><Globe size={16} className="text-slate-400" />Language: {(course.language || 'vi').toUpperCase()}</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><CheckCircle size={16} className="text-slate-400" />Progress tracking enabled</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h4 className="text-sm font-black text-slate-900">Course Features:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Users size={16} className="text-primary" />Enrolled: {stats.students_enrolled}</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Clock size={16} className="text-primary" />Duration: {formatDuration(stats.total_duration_minutes)}</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Layers size={16} className="text-primary" />Chapters: {stats.total_modules}</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><Play size={16} className="text-primary" />Completed: {user_context.completed_lessons}/{stats.total_lessons}</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><UserIcon size={16} className="text-primary" />Level: {course.level || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

