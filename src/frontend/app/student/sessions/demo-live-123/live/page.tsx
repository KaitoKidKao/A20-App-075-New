'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Maximize2, 
  Bookmark, 
  MessageSquare, 
  RotateCcw,
  Minus,
  Plus,
  Moon,
  Sun,
  Layout
} from 'lucide-react';
import { CaptionDisplay } from '@/components/ui/CaptionDisplay';
import { useAppStore } from '@/store/useAppStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StudentLiveSessionPage() {
  const { fontSize, setFontSize, autoScroll, setAutoScroll, highContrast, setHighContrast } = useAppStore();
  const [partialText, setPartialText] = useState('Hôm nay chúng ta sẽ ôn lại phần đạo hàm');
  const [finalLines, setFinalLines] = useState([
    'Chào các em, cảm ơn các em đã tham gia đầy đủ.',
    'Chúng ta sẽ bắt đầu tiết học ngay bây giờ.',
    'Nhớ mở thiết bị để theo dõi phụ đề trực tiếp nhé.'
  ]);
  const [showToolbar, setShowToolbar] = useState(true);

  // Simulate live caption updates
  useEffect(() => {
    const mockPhrases = [
      'Khái niệm về giới hạn...',
      'Khi x tiến dần tới x0...',
      'Tỷ số của dy và dx...',
      'Công thức tính nhanh đạo hàm...'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      setFinalLines(prev => [...prev, partialText].slice(-8));
      setPartialText(mockPhrases[index % mockPhrases.length]);
      index++;
    }, 4000);

    return () => clearInterval(interval);
  }, [partialText]);

  const fontSizes: ('S' | 'M' | 'L' | 'XL')[] = ['S', 'M', 'L', 'XL'];

  const adjustFontSize = (delta: number) => {
    const currentIndex = fontSizes.indexOf(fontSize);
    const newIndex = Math.max(0, Math.min(fontSizes.length - 1, currentIndex + delta));
    setFontSize(fontSizes[newIndex]);
  };

  return (
    <div className={cn(
      "fixed inset-0 top-16 lg:left-0 z-40 flex flex-col animate-in fade-in duration-500 overflow-hidden transition-colors duration-300",
      highContrast ? "bg-black" : "bg-slate-900"
    )}>
      {/* Accessibility Toolbar (Top) */}
      <div className={cn(
        "px-4 py-2 flex items-center justify-between border-b transition-all duration-300",
        highContrast ? "bg-zinc-900 border-zinc-800" : "bg-slate-800 border-slate-700",
        !showToolbar && "-translate-y-full h-0 opacity-0"
      )}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => adjustFontSize(-1)}
            className="p-2 text-white hover:bg-white/10 rounded-lg"
            title="Giảm cỡ chữ"
          >
            <Minus size={20} />
          </button>
          <div className="px-3 py-1 bg-white/10 rounded text-xs font-black text-white">A{fontSize}</div>
          <button 
            onClick={() => adjustFontSize(1)}
            className="p-2 text-white hover:bg-white/10 rounded-lg"
            title="Tăng cỡ chữ"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              highContrast ? "bg-primary text-white" : "text-white/60 hover:bg-white/10"
            )}
            title="Độ tương phản cao"
          >
            <Layout size={20} />
          </button>
          <button 
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              autoScroll ? "bg-primary text-white" : "text-white/60 hover:bg-white/10"
            )}
            title="Tự động cuộn"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Main Caption Area */}
      <div className="flex-1 relative min-h-0">
        <CaptionDisplay 
          finalLines={finalLines} 
          partialText={partialText}
          className={cn(
            "h-full p-8 md:p-16 flex flex-col justify-end bg-transparent",
            highContrast ? "text-white" : "text-slate-100"
          )}
        />
        
        <button 
          onClick={() => setShowToolbar(!showToolbar)}
          className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 border border-white/5 transition-all"
        >
          <Settings2 size={20} />
        </button>
      </div>

      {/* Bottom Action Bar */}
      <div className={cn(
        "p-4 border-t flex items-center justify-around",
        highContrast ? "bg-zinc-900 border-zinc-800" : "bg-slate-800 border-slate-700"
      )}>
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-primary transition-colors">
          <RotateCcw size={24} />
          <span className="text-[10px] font-bold uppercase">Replay 30s</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-primary transition-colors">
          <Bookmark size={24} />
          <span className="text-[10px] font-bold uppercase">Đánh dấu</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-primary transition-colors">
          <MessageSquare size={24} />
          <span className="text-[10px] font-bold uppercase">Hỏi bài</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/60 hover:text-primary transition-colors">
          <Maximize2 size={24} />
          <span className="text-[10px] font-bold uppercase">Toàn màn hình</span>
        </button>
      </div>
    </div>
  );
}
