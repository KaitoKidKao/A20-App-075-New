'use client';

import React from 'react';
import { Settings, User, Bell, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Settings size={28} />
          </div>
          Cài đặt hệ thống
        </h1>
        <p className="text-neutral mt-2">Quản lý tài khoản và cấu hình hệ thống trợ năng cá nhân.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Menu cài đặt */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary-soft text-primary font-semibold rounded-xl text-left">
            <User size={18} /> Hồ sơ cá nhân
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral hover:bg-neutral/5 hover:text-text rounded-xl text-left transition-all">
            <Bell size={18} /> Thông báo
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral hover:bg-neutral/5 hover:text-text rounded-xl text-left transition-all">
            <Shield size={18} /> Quyền riêng tư
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral hover:bg-neutral/5 hover:text-text rounded-xl text-left transition-all">
            <Key size={18} /> Đổi mật khẩu
          </button>
        </div>

        {/* Nội dung cài đặt */}
        <div className="md:col-span-3 bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Thông tin tài khoản</h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-border">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold">
                GV
              </div>
              <div>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-neutral/5 transition-colors">
                  Thay đổi ảnh đại diện
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral">Họ và tên</label>
                <input type="text" defaultValue="Nguyễn Minh Giáo Viên" className="w-full px-4 py-2 bg-neutral/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral">Chức vụ</label>
                <input type="text" defaultValue="Giảng viên" disabled className="w-full px-4 py-2 bg-neutral/10 border border-border rounded-lg text-neutral cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral">Email liên hệ</label>
              <input type="email" defaultValue="teacher@udl.edu.vn" className="w-full px-4 py-2 bg-neutral/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div className="pt-6">
              <button className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
