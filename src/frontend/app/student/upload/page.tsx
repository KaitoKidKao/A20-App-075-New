'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, X, Film, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function TeacherUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Toán',
    classGroup: '',
    language: 'Tiếng Việt',
    notes: '',
  });

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    maxFiles: 1,
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.title) return;
    
    setIsSubmitting(true);
    // Giả lập API gọi lên server
    setTimeout(() => {
      // Chuyển hướng sang trang Processing Status (Page 3)
      router.push(`/student/videos/demo-vid-123/processing`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-3xl font-bold mb-2">Tải Lên Bài Giảng</h1>
        <p className="text-neutral mb-8">
          Hệ thống AI sẽ tự động phân tích video để trích xuất phụ đề (caption), transcript và tạo tóm tắt nội dung.
        </p>

        {/* Upload Zone */}
        <div className="mb-8 bg-card rounded-2xl shadow-card border border-border p-8">
          <h2 className="text-xl font-semibold mb-4">1. Video Bài Giảng *</h2>
          
          {!file ? (
            <div 
              {...getRootProps()} 
              className={cx(
                "w-full h-[260px] flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
                isDragActive ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/50 hover:bg-neutral/5"
              )}
            >
              <input {...getInputProps()} />
              <div className="bg-primary-soft text-primary p-4 rounded-full mb-4">
                <UploadCloud size={40} />
              </div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? "Thả video vào đây..." : "Kéo thả video bài giảng vào đây"}
              </p>
              <p className="text-neutral text-sm">Hỗ trợ: MP4, MOV, AVI, MKV — tối đa 2GB</p>
              
              <button 
                type="button"
                className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                onClick={(e) => e.preventDefault()} // Ngăn chặn nổi bọt để tự dropzone xử lý
              >
                Hoặc chọn tệp
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 border border-success/30 rounded-xl bg-success/5">
              <div className="w-24 h-16 bg-black rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden relative">
                <Film size={24} className="opacity-50" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 px-2 text-[10px] text-right font-mono">
                  ~45:00
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text truncate">{file.name}</p>
                <p className="text-sm text-neutral mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB • Đã tải lên thành công</p>
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

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-card border border-border p-8 mb-12">
          <h2 className="text-xl font-semibold mb-6">2. Thông Tin & Tùy Chọn</h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block font-medium text-text">Tiêu đề bài giảng *</label>
                <input 
                  id="title" 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="VD: Đạo hàm và vi phân" 
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="block font-medium text-text">Môn học</label>
                <select 
                  id="subject" 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow outline-none bg-white"
                >
                  <option>Toán</option>
                  <option>Lý</option>
                  <option>Hóa</option>
                  <option>Văn</option>
                  <option>Anh</option>
                  <option>Khác</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="class" className="block font-medium text-text">Lớp / Khóa học</label>
                <input 
                  id="class" 
                  type="text" 
                  value={formData.classGroup}
                  onChange={e => setFormData({...formData, classGroup: e.target.value})}
                  placeholder="VD: 10A1" 
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-shadow outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lang" className="block font-medium text-text">Ngôn ngữ giảng dạy</label>
                <select 
                  id="lang" 
                  value={formData.language}
                  onChange={e => setFormData({...formData, language: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-shadow outline-none bg-white"
                >
                  <option>Tiếng Việt</option>
                  <option>English</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block font-medium text-text">Ghi chú (Tùy chọn)</label>
              <textarea 
                id="notes" 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="Nhập ghi chú thêm cho bài giảng..." 
                className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none outline-none" 
              />
            </div>

            {/* Processing Options */}
            <div className="pt-4 border-t border-border mt-6">
              <h3 className="font-medium mb-4">Phân tích AI</h3>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-5 h-5 rounded border-2 border-border peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 transition-all"></div>
                    <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-neutral group-hover:text-text transition-colors">Tạo caption tự động</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-5 h-5 rounded border-2 border-border peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 transition-all"></div>
                    <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-neutral group-hover:text-text transition-colors">Tạo transcript</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-5 h-5 rounded border-2 border-border peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 transition-all"></div>
                    <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-neutral group-hover:text-text transition-colors">Tạo tóm tắt (Bullet points)</span>
                </label>
              </div>

              <div className="flex items-center gap-4 text-sm text-neutral mt-2 mb-6">
                <span className="font-medium mr-2">Chia đoạn nội dung:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chunk" value="30" className="accent-primary" />
                  <span>30s</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chunk" value="60" defaultChecked className="accent-primary" />
                  <span>60s</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chunk" value="90" className="accent-primary" />
                  <span>90s</span>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !file || !formData.title}
              className={cx(
                "w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-card outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2",
                (file && formData.title) ? "bg-primary text-white hover:bg-primary/95 active:scale-[0.99] hover:shadow-elevated" : "bg-neutral/20 text-neutral/60 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : "Bắt đầu xử lý AI"}
            </button>
            <p className="text-center text-sm text-neutral mt-3 flex items-center justify-center gap-2">
              <AlertCircle size={14} /> Video sẽ được AI phân tích. Quá trình có thể mất vài phút tùy độ dài.
            </p>
          </div>
        </form>

        {/* Recent Uploads Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Tải lên gần đây</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Mock Item 1 */}
            <div className="bg-card p-4 rounded-xl border border-border flex items-start gap-3">
              <div className="w-16 h-12 bg-black rounded shrink-0 relative overflow-hidden">
                <img src="/api/placeholder/64/48" alt="Thumbnail" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-success" />
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">Đạo hàm và vi phân</h4>
                <p className="text-xs text-neutral mt-1">Sẵn sàng • {Math.floor(Math.random() * 24)}h trước</p>
              </div>
            </div>

            {/* Mock Item 2 */}
            <div className="bg-card p-4 rounded-xl border border-border flex items-start gap-3">
              <div className="w-16 h-12 bg-neutral/20 rounded shrink-0 relative overflow-hidden flex items-center justify-center">
                <Clock size={16} className="text-warning animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">Cơ học lượng tử</h4>
                <p className="text-xs text-warning mt-1">Đang xử lý (68%)</p>
              </div>
            </div>

            {/* Mock Item 3 */}
            <div className="bg-card p-4 rounded-xl border border-border flex items-start gap-3 sm:hidden md:flex">
              <div className="w-16 h-12 bg-black rounded shrink-0 relative overflow-hidden">
                <img src="/api/placeholder/64/48" alt="Thumbnail" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-success" />
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">Văn học hiện đại</h4>
                <p className="text-xs text-neutral mt-1">Sẵn sàng • 2 ngày trước</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
