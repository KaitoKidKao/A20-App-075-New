'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowUpRight,
  Clock,
  Cpu,
  Database,
  FileVideo,
  MoreVertical,
  Plus,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Zap,
} from 'lucide-react';
import { StatusBadge, type Status } from '@/components/ui/StatusBadge';
import { api, type AdminCourseWorkspace, type AdminDashboard, type AdminModelHealth, type AdminRecentJob, type AdminUser } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function flattenLessons(course: AdminCourseWorkspace | undefined) {
  if (!course) return [];
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      module_title: module.title,
    }))
  );
}

function toBadgeStatus(status: string): Status {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'completed' || normalized === 'ready') return 'ready';
  if (normalized === 'failed' || normalized === 'error') return 'error';
  if (normalized === 'live') return 'live';
  if (normalized === 'ended') return 'ended';
  return 'processing';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authorized, setAuthorized] = useState(false);
  const [currentRole, setCurrentRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [quickDeployLoading, setQuickDeployLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [recentJobs, setRecentJobs] = useState<AdminRecentJob[]>([]);
  const [modelHealth, setModelHealth] = useState<AdminModelHealth | null>(null);
  const [adminCourses, setAdminCourses] = useState<AdminCourseWorkspace[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [allowPublicRoleRegistration, setAllowPublicRoleRegistration] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [courseTitle, setCourseTitle] = useState('');
  const [selectedLectureFile, setSelectedLectureFile] = useState<File | null>(null);
  const [publishMessage, setPublishMessage] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [createNewModule, setCreateNewModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');

  const loadAdminData = async (role: 'admin' | 'teacher' | 'student') => {
    const [dashboardData, jobsData, modelData, coursesData] = await Promise.all([
      api.admin.getDashboard(),
      api.admin.listRecentJobs(20),
      api.admin.getModelHealth(),
      api.admin.listCourses(),
    ]);
    setDashboard(dashboardData);
    setRecentJobs(jobsData);
    setModelHealth(modelData);
    setAdminCourses(coursesData);
    if (role === 'admin') {
      const [settingsData, usersData] = await Promise.all([
        api.admin.getSettings(),
        api.admin.listUsers(),
      ]);
      setAllowPublicRoleRegistration(settingsData.allow_public_role_registration);
      setAdminUsers(usersData);
    } else {
      setAllowPublicRoleRegistration(false);
      setAdminUsers([]);
    }
    if (coursesData.length > 0) {
      setSelectedCourseId((prev) => prev || coursesData[0].id);
      const firstModule = coursesData[0].modules[0];
      if (firstModule) setSelectedModuleId((prev) => prev || firstModule.id);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await api.auth.me();
        if (!['admin', 'teacher'].includes(me.role)) {
          router.replace('/student/library');
          return;
        }
        setCurrentRole(me.role);
        setAuthorized(true);
        await loadAdminData(me.role);
      } catch {
        router.replace('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, [router]);

  const selectedCourse = useMemo(
    () => adminCourses.find((course) => course.id === selectedCourseId),
    [adminCourses, selectedCourseId]
  );
  const selectedCourseLessons = useMemo(() => flattenLessons(selectedCourse), [selectedCourse]);

  const kpis = useMemo(() => {
    const processingCount = recentJobs.filter((job) =>
      ['pending', 'queued', 'processing', 'transcribing', 'extracting_audio', 'ai_processing', 'translating'].includes(job.status)
    ).length;
    const queueDepth = modelHealth?.metrics.queue_depth ?? 0;
    const asrScore = Math.round(((modelHealth?.metrics.wer_vi_score ?? 0) + (modelHealth?.metrics.wer_en_score ?? 0)) / 2);
    const latencySeconds = ((modelHealth?.metrics.asr_latency_ms ?? 0) / 1000).toFixed(2);
    const activeUsers = dashboard?.stats.student_count ?? 0;
    const failedJobs = dashboard?.stats.failed_video_jobs ?? 0;
    return [
      { label: 'Đang xử lý', value: String(processingCount), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Hàng đợi', value: String(queueDepth), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Sức khỏe ASR', value: `${asrScore}%`, icon: Zap, color: 'text-[#FF4F6E]', bg: 'bg-[#FF4F6E]/5' },
      { label: 'Độ trễ ASR', value: `${latencySeconds}s`, icon: Cpu, color: 'text-primary', bg: 'bg-primary-soft' },
      { label: 'Người dùng', value: String(activeUsers), icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
      { label: 'Lỗi xử lý', value: String(failedJobs), icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];
  }, [dashboard, modelHealth, recentJobs]);

  const handleQuickDeploy = async () => {
    setQuickDeployLoading(true);
    setPublishMessage('');
    try {
      const nowLabel = new Date().toLocaleString('vi-VN', { hour12: false });
      const course = await api.courses.createCourse({
        title: `Khóa học mới ${nowLabel}`,
        description: 'Khóa học tạo nhanh từ Triển khai nhanh.',
        is_published: false,
      });
      await loadAdminData(currentRole);
      setSelectedCourseId(course.id);
      setMode('existing');
      setPublishMessage(`Đã tạo nhanh khóa học: ${course.title}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo khóa học nhanh.';
      setPublishMessage(message);
    } finally {
      setQuickDeployLoading(false);
    }
  };

  const handleTogglePublicRoleRegistration = async (nextValue: boolean) => {
    setSavingSettings(true);
    setPublishMessage('');
    try {
      await api.admin.updateSettings({ allow_public_role_registration: nextValue });
      setAllowPublicRoleRegistration(nextValue);
      setPublishMessage(`Đã cập nhật: đăng ký vai trò công khai = ${nextValue ? 'BẬT' : 'TẮT'}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật cài đặt hệ thống.';
      setPublishMessage(message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangeUserRole = async (userId: string, nextRole: 'student' | 'teacher' | 'admin') => {
    setUpdatingRoleUserId(userId);
    setPublishMessage('');
    try {
      await api.admin.updateUserRole(userId, nextRole);
      setAdminUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: nextRole } : user)));
      setPublishMessage(`Đã cập nhật vai trò người dùng thành ${nextRole}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật vai trò người dùng.';
      setPublishMessage(message);
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  const handleDeleteVideoFromLog = async (videoId: string, lessonTitle: string) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa video "${lessonTitle}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    setDeletingVideoId(videoId);
    setPublishMessage('');
    try {
      await api.videos.delete(videoId);
      await loadAdminData(currentRole);
      setPublishMessage(`Đã xóa video ${videoId}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa video.';
      setPublishMessage(message);
    } finally {
      setDeletingVideoId(null);
    }
  };

  const resolveUploadTarget = async () => {
    if (mode === 'new') {
      if (!courseTitle.trim()) throw new Error('Nhập tên khóa học mới.');
      const course = await api.courses.createCourse({
        title: courseTitle.trim(),
        description: 'Khóa học được tạo từ quản trị viên.',
        is_published: true,
      });
      const createdModule = await api.courses.createModule(course.id, {
        title: (moduleTitle || 'Bài giảng').trim(),
        sort_order: 1,
      });
      return { moduleId: createdModule.id, messagePrefix: `Đã tạo khóa học "${course.title}"` };
    }

    if (!selectedCourseId) throw new Error('Chọn khóa học trước khi tải lên.');
    if (createNewModule) {
      const createdModule = await api.courses.createModule(selectedCourseId, {
        title: (moduleTitle || 'Bài giảng').trim(),
        sort_order: ((selectedCourse?.modules || []).reduce((maxValue, item) => Math.max(maxValue, item.sort_order || 0), 0) || 0) + 1,
      });
      return { moduleId: createdModule.id, messagePrefix: `Đã thêm chương "${createdModule.title}"` };
    }
    if (!selectedModuleId) throw new Error('Chọn chương để tải video lên.');
    return { moduleId: selectedModuleId, messagePrefix: 'Đã đưa video vào hàng đợi xử lý' };
  };

  const handleUpload = async () => {
    if (!selectedLectureFile) {
      setPublishMessage('Chọn video trước khi tải lên.');
      return;
    }
    setIsUploading(true);
    setPublishMessage('');
    setUploadProgress(15);
    try {
      const target = await resolveUploadTarget();
      setUploadProgress(50);
      const upload = await api.videos.upload(selectedLectureFile, target.moduleId);
      setUploadProgress(100);
      setSelectedLectureFile(null);
      setCourseTitle('');
      setCreateNewModule(false);
      await loadAdminData(currentRole);
      setPublishMessage(`${target.messagePrefix}. Mã video: ${upload.video_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải video lên.';
      setPublishMessage(message);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 600);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Đang tải bảng điều khiển...</div>;
  }
  if (!authorized) return null;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="relative bg-[#14142B] rounded-[40px] p-10 overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-[#FF4F6E]/10 rounded-l-[100px] -z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4F6E]/20 text-[#FF4F6E] rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} fill="currentColor" />
              Quyền Quản trị viên
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Bảng điều khiển <span className="text-[#FF4F6E] italic">Hệ thống</span>
            </h1>
            <p className="text-white/50 font-bold max-w-md text-sm">
              Quản lý học liệu đa phương thức và theo dõi hiệu suất AI thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white font-extrabold text-lg">Trạng thái hệ thống</p>
              <p className="text-[#FF4F6E] text-xs font-bold uppercase tracking-widest">
                Tỷ lệ lỗi {modelHealth?.metrics.failure_rate_percent ?? 0}% / 24h
              </p>
            </div>
            <div className="w-16 h-16 rounded-3xl bg-[#FF4F6E] flex items-center justify-center shadow-xl shadow-[#FF4F6E]/20">
              <Zap size={32} className="text-white" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF4F6E]/10 flex items-center justify-center text-[#FF4F6E]">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Đăng tải Bài giảng mới</h2>
                  <p className="text-xs font-bold text-slate-400">Tải video lên khóa học sẵn có hoặc tạo khóa học mới</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreVertical size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                  'relative border-4 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center transition-all cursor-pointer group',
                  isUploading ? 'bg-slate-50 border-slate-100' : 'bg-[#F8F9FB] border-slate-100 hover:bg-white hover:border-[#FF4F6E]/30'
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                  onChange={(event) => setSelectedLectureFile(event.target.files?.[0] ?? null)}
                />
                {isUploading ? (
                  <div className="text-center space-y-4">
                    <LoaderIcon className="w-12 h-12 text-[#FF4F6E] animate-spin mx-auto" />
                    <div className="text-xs font-bold text-slate-900">{uploadProgress}% Đang xử lý...</div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-400 group-hover:text-[#FF4F6E] transition-all mb-4">
                      <FileVideo size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Kéo thả Video vào đây</p>
                    {selectedLectureFile && (
                      <p className="mt-2 max-w-[220px] truncate text-[11px] font-bold text-[#FF4F6E]">{selectedLectureFile.name}</p>
                    )}
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tối đa 1GB | MP4/MOV</p>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                    <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} />
                    Dùng khóa học sẵn có
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                    <input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} />
                    Tạo khóa học mới
                  </label>
                </div>

                {mode === 'new' ? (
                  <div className="grid gap-3">
                    <input
                      value={courseTitle}
                      onChange={(event) => setCourseTitle(event.target.value)}
                      placeholder="Tên khóa học mới"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white"
                    />
                    <input
                      value={moduleTitle}
                      onChange={(event) => setModuleTitle(event.target.value)}
                      placeholder="Tên chương học"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white"
                    />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <select
                      value={selectedCourseId}
                      onChange={(event) => {
                        const next = event.target.value;
                        setSelectedCourseId(next);
                        const course = adminCourses.find((item) => item.id === next);
                        setSelectedModuleId(course?.modules[0]?.id || '');
                      }}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white"
                    >
                      <option value="">Chọn khóa học</option>
                      {adminCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedModuleId}
                      onChange={(event) => setSelectedModuleId(event.target.value)}
                      disabled={!selectedCourseId || createNewModule}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white disabled:opacity-60"
                    >
                      <option value="">Chọn chương (module)</option>
                      {(selectedCourse?.modules || []).map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>

                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={createNewModule}
                        onChange={(event) => setCreateNewModule(event.target.checked)}
                      />
                      Tạo chương học mới trước khi tải lên
                    </label>

                    {createNewModule && (
                      <input
                        value={moduleTitle}
                        onChange={(event) => setModuleTitle(event.target.value)}
                        placeholder="Tên chương học mới"
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white"
                      />
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#FF4F6E] shadow-sm">
                      <Sparkles size={16} fill="currentColor" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-tight">AI tự động tạo phụ đề và ghi chú hình ảnh sau khi xử lý.</p>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedLectureFile}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-[#FF4F6E] hover:shadow-[#FF4F6E]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  Tải lên khóa học
                </button>
                {publishMessage && <p className="text-xs font-bold text-slate-500">{publishMessage}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Video trong khóa học</h2>
                <p className="text-xs font-bold text-slate-400">{selectedCourse?.title || 'Chọn khóa học để xem danh sách bài giảng'}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-50">
                  {selectedCourseLessons.length === 0 ? (
                    <tr>
                      <td className="px-8 py-6 text-sm font-bold text-slate-400">Chưa có bài giảng nào trong khóa học này.</td>
                    </tr>
                  ) : (
                    selectedCourseLessons
                      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                      .map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-slate-900">{lesson.title}</p>
                            <p className="text-xs font-bold text-slate-400">{lesson.module_title}</p>
                          </td>
                          <td className="px-8 py-6">
                            <StatusBadge status={toBadgeStatus(lesson.status)} />
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => router.push(`/student/videos/${lesson.id}`)}
                              className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all"
                            >
                              <ArrowUpRight size={18} className="text-slate-300" />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white p-6 rounded-[28px] border border-slate-50 shadow-sm group hover:shadow-xl transition-all duration-500">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3', kpi.bg, kpi.color)}>
                  <kpi.icon size={22} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</p>
              </div>
            ))}
          </div>

          {currentRole === 'admin' && (
            <>
              <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
                <div className="p-8 flex items-center justify-between border-b border-slate-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Kiểm soát Đăng ký Vai trò</h2>
                    <p className="text-xs font-bold text-slate-400">Cài đặt lưu trong cơ sở dữ liệu, không cần sửa .env</p>
                  </div>
                  <label className="inline-flex items-center gap-3 text-xs font-bold text-slate-700">
                    <span>Mở đăng ký vai trò công khai</span>
                    <input
                      type="checkbox"
                      checked={allowPublicRoleRegistration}
                      disabled={savingSettings}
                      onChange={(event) => void handleTogglePublicRoleRegistration(event.target.checked)}
                    />
                  </label>
                </div>
                <div className="p-8 text-xs font-bold text-slate-500">
                  {allowPublicRoleRegistration
                    ? 'Đang mở: người dùng có thể chọn vai trò khi đăng ký (chỉ dành cho dev/test).'
                    : 'Đang đóng: đăng ký công khai sẽ mặc định vai trò Học viên (khuyến nghị cho production).'}
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
                <div className="p-8 flex items-center justify-between border-b border-slate-50">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Quản lý Vai trò Người dùng</h2>
                    <p className="text-xs font-bold text-slate-400">Nâng/Hạ quyền người dùng trực tiếp</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-50">
                      {adminUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-slate-900">{user.full_name || 'Không có tên'}</p>
                            <p className="text-xs font-bold text-slate-400">{user.email}</p>
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={user.role}
                              disabled={updatingRoleUserId === user.id}
                              onChange={(event) => void handleChangeUserRole(user.id, event.target.value as 'student' | 'teacher' | 'admin')}
                              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white"
                            >
                              <option value="student">Học viên</option>
                              <option value="teacher">Giảng viên</option>
                              <option value="admin">Quản trị viên</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {adminUsers.length === 0 && (
                        <tr>
                          <td className="px-8 py-6 text-sm font-bold text-slate-400">Không có người dùng nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Công việc đồng bộ gần đây</h2>
                <p className="text-xs font-bold text-slate-400">Trạng thái xử lý AI trực tiếp</p>
              </div>
              <button
                onClick={() => {
                  void loadAdminData(currentRole);
                }}
                className="px-5 py-2.5 bg-slate-50 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Làm mới nhật ký
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-50">
                  {recentJobs.map((job) => (
                    <tr key={job.job_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">ID</p>
                        <p className="text-sm font-bold text-slate-900">{job.job_id.slice(0, 8)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <FileVideo size={14} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-700">{job.lesson_title}</span>
                            <p className="text-[11px] font-bold text-slate-400">{job.course_title || 'Khóa học không xác định'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={toBadgeStatus(job.status)} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-bold text-slate-500">{job.progress}%</span>
                          <button
                            onClick={() => void handleDeleteVideoFromLog(job.lesson_id, job.lesson_title)}
                            disabled={deletingVideoId === job.lesson_id}
                            className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            {deletingVideoId === job.lesson_id ? 'Đang xóa' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentJobs.length === 0 && (
                    <tr>
                      <td className="px-8 py-6 text-sm font-bold text-slate-400">Không có công việc nào hiện tại.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm space-y-8">
            <h2 className="text-xl font-extrabold text-slate-900">Sức khỏe Mô hình AI</h2>
            <div className="space-y-6">
              {[
                { name: 'Tỷ lệ lỗi (Tiếng Việt)', val: modelHealth?.metrics.wer_vi_score ?? 0, color: 'bg-[#FF4F6E]' },
                { name: 'Tỷ lệ lỗi (Tiếng Anh)', val: modelHealth?.metrics.wer_en_score ?? 0, color: 'bg-blue-500' },
                {
                  name: 'Độ trễ ASR',
                  val: Math.max(0, 100 - Math.min(100, Math.round((modelHealth?.metrics.asr_latency_ms ?? 0) / 100))),
                  color: 'bg-amber-500',
                },
              ].map((metric) => (
                <div key={metric.name} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{metric.name}</span>
                    <span className="text-xs font-bold text-slate-900">{Math.round(metric.val)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-1000', metric.color)} style={{ width: `${Math.round(metric.val)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-900 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Activity size={18} className="text-[#FF4F6E]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Lưu lượng thực tế</span>
              </div>
              <div className="text-xs font-bold text-slate-200">
                Hàng đợi: {modelHealth?.metrics.queue_depth ?? 0} | Tỷ lệ lỗi: {modelHealth?.metrics.failure_rate_percent ?? 0}%
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FF4F6E] to-[#e64663] p-8 rounded-[32px] shadow-xl shadow-[#FF4F6E]/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-lg font-extrabold mb-2 italic">Triển khai nhanh</h3>
            <p className="text-white/70 text-xs font-bold mb-6">Tạo nhanh một khung khóa học mới cho học viên.</p>
            <button
              onClick={handleQuickDeploy}
              disabled={quickDeployLoading}
              className="w-full py-4 bg-white text-[#FF4F6E] rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-white/20 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-60"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              {quickDeployLoading ? 'Đang tạo...' : 'Khóa học mới'}
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
