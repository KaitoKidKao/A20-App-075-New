'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileVideo, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function UploadVideo() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartProcessing = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg('');

    // Simulate visual progress while uploading
    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
      fakeProgress += Math.random() * 8;
      if (fakeProgress > 90) fakeProgress = 90;
      setUploadProgress(fakeProgress);
    }, 300);

    try {
      const data = await api.videos.upload(selectedFile);
      clearInterval(progressInterval);

      if (data.video_id) {
        setUploadProgress(100);
        setTimeout(() => {
          router.push(`/student/videos/${data.video_id}/processing`);
        }, 800);
      } else {
        throw new Error('Server did not return a video_id.');
      }
    } catch (error: unknown) {
      clearInterval(progressInterval);
      const message = error instanceof Error ? error.message : 'Connection failed. Please ensure backend is running.';
      setErrorMsg(message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFE]">
      <div className="px-8 md:px-12 py-12 max-w-5xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="space-y-2">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
             Share your <span className="text-[#FF4F6E]">Knowledge</span>
           </h1>
           <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
             Upload lectures to generate AI insights and accessibility features
           </p>
        </div>

        <div className="relative bg-white rounded-[40px] p-12 shadow-sm border border-slate-50 overflow-hidden group">
          <div className="absolute top-0 right-0 w-[300px] h-full bg-[#FF4F6E]/5 rounded-l-[100px] -z-0" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Form & DragDrop */}
            <div className="space-y-8">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska" 
                className="hidden" 
              />

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-black animate-in fade-in slide-in-from-top-2">
                  ❌ {errorMsg}
                </div>
              )}

              {!isUploading ? (
                <div 
                  onClick={handleUploadClick}
                  className={`relative group border-4 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedFile 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-[#FF4F6E]/30 hover:shadow-2xl hover:shadow-[#FF4F6E]/10'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-[24px] shadow-lg flex items-center justify-center mb-8 transition-all group-hover:scale-110 group-hover:rotate-3 ${
                    selectedFile ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-300 group-hover:text-[#FF4F6E]'
                  }`}>
                    {selectedFile ? <CheckCircle2 size={40} /> : <UploadCloud size={40} />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {selectedFile ? 'Ready to Process!' : 'Drag & Drop Video'}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 text-center max-w-[240px]">
                    {selectedFile ? selectedFile.name : 'MP4, MOV or AVI files. Maximum 500MB.'}
                  </p>
                  
                  {selectedFile && (
                    <div className="mt-4 px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                       {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Valid
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-4 border-slate-50 rounded-[32px] p-12 flex flex-col items-center justify-center bg-white shadow-inner">
                  <div className="relative w-24 h-24 mb-8">
                     <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                     <div 
                       className="absolute inset-0 border-4 border-[#FF4F6E] rounded-full border-t-transparent animate-spin" 
                     />
                     <div className="absolute inset-0 flex items-center justify-center text-[#FF4F6E]">
                        <Zap size={32} fill="currentColor" />
                     </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {uploadProgress >= 100 ? 'Analysis Complete!' : 'Processing AI...'}
                  </h3>
                  
                  <div className="w-full max-w-xs bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="bg-[#FF4F6E] h-full rounded-full transition-all duration-500 shadow-lg shadow-[#FF4F6E]/30" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-[#FF4F6E] italic">{Math.round(uploadProgress)}%</span>
                </div>
              )}

              <div className="flex flex-col gap-4">
                 <button 
                   onClick={handleStartProcessing}
                   disabled={isUploading || !selectedFile}
                   className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                     isUploading || !selectedFile 
                       ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                       : 'bg-[#FF4F6E] text-white shadow-xl shadow-[#FF4F6E]/20 hover:bg-[#e64663] hover:scale-[1.02] active:scale-95'
                   }`}
                 >
                   {isUploading ? 'System working...' : 'Start AI Extraction'}
                 </button>
                 
                 <div className="flex items-center gap-4 p-4 bg-[#FF4F6E]/5 rounded-2xl border border-[#FF4F6E]/10">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF4F6E] shadow-sm">
                       <Sparkles size={20} fill="currentColor" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 leading-tight">
                       Transcribing audio and generating <span className="text-[#FF4F6E]">visual summaries</span> for inclusive learning.
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column: Illustration & Info */}
            <div className="hidden lg:block space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
               <div className="relative aspect-square w-full max-w-[340px] mx-auto group">
                  <div className="absolute inset-0 bg-[#FF4F6E] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
                  <Image 
                    src="/assets/images/upload-magic.png" 
                    alt="Magic Upload Illustration" 
                    fill
                    className="object-contain relative z-10"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Auto Captions', icon: FileVideo },
                    { label: 'Visual Notes', icon: Sparkles },
                    { label: 'Fast Sync', icon: Zap },
                    { label: 'HD Quality', icon: Play },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-3">
                       <item.icon size={16} className="text-[#FF4F6E]" />
                       <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
