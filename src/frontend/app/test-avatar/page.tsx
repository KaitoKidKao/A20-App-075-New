"use client";

import React, { useState, useEffect } from "react";
import SignAvatar2D from "@/components/SignAvatar2D";

const MOCK_DATA = [
  {
    "time": 0.0,
    "word": "bạn",
    "vsl_info": {
      "mouth": "bạn",
      "hand": "hamfinger2,hamthumbacrossmod,hamextfingero,hampalmd,hambetween,hampalmdl,hamshoulders"
    }
  },
  {
    "time": 2.0,
    "word": "hôm_nay",
    "vsl_info": {
      "hand": "hamsymmlr,hamflathand,hamextfingero,hampalmu,hamchest"
    }
  },
  {
    "time": 4.0,
    "word": "học",
    "vsl_info": {
      "mouth": "học",
      "hand": "hamfist,hamthumbacrossmod,hambetween,hamflathand,hamextfingeru,hampalmu,hamforehead"
    }
  },
  {
    "time": 6.0,
    "word": "quan_trọng",
    "vsl_info": {
      "hand": "hamfinger2345,hamthumboutmod,hamextfingeru,hampalml"
    }
  }
];

export default function TestAvatarPage() {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTime((prev) => (prev + 0.1) % 8);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center gap-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 text-center">Avatar Thủ Ngữ VSL (2D)</h1>
        
        <div className="flex justify-center py-4">
          <SignAvatar2D vslData={MOCK_DATA} currentTime={time} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500">
            <span>Thời gian: {time.toFixed(1)}s</span>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-1.5 rounded-full text-white transition-colors ${isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isPlaying ? "Dừng" : "Chạy thử"}
            </button>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="8" 
            step="0.1" 
            value={time} 
            onChange={(e) => setTime(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <div className="grid grid-cols-2 gap-2">
            {MOCK_DATA.map((g) => (
              <button
                key={g.word}
                onClick={() => { setTime(g.time); setIsPlaying(false); }}
                className={`text-xs py-2 px-3 rounded-lg border transition-all ${Math.abs(time - g.time) < 0.5 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {g.word} ({g.time}s)
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl w-full bg-indigo-900 text-indigo-100 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="p-1 bg-indigo-700 rounded-md">ℹ️</span> 
          Cơ chế hoạt động
        </h2>
        <ul className="space-y-2 text-sm opacity-90 list-disc list-inside">
          <li>Sử dụng <b>Sprite Sheet</b> (PNG) để render các hình dạng bàn tay khác nhau.</li>
          <li>Mã <b>HamNoSys</b> được ánh xạ sang tọa độ CSS (background-position).</li>
          <li><b>Framer Motion</b> xử lý chuyển động (rotation, position, scale) mượt mà giữa các tư thế.</li>
          <li><b>AnimatePresence</b> đảm bảo hiệu ứng fade khi thay đổi từ khóa.</li>
        </ul>
      </div>
    </div>
  );
}
