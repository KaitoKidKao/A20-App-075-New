'use client';

import React from 'react';
import { UploadCloud, FileVideo, Info } from 'lucide-react';

export default function UploadVideo() {
  return (
    <div className="min-h-screen">
      <div className="px-8 md:px-12 py-8">

        <div className="card-premium p-12 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
            <div className="bg-rose-50 p-2 rounded-lg text-rose-500">
              <FileVideo size={24} />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Upload Video</h2>
          </div>

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 hover:border-primary/50 transition-all cursor-pointer group">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud size={40} className="text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Video Here</h3>
            <p className="text-slate-400 font-medium text-center max-w-sm">
              Drag and drop your video file here, or click to browse. Supported formats: MP4, MOV, AVI (Max 500MB).
            </p>
          </div>

          {/* Additional Info Box */}
          <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4">
            <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 space-y-1">
              <p className="font-bold">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 font-medium opacity-80">
                <li>Video processing may take several minutes depending on the file size.</li>
                <li>Ensure the audio quality is clear for better transcription accuracy.</li>
                <li>Captions will be generated automatically after upload.</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <button className="btn-primary px-12 py-4">
              Start Processing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
