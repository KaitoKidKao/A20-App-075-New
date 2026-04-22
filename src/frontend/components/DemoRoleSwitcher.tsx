'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  Users, 
  GraduationCap, 
  Presentation, 
  ShieldCheck,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function DemoRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentRole, setRole } = useAppStore();
  const router = useRouter();

  const handleRoleChange = (role: 'teacher' | 'student' | 'admin') => {
    setRole(role);
    setIsOpen(false);
    
    // Redirect to respective dashboard after switch
    if (role === 'teacher') router.push('/teacher/library');
    else if (role === 'student') router.push('/student/library');
    else if (role === 'admin') router.push('/admin');
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-elevated hover:scale-110 active:scale-95 transition-all group"
        aria-label="Đổi vai trò demo"
      >
        <Users size={24} />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Đổi vai trò demo
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-elevated p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Chuyển đổi vai trò</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleChange('student')}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  currentRole === 'student' 
                    ? "border-primary bg-primary-soft" 
                    : "border-border hover:border-primary/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg",
                  currentRole === 'student' ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="font-bold">Sinh viên khiếm thính</p>
                  <p className="text-sm text-neutral">Xem caption, tóm tắt và học tập</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleChange('teacher')}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  currentRole === 'teacher' 
                    ? "border-primary bg-primary-soft" 
                    : "border-border hover:border-primary/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg",
                  currentRole === 'teacher' ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <Presentation size={24} />
                </div>
                <div>
                  <p className="font-bold">Giáo viên / Cán bộ</p>
                  <p className="text-sm text-neutral">Tải video, mở live session</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleChange('admin')}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  currentRole === 'admin' 
                    ? "border-primary bg-primary-soft" 
                    : "border-border hover:border-primary/30 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg",
                  currentRole === 'admin' ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold">Admin / Ops</p>
                  <p className="text-sm text-neutral">Quản lý hệ thống và hiệu năng AI</p>
                </div>
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-neutral">
              Chế độ Simulator v1.0 • AI20K-200
            </p>
          </div>
        </div>
      )}
    </>
  );
}
