'use client';

import React from 'react';
import { 
  Bell, 
  User, 
  Moon, 
  Sun,
  LogOut
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { theme, setTheme, user, logout } = useAppStore();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<
    Array<{ id: string; message: string; created_at: string; read: boolean }>
  >([]);

  const loadNotifications = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const data = JSON.parse(window.localStorage.getItem('app_notifications') || '[]');
    setNotifications(Array.isArray(data) ? data : []);
  }, []);

  React.useEffect(() => {
    loadNotifications();
    const handler = () => loadNotifications();
    window.addEventListener('app-notification-updated', handler);
    return () => window.removeEventListener('app-notification-updated', handler);
  }, [loadNotifications]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllRead = () => {
    if (typeof window === 'undefined') return;
    const next = notifications.map((item) => ({ ...item, read: true }));
    window.localStorage.setItem('app_notifications', JSON.stringify(next));
    setNotifications(next);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-[var(--app-surface)] border-b border-[var(--app-border-subtle)]">
      {/* Main Header */}
      <div className="h-20 bg-[var(--app-surface)] border-b border-[var(--app-border-subtle)] px-8 grid grid-cols-3 items-center relative z-50">
        {/* Left Side (Empty for now) */}
        <div></div>

        {/* Center Search Bar (Optional addition for utility) */}
        <div className="hidden lg:flex items-center justify-center">
           <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="Tìm kiếm khóa học..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                 <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
           </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-end gap-6">
          {/* Utility Icons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
              title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
              className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-full transition-all"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  const next = !notifOpen;
                  setNotifOpen(next);
                  if (next) markAllRead();
                }}
                className="rounded-full p-2.5 text-slate-500 transition-all hover:bg-slate-50 hover:text-primary relative"
                aria-label="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[320px] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl z-50">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Thông báo</p>
                    <button
                      className="text-[11px] font-bold text-slate-500 hover:text-primary"
                      onClick={markAllRead}
                    >
                      Đánh dấu đã đọc
                    </button>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 px-3 py-4 text-xs font-bold text-slate-400">
                        Chưa có thông báo.
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-100 px-3 py-2">
                          <p className="text-xs font-bold text-slate-700">{item.message}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-100" />

          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer group relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                {user?.name || 'Khách'}
              </p>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                {user?.role || 'Khách'}
              </p>
            </div>
            
            <div className="relative group/avatar">
              <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center group-hover:border-primary transition-all">
                <User className="text-slate-400" size={24} />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              
              {/* Simple Dropdown on hover/click */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all">
                 <button 
                   onClick={handleLogout}
                   className="w-full px-4 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-red-500 flex items-center gap-2"
                 >
                    <LogOut size={16} />
                    Đăng xuất
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
