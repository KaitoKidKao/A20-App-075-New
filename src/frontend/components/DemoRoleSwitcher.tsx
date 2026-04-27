'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  Users, 
  BookOpen, 
  ShieldCheck,
  X,
  Accessibility
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

  const handleRoleChange = (role: 'teacher' | 'admin') => {
    setRole(role);
    setIsOpen(false);
    
    if (role === 'teacher') router.push('/student/library');
    else if (role === 'admin') router.push('/admin');
  };

  return (
    <>
      {/* FAB Button - Grounded Style */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-primary text-white p-4 rounded-2xl shadow-elevated hover:bg-slate-700 transition-all active:scale-95 group"
        aria-label="Đổi vai trò demo"
      >
        <Accessibility size={24} strokeWidth={2.5} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-300" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-elevated p-8 animate-in zoom-in-95 duration-300 border border-border">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Chế độ học tập</h2>
                <p className="text-xs text-neutral font-medium mt-1 uppercase tracking-widest">Simulator v1.0</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-neutral"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleRoleChange('teacher')}
                className={cn(
                  "w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group",
                  currentRole === 'teacher' 
                    ? "border-primary bg-secondary-bg shadow-sm" 
                    : "border-border hover:border-primary/20 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  currentRole === 'teacher' ? "bg-primary text-white" : "bg-slate-100 text-neutral group-hover:text-primary"
                )}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="font-bold text-text">Học sinh</p>
                  <p className="text-xs text-neutral font-medium">Chế độ học tập cá nhân</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleChange('admin')}
                className={cn(
                  "w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group",
                  currentRole === 'admin' 
                    ? "border-primary bg-secondary-bg shadow-sm" 
                    : "border-border hover:border-primary/20 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  currentRole === 'admin' ? "bg-primary text-white" : "bg-slate-100 text-neutral group-hover:text-primary"
                )}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-text">Quản trị viên</p>
                  <p className="text-xs text-neutral font-medium">Cấu hình & Vận hành AI</p>
                </div>
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-border flex justify-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-neutral/40 uppercase tracking-widest">
                <span>AI20K-200</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Accessibility First</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
