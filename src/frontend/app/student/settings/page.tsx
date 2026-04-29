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
      <div className="px-8 md:px-12 py-8">

        <div className="card-premium p-10 max-w-5xl">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-extrabold tracking-tight">My Profile</h2>
            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-colors border border-slate-200">
              <Pencil size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-y-10 gap-x-12">
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">First Name</p>
              <p className="font-semibold text-slate-700">{profileData.firstName}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Last Name</p>
              <p className="font-semibold text-slate-700">{profileData.lastName}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Registration Date</p>
              <p className="font-semibold text-slate-700">{profileData.regDate}</p>
            </div>

            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">User Name</p>
              <p className="font-semibold text-slate-700">{profileData.userName}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</p>
              <p className="font-semibold text-slate-700">{profileData.phone}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email</p>
              <p className="font-semibold text-slate-700">{profileData.email}</p>
            </div>

            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gender</p>
              <p className="font-semibold text-slate-700">{profileData.gender}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">DOB</p>
              <p className="font-semibold text-slate-700">{profileData.dob}</p>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-100">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bio</p>
            <p className="font-medium text-slate-600 leading-relaxed max-w-4xl">
              {profileData.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
