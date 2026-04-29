'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadVideo() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartProcessing = () => {
    if (!selectedFile) {
      alert("Please select a video file first.");
      return;
    }
    
    setIsUploading(true);
    let currentProgress = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        
        // Wait a little bit at 100% then redirect
        setTimeout(() => {
          router.push('/student/videos/mock-video-1');
        }, 800);
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

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

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="video/mp4,video/quicktime,video/x-msvideo" 
            className="hidden" 
          />

          {/* Drag & Drop Area */}
          {!isUploading && progress === 0 ? (
            <div 
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer group ${selectedFile ? 'border-[#00D084] bg-[#00D084]/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-primary/50'}`}
            >
              <div className={`w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${selectedFile ? 'bg-[#00D084] text-white' : 'bg-white text-slate-400 group-hover:text-primary'}`}>
                {selectedFile ? <CheckCircle2 size={40} /> : <UploadCloud size={40} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {selectedFile ? 'File Selected!' : 'Upload Video Here'}
              </h3>
              <p className={`font-medium text-center max-w-sm ${selectedFile ? 'text-[#00D084]' : 'text-slate-400'}`}>
                {selectedFile ? selectedFile.name : 'Drag and drop your video file here, or click to browse. Supported formats: MP4, MOV, AVI (Max 500MB).'}
              </p>
            </div>
          ) : (
            <div className="border-2 border-slate-100 rounded-3xl p-16 flex flex-col items-center justify-center bg-slate-50">
              <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-[#4C40ED] animate-spin mb-6 flex items-center justify-center">
                <Loader2 size={32} className="text-[#4C40ED] absolute" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {progress >= 100 ? 'Processing Complete!' : 'Processing Video...'}
              </h3>
              <p className="text-slate-500 font-medium text-center mb-8">
                {progress >= 100 ? 'Redirecting to your lesson...' : 'Please do not close this window while we process your video.'}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-md bg-slate-200 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-[#00D084] h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-600">{Math.round(progress)}%</span>
            </div>
          )}

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
            <button 
              onClick={handleStartProcessing}
              disabled={isUploading || !selectedFile}
              className={`px-12 py-4 rounded-xl font-bold text-white transition-all ${
                isUploading || !selectedFile ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#4C40ED] hover:bg-[#3b30c9] shadow-lg shadow-[#4C40ED]/30'
              }`}
            >
              {isUploading ? 'Processing...' : 'Start Processing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
