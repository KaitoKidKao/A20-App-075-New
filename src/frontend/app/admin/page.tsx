'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Clock,
  Database,
  FileVideo,
  Plus,
  ShieldCheck,
  UploadCloud,
  Users,
  Zap,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Settings,
  UserX,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, type Status } from '@/components/ui/StatusBadge';
import { api, type AdminCourseWorkspace, type AdminDashboard, type AdminRecentJob, type AdminUser } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [recentJobs, setRecentJobs] = useState<AdminRecentJob[]>([]);
  const [adminCourses, setAdminCourses] = useState<AdminCourseWorkspace[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [allowPublicRoleRegistration, setAllowPublicRoleRegistration] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);

  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [courseTitle, setCourseTitle] = useState('');
  const [selectedLectureFiles, setSelectedLectureFiles] = useState<File[]>([]);
  const [publishMessage, setPublishMessage] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [createNewModule, setCreateNewModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');

  // Course Edit Modal State
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{ id: string, title: string, description: string, is_published: boolean } | null>(null);
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    type?: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Xác nhận',
    type: 'danger'
  });

  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));


  const loadAdminData = useCallback(async (role: 'admin' | 'teacher' | 'student') => {
    try {
      const [dashboardData, jobsData, coursesData] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.listRecentJobs(20),
        api.admin.listCourses(),
      ]);
      setDashboard(dashboardData);
      setRecentJobs(jobsData);
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
        const currentSelectedCourse = coursesData.find(c => c.id === (selectedCourseId || coursesData[0].id));
        if (currentSelectedCourse && currentSelectedCourse.modules.length > 0) {
          const firstModule = currentSelectedCourse.modules[0];
          setSelectedModuleId((prev) => prev || firstModule.id);
        }
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  }, [selectedCourseId]);

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
  }, [router, loadAdminData]);

  const selectedCourse = useMemo(
    () => adminCourses.find((course) => course.id === selectedCourseId),
    [adminCourses, selectedCourseId]
  );
  const kpis = useMemo(() => {
    const processingCount = recentJobs.filter((job) =>
      ['pending', 'queued', 'processing', 'transcribing', 'extracting_audio', 'ai_processing', 'translating'].includes(job.status)
    ).length;
    const activeUsers = dashboard?.stats.student_count ?? 0;
    const failedJobs = dashboard?.stats.failed_video_jobs ?? 0;
    const courseCount = adminCourses.length;
    const lessonCount = dashboard?.stats.lesson_count ?? 0;
    const completionRate = dashboard?.stats.completion_rate ?? 0;

    return [
      { label: 'Đang xử lý', value: String(processingCount), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Khóa học', value: String(courseCount), icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Bài giảng', value: String(lessonCount), icon: FileVideo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Người dùng', value: String(activeUsers), icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
      { label: 'Lỗi xử lý', value: String(failedJobs), icon: AlertCircle, color: 'text-[#FF4F6E]', bg: 'bg-[#FF4F6E]/5' },
      { label: 'Hoàn thành', value: `${completionRate}%`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];
  }, [dashboard, recentJobs, adminCourses]);

  const handleTogglePublicRoleRegistration = async (nextValue: boolean) => {
    setSavingSettings(true);
    try {
      await api.admin.updateSettings({ allow_public_role_registration: nextValue });
      setAllowPublicRoleRegistration(nextValue);
      setPublishMessage(`Đã cập nhật: Đăng ký vai trò = ${nextValue ? 'MỞ' : 'ĐÓNG'}.`);
    } catch {
      setPublishMessage('Không thể cập nhật cài đặt.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangeUserRole = async (userId: string, nextRole: 'student' | 'teacher' | 'admin') => {
    setUpdatingRoleUserId(userId);
    try {
      await api.admin.updateUserRole(userId, nextRole);
      setAdminUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: nextRole } : user)));
      setPublishMessage(`Đã cập nhật vai trò người dùng.`);
    } catch {
      setPublishMessage('Lỗi khi cập nhật vai trò.');
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Người Dùng',
      message: `Bạn có chắc muốn XÓA người dùng ${email}? Mọi dữ liệu liên quan sẽ bị mất.`,
      onConfirm: async () => {
        closeConfirmModal();
        setDeletingUserId(userId);
        try {
          await api.admin.deleteUser(userId);
          setAdminUsers((prev) => prev.filter(u => u.id !== userId));
          setPublishMessage(`Đã xóa người dùng ${email}.`);
        } catch {
          setPublishMessage('Lỗi khi xóa người dùng.');
        } finally {
          setDeletingUserId(null);
        }
      },
      confirmText: 'Xóa ngay',
      type: 'danger'
    });
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Khóa Học',
      message: `CẢNH BÁO: Bạn có chắc chắn muốn XÓA khóa học "${title}"? Toàn bộ video và bài giảng bên trong sẽ bị xóa vĩnh viễn.`,
      onConfirm: async () => {
        closeConfirmModal();
        setDeletingCourseId(courseId);
        try {
          await api.admin.deleteCourse(courseId);
          setAdminCourses((prev) => prev.filter(c => c.id !== courseId));
          if (selectedCourseId === courseId) setSelectedCourseId('');
          setPublishMessage(`Đã xóa khóa học "${title}".`);
        } catch {
          setPublishMessage('Lỗi khi xóa khóa học.');
        } finally {
          setDeletingCourseId(null);
        }
      },
      confirmText: 'Xóa vĩnh viễn',
      type: 'danger'
    });
  };

  const handleToggleCourseVisibility = async (course: AdminCourseWorkspace) => {
    setUpdatingCourseId(course.id);
    try {
      const nextPublished = !course.is_published;
      await api.admin.updateCourse(course.id, { is_published: nextPublished });
      setAdminCourses((prev) => prev.map(c => c.id === course.id ? { ...c, is_published: nextPublished } : c));
      setPublishMessage(`Đã ${nextPublished ? 'hiện' : 'ẩn'} khóa học.`);
    } catch {
      setPublishMessage('Lỗi khi cập nhật trạng thái hiển thị.');
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const handleSaveCourseEdit = async () => {
    if (!editingCourse) return;
    setUpdatingCourseId(editingCourse.id);
    try {
      await api.admin.updateCourse(editingCourse.id, {
        title: editingCourse.title,
        description: editingCourse.description,
        is_published: editingCourse.is_published
      });
      setAdminCourses((prev) => prev.map(c => c.id === editingCourse.id ? { 
        ...c, 
        title: editingCourse.title, 
        description: editingCourse.description,
        is_published: editingCourse.is_published
      } : c));
      setIsEditCourseModalOpen(false);
      setPublishMessage('Đã cập nhật thông tin khóa học.');
    } catch {
      setPublishMessage('Lỗi khi cập nhật khóa học.');
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const handleDeleteVideoFromLog = async (videoId: string, lessonTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Video',
      message: `Bạn có chắc muốn xóa video "${lessonTitle}"?`,
      onConfirm: async () => {
        closeConfirmModal();
        setDeletingVideoId(videoId);
        try {
          await api.videos.delete(videoId);
          await loadAdminData(currentRole);
          setPublishMessage(`Đã xóa video.`);
        } catch {
          setPublishMessage('Lỗi khi xóa video.');
        } finally {
          setDeletingVideoId(null);
        }
      },
      confirmText: 'Xóa',
      type: 'danger'
    });
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
    if (selectedLectureFiles.length === 0) {
      setPublishMessage('Chọn video trước khi tải lên.');
      return;
    }
    setIsUploading(true);
    setUploadProgress(15);
    try {
      const target = await resolveUploadTarget();
      setUploadProgress(50);
      const upload = await api.videos.uploadBatch(selectedLectureFiles, target.moduleId);
      setUploadProgress(100);
      setSelectedLectureFiles([]);
      setCourseTitle('');
      setCreateNewModule(false);
      await loadAdminData(currentRole);
      setPublishMessage(`${target.messagePrefix}. Thành công ${upload.success_count}/${upload.total}${upload.failed_count > 0 ? `, thất bại ${upload.failed_count}` : ''}.`);
    } catch (err) {
      setPublishMessage(err instanceof Error ? err.message : 'Lỗi tải lên.');
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
      {/* Header */}
      <div className="relative bg-[#14142B] rounded-[40px] p-10 overflow-hidden shadow-2xl group">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-[#FF4F6E]/10 rounded-l-[100px] -z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4F6E]/20 text-[#FF4F6E] rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} fill="currentColor" />
              Quyền Quản trị viên
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Quản trị <span className="text-[#FF4F6E] italic">Hệ thống</span>
            </h1>
            <p className="text-white/50 font-bold max-w-md text-sm">
              Quản lý khóa học, người dùng và theo dõi tiến trình xử lý video.
            </p>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-[#FF4F6E] flex items-center justify-center shadow-xl shadow-[#FF4F6E]/20">
            <Zap size={32} className="text-white" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
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

      {/* Upload Section */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FF4F6E]/10 flex items-center justify-center text-[#FF4F6E]">
            <UploadCloud size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Đăng tải Bài giảng</h2>
            <p className="text-xs font-bold text-slate-400">Thêm video mới vào hệ thống</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              'relative border-4 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center transition-all cursor-pointer group',
              isUploading ? 'bg-slate-50 border-slate-100' : 'bg-[#F8F9FB] border-slate-100 hover:bg-white hover:border-[#FF4F6E]/30'
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
              onChange={(event) => setSelectedLectureFiles(Array.from(event.target.files || []))}
            />
            {isUploading ? (
              <div className="text-center space-y-4">
                <LoaderIcon className="w-12 h-12 text-[#FF4F6E] animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-900">{uploadProgress}% Đang tải lên...</div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-400 group-hover:text-[#FF4F6E] transition-all mb-4">
                  <Plus size={32} />
                </div>
                <p className="text-sm font-bold text-slate-900">Chọn hoặc Kéo thả Video</p>
                {selectedLectureFiles.length > 0 && (
                  <p className="mt-2 text-[11px] font-bold text-[#FF4F6E]">{selectedLectureFiles.length} file đã chọn</p>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="flex-1 inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} className="accent-[#FF4F6E]" />
                Sẵn có
              </label>
              <label className="flex-1 inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} className="accent-[#FF4F6E]" />
                Khóa học mới
              </label>
            </div>

            {mode === 'new' ? (
              <div className="space-y-3">
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Tên khóa học mới"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white transition-all"
                />
                <input
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Tên chương (Module)"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white transition-all"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSelectedCourseId(next);
                    const course = adminCourses.find((item) => item.id === next);
                    setSelectedModuleId(course?.modules[0]?.id || '');
                  }}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white transition-all"
                >
                  <option value="">Chọn khóa học</option>
                  {adminCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                <div className="flex gap-3">
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    disabled={!selectedCourseId || createNewModule}
                    className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white disabled:opacity-50 transition-all"
                  >
                    <option value="">Chọn chương</option>
                    {(selectedCourse?.modules || []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                  <button 
                    onClick={() => setCreateNewModule(!createNewModule)}
                    className={cn("px-4 rounded-2xl border transition-all", createNewModule ? "bg-[#FF4F6E] border-[#FF4F6E] text-white" : "bg-slate-50 border-slate-100 text-slate-400")}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {createNewModule && (
                  <input
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="Tên chương học mới"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white transition-all animate-in slide-in-from-top-2"
                  />
                )}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading || selectedLectureFiles.length === 0}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-[#FF4F6E] transition-all disabled:opacity-50 shadow-lg"
            >
              Bắt đầu xử lý video
            </button>
            {publishMessage && <p className="text-center text-xs font-bold text-[#FF4F6E]">{publishMessage}</p>}
          </div>
        </div>
      </div>

      {/* Course Management Section */}
      <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
               <Database size={20} />
             </div>
             <div>
               <h2 className="text-xl font-extrabold text-slate-900">Quản lý Khóa học</h2>
               <p className="text-xs font-bold text-slate-400">Danh sách tất cả các khóa học trong hệ thống</p>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Khóa học</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Thống kê</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-8 py-4 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {adminCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#FF4F6E] transition-colors">{course.title}</p>
                    <p className="text-xs font-bold text-slate-400 truncate max-w-xs">{course.description || "Chưa có mô tả"}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {course.modules.length} chương
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleToggleCourseVisibility(course)}
                      disabled={updatingCourseId === course.id}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all",
                        course.is_published ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {course.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {course.is_published ? 'Đang hiện' : 'Đang ẩn'}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => {
                          setEditingCourse({ id: course.id, title: course.title, description: course.description || '', is_published: course.is_published });
                          setIsEditCourseModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        disabled={deletingCourseId === course.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Management Toggle */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4F6E]/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#FF4F6E] border border-white/10">
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Cài đặt Đăng ký Vai trò</h2>
              <p className="text-sm font-bold text-white/50">Cho phép người dùng chọn vai trò (Admin/Teacher) khi đăng ký</p>
            </div>
          </div>
          
          <button 
            onClick={() => handleTogglePublicRoleRegistration(!allowPublicRoleRegistration)}
            disabled={savingSettings}
            className={cn(
              "relative w-48 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl",
              allowPublicRoleRegistration ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white/10 text-white/50 border border-white/10"
            )}
          >
            {savingSettings ? 'Đang lưu...' : allowPublicRoleRegistration ? 'Đang MỞ' : 'Đang ĐÓNG'}
            <div className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full", allowPublicRoleRegistration ? "bg-white animate-pulse" : "bg-white/20")} />
          </button>
        </div>
      </div>

      {currentRole === 'admin' && (
        <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
               <Users size={20} />
             </div>
             <div>
               <h2 className="text-xl font-extrabold text-slate-900">Quản lý Người dùng</h2>
               <p className="text-xs font-bold text-slate-400">Phân quyền và quản lý tài khoản người dùng</p>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Người dùng</th>
                  <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Vai trò</th>
                  <th className="px-8 py-4 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                           {user.full_name?.[0] || user.email[0]}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900">{user.full_name || 'Học viên mới'}</p>
                           <p className="text-xs font-bold text-slate-400">{user.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select
                        value={user.role}
                        disabled={updatingRoleUserId === user.id}
                        onChange={(e) => handleChangeUserRole(user.id, e.target.value as 'student' | 'teacher' | 'admin')}
                        className={cn(
                          "rounded-xl border-none px-4 py-2 text-xs font-extrabold transition-all outline-none",
                          user.role === 'admin' ? "bg-rose-50 text-rose-600" : user.role === 'teacher' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
                        )}
                      >
                        <option value="student">Học viên</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        disabled={deletingUserId === user.id}
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <UserX size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sync Jobs Section */}
      <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
               <Clock size={20} />
             </div>
             <div>
               <h2 className="text-xl font-extrabold text-slate-900">Nhật ký Xử lý Video</h2>
               <p className="text-xs font-bold text-slate-400">Trạng thái đồng bộ và xử lý AI của các video</p>
             </div>
          </div>
          <button 
            onClick={() => loadAdminData(currentRole)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            <Activity size={16} />
            Làm mới
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Video / Bài giảng</th>
                <th className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-8 py-4 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentJobs.map((job) => (
                <tr key={job.job_id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-slate-400">#{job.job_id.slice(0, 8)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileVideo size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{job.lesson_title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.course_title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={toBadgeStatus(job.status)} />
                      <span className="text-xs font-bold text-slate-400">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => handleDeleteVideoFromLog(job.lesson_id, job.lesson_title)}
                      disabled={deletingVideoId === job.lesson_id}
                      className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 hover:underline disabled:opacity-50"
                    >
                      {deletingVideoId === job.lesson_id ? 'Đang xóa...' : 'Xóa Log'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Course Modal */}
      {isEditCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 p-8 text-white">
                 <h3 className="text-2xl font-extrabold">Chỉnh sửa Khóa học</h3>
                 <p className="text-sm font-bold text-white/50">Cập nhật thông tin cơ bản của khóa học</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Tên khóa học</label>
                    <input 
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Mô tả</label>
                    <textarea 
                      rows={4}
                      value={editingCourse.description}
                      onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-[#FF4F6E]/40 focus:bg-white transition-all resize-none"
                    />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-700">Trạng thái công khai</span>
                    <button 
                      onClick={() => setEditingCourse({...editingCourse, is_published: !editingCourse.is_published})}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        editingCourse.is_published ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", editingCourse.is_published ? "right-1" : "left-1")} />
                    </button>
                 </div>
              </div>
              <div className="p-8 pt-0 flex gap-4">
                 <button 
                   onClick={() => setIsEditCourseModalOpen(false)}
                   className="flex-1 py-4 rounded-2xl border border-slate-100 font-extrabold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                 >
                   Hủy
                 </button>
                 <button 
                   onClick={handleSaveCourseEdit}
                   disabled={updatingCourseId === editingCourse.id}
                   className="flex-1 py-4 bg-[#FF4F6E] text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] transition-all"
                 >
                   {updatingCourseId === editingCourse.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg",
                confirmModal.type === 'danger' ? "bg-rose-50 text-rose-600 shadow-rose-100" : "bg-blue-50 text-blue-600 shadow-blue-100"
              )}>
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">{confirmModal.title}</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="p-8 pt-0 flex gap-4">
              <button 
                onClick={closeConfirmModal}
                className="flex-1 py-4 rounded-2xl border border-slate-100 font-extrabold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className={cn(
                  "flex-1 py-4 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-xl transition-all",
                  confirmModal.type === 'danger' 
                    ? "bg-rose-600 shadow-rose-200 hover:bg-rose-700" 
                    : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                )}
              >
                {confirmModal.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
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
