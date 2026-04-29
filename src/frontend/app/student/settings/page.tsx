'use client';

import React from 'react';
import { Pencil } from 'lucide-react';

export default function StudentProfile() {
  const profileData = {
    firstName: 'Ronald',
    lastName: 'Richard',
    regDate: '16 Jan 2024, 11:15 AM',
    userName: 'studentdemo',
    phone: '90154-91036',
    email: 'studentdemo@example.com',
    gender: 'Male',
    dob: '16 Jan 2020',
    bio: "Hello! I'm Ronald Richard. I'm passionate about developing innovative software solutions, analyzing classic literature. I aspire to become a software developer, work as an editor. In my free time, I enjoy coding, reading, hiking etc."
  };

  return (
    <div className="min-h-screen">
      <div className="px-8 md:px-12 py-8 max-w-6xl mx-auto">

        <div className="card-premium p-10 w-full">
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">My Profile</h2>
            <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-slate-200">
              <Pencil size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-y-8 gap-x-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">First Name</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.firstName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">Last Name</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.lastName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">Registration Date</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.regDate}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">User Name</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.userName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">Phone Number</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.phone}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">Email</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.email}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">Gender</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.gender}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-1.5">DOB</p>
              <p className="text-[14px] font-semibold text-slate-700">{profileData.dob}</p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-3">Bio</p>
            <p className="text-[14px] font-medium text-slate-600 leading-relaxed max-w-4xl">
              {profileData.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
