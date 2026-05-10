'use client';

import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  FastForward,
  Rewind,
  Captions
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VideoPlayerProps {
  src: string;
  captionText?: string;
  className?: string;
}

export function VideoPlayer({ src, captionText, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("relative group bg-black rounded-2xl overflow-hidden aspect-video shadow-elevated", className)}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        playsInline
      />

      {/* Caption Overlay */}
      {showCaptions && captionText && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center px-8 pointer-events-none mb-4">
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-center max-w-[80%] border border-white/10 shadow-lg">
            <p className="text-xl md:text-2xl font-bold leading-tight">
              {captionText}
            </p>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
        isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
      )}>
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleScrub}
          className="w-full h-1.5 accent-primary bg-white/20 rounded-lg cursor-pointer mb-4 appearance-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            
            <div className="flex items-center gap-2">
              <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors">
                <Rewind size={20} />
              </button>
              <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors">
                <FastForward size={20} />
              </button>
            </div>

            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group/vol">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 accent-white bg-white/20 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCaptions(!showCaptions)}
                className={cn(
                  "transition-colors",
                  showCaptions ? "text-primary" : "text-white/80 hover:text-white"
                )}
              >
                <Captions size={20} />
              </button>
              
              <select 
                value={playbackSpeed}
                onChange={(e) => {
                  const speed = parseFloat(e.target.value);
                  setPlaybackSpeed(speed);
                  if (videoRef.current) videoRef.current.playbackRate = speed;
                }}
                className="bg-transparent text-white text-sm outline-none cursor-pointer border-none"
              >
                {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <option key={speed} value={speed} className="bg-slate-900">{speed}x</option>
                ))}
              </select>

              <button className="text-white/80 hover:text-white transition-colors">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
