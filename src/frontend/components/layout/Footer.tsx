'use client';

import React from 'react';
import { Mail, MapPin, Phone, Globe, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-20">
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">DreamsLMS</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px]">
              Platform designed to help organizations, educators, and learners manage, deliver, and track learning and training activities.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"><Globe size={18} /></button>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"><Globe size={18} /></button>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"><Globe size={18} /></button>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"><Globe size={18} /></button>
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">For Instructor</h4>
            <ul className="space-y-3 text-[15px] font-medium text-slate-500">
              <li className="hover:text-primary transition-colors cursor-pointer">Search Mentors</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Login</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Register</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Booking</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Students</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Dashboard</li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">For Student</h4>
            <ul className="space-y-3 text-[15px] font-medium text-slate-500">
              <li className="hover:text-primary transition-colors cursor-pointer">Appointments</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Chat</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Login</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Register</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Instructor Dashboard</li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">Newsletter</h4>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter your email address" 
                className="w-full pl-4 pr-32 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              <button className="absolute right-1.5 top-1.5 bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                Subscribe
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 text-slate-500">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span className="text-[14px]">3556 Beech Street, San Francisco, California, CA 94108</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Mail size={18} className="shrink-0" />
                <span className="text-[14px]">dreamslms@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Phone size={18} className="shrink-0" />
                <span className="text-[14px]">+19 123-456-7890</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-slate-100 bg-[#14142B] text-white/50 py-6">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-black uppercase tracking-widest">
          <p>© 2026 Dreams. All rights reserved.</p>
          <div className="flex gap-10">
            <span className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
