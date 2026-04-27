'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { FileText, UploadCloud, X, Headphones, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function DocumentConversionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultAudioUrl, setResultAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultAudioUrl(null);
      setErrorMsg(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB max for documents usually
    maxFiles: 1,
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setResultAudioUrl(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsSubmitting(true);
    setErrorMsg(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Connect to the Backend API (FastAPI running on port 8000)
      const response = await fetch('http://localhost:8000/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Đã có lỗi xảy ra khi chuyển đổi tài liệu.');
      }

      // Handle the audio blob response
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setResultAudioUrl(audioUrl);
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể kết nối tới server xử lý.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <FileText size={28} />
          </div>
          <h1 className="text-3xl font-bold">Chuyển đổi Tài Liệu sang Âm Thanh</h1>
        </div>
        <p className="text-neutral mb-8">
          Hệ thống AI sẽ trích xuất văn bản từ file PDF/DOCX và tạo ra file Audio (MP3) với giọng đọc tự nhiên.
        </p>

        {/* Upload Zone */}
        <div className="mb-8 bg-card rounded-2xl shadow-card border border-border p-8">
          <h2 className="text-xl font-semibold mb-4">1. Tải lên tài liệu *</h2>
          
          {!file ? (
            <div 
              {...getRootProps()} 
              className={cx(
                "w-full h-[260px] flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors outline-none",
                isDragActive ? "border-blue-500 bg-blue-50 text-blue-600" : "border-border hover:border-blue-500/50 hover:bg-neutral/5"
              )}
            >
              <input {...getInputProps()} />
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                <UploadCloud size={40} />
              </div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? "Thả tài liệu vào đây..." : "Kéo thả file PDF hoặc DOCX vào đây"}
              </p>
              <p className="text-neutral text-sm">Hỗ trợ: PDF, DOCX — tối đa 50MB</p>
              
              <button 
                type="button"
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Hoặc chọn tệp
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 border border-success/30 rounded-xl bg-success/5">
              <div className="w-16 h-16 bg-white border rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                <FileText size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text truncate">{file.name}</p>
                <p className="text-sm text-neutral mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB • Đã tải lên</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-neutral hover:text-danger hover:bg-danger/10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-danger"
                aria-label="Xóa tệp"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Convert Button */}
        <form onSubmit={handleSubmit} className="mb-8">
          <button 
            type="submit"
            disabled={isSubmitting || !file || !!resultAudioUrl}
            className={cx(
              "w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-card outline-none",
              (file && !resultAudioUrl) ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] hover:shadow-elevated" : "bg-neutral/20 text-neutral/60 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý tài liệu qua Backend API...
              </>
            ) : "Bắt đầu chuyển đổi"}
          </button>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-danger/10 text-danger flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}
        </form>

        {/* Result Area */}
        {resultAudioUrl && (
          <div className="bg-card rounded-2xl shadow-card border border-blue-500/30 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="text-success" size={24} />
              <h2 className="text-xl font-semibold">Chuyển đổi hoàn tất!</h2>
            </div>
            
            <div className="bg-neutral/5 p-6 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-3 text-blue-600 font-medium">
                <Headphones size={24} />
                <span>Audio đã sẵn sàng</span>
              </div>
              
              <audio controls className="w-full" src={resultAudioUrl}>
                Trình duyệt của bạn không hỗ trợ thẻ audio.
              </audio>

              <a 
                href={resultAudioUrl} 
                download={`Audio_${file?.name.replace(/\.[^/.]+$/, "")}.mp3`}
                className="mt-2 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-border text-text font-semibold rounded-lg hover:bg-neutral/5 transition-colors"
              >
                <Download size={18} />
                Tải xuống MP3
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
