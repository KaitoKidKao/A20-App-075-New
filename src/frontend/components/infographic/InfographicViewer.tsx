'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Download, LayoutDashboard, Target, Users, Zap, TrendingUp, Layers, HelpCircle, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartRenderer } from './ChartRenderer';

export type LearnerLevel = 'beginner' | 'intermediate' | 'advanced';

export interface VisualSection {
  label?: string;
  value?: string | number;
  description?: string;
  advanced_detail?: string;
  icon?: string;
}

export interface InfographicData {
  title?: string;
  type?: 'stats' | 'process' | 'comparison' | 'info';
  category?: 'technology' | 'health' | 'finance' | 'default';
  sections?: VisualSection[];
  key_takeaways?: string[];
  chartData?: Array<{ name: string; value: number; [key: string]: unknown }>;
  chartType?: 'pie' | 'bar';
  cover_image_url?: string | null;
  image_prompt?: string;
}

interface Props {
  data: InfographicData;
}

const CATEGORY_COLORS = {
  technology: 'from-indigo-500 to-blue-600',
  health: 'from-teal-500 to-emerald-600',
  finance: 'from-amber-500 to-orange-600',
  default: 'from-slate-700 to-slate-900',
};

const CATEGORY_TEXT_COLORS = {
  technology: 'text-indigo-600',
  health: 'text-teal-600',
  finance: 'text-amber-600',
  default: 'text-slate-800',
};

const CATEGORY_BG_LIGHT = {
  technology: 'bg-indigo-50',
  health: 'bg-teal-50',
  finance: 'bg-amber-50',
  default: 'bg-slate-50',
};

// Map string icon names to Lucide components
const IconMap: Record<string, React.ElementType> = {
  Target, Users, Zap, TrendingUp, Layers, HelpCircle, CheckCircle, BarChart3, Activity, LayoutDashboard
};

export function InfographicViewer({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use defaults if missing
  const category = data.category || 'default';
  const type = data.type || 'info';
  const title = data.title || 'Tổng quan trực quan';
  const sections = data.sections || [];
  const hasVisualContent = sections.length > 0 || Boolean(data.chartData?.length) || Boolean(data.key_takeaways?.length);
  
  const gradientClass = CATEGORY_COLORS[category];
  const textClass = CATEGORY_TEXT_COLORS[category];
  const bgLightClass = CATEGORY_BG_LIGHT[category];

  const handleDownload = async () => {
    if (!containerRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(containerRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `infographic-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download infographic', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Tải ảnh PNG
        </button>
      </div>

      {/* Capture Area */}
      <div 
        ref={containerRef}
        className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 relative"
      >
        {/* Header Section */}
        <div className={cn("p-10 md:p-14 bg-gradient-to-br text-white relative overflow-hidden", gradientClass)}>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <LayoutDashboard size={150} />
          </div>
          <div className="relative z-10">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
              {category}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl">
              {title}
            </h2>

          </div>
        </div>

        {/* Content Section */}
        <motion.div 
          className="p-8 md:p-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {data.cover_image_url && (
            <motion.div variants={itemVariants} className="mb-10">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[32px] border border-slate-100 bg-slate-50 shadow-sm">
                <Image
                  src={data.cover_image_url}
                  alt={`${title} visual cover`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 900px"
                />
              </div>
            </motion.div>
          )}

          {!hasVisualContent && (
            <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">Chưa có phần trực quan</p>
              <p className="mt-3 text-sm font-bold text-slate-500">Infographic sẽ hiển thị sau khi AI tạo xong dữ liệu trực quan có cấu trúc.</p>
            </motion.div>
          )}

          {/* Render Chart if available */}
          {data.chartData && data.chartData.length > 0 && (
             <motion.div variants={itemVariants} className="mb-12">
                <div className={cn("p-6 rounded-3xl border border-slate-100", bgLightClass)}>
                   <h3 className={cn("text-lg font-black mb-6 uppercase tracking-widest", textClass)}>
                     Biểu đồ dữ liệu
                   </h3>
                   <ChartRenderer 
                     type={data.chartType || 'pie'} 
                     data={data.chartData} 
                     category={category} 
                   />
                </div>
             </motion.div>
          )}

          {/* Render Sections based on Template Type */}
          {type === 'process' ? (
             <div className="space-y-6">
                {sections.map((section, i) => {
                  const IconComp = section.icon && IconMap[section.icon] ? IconMap[section.icon] : CheckCircle;
                  return (
                    <motion.div key={i} variants={itemVariants} className="flex gap-6 relative group">
                       <div className="flex flex-col items-center">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-lg text-white transition-transform group-hover:scale-110", gradientClass)}>
                             <IconComp size={20} />
                          </div>
                          {i < sections.length - 1 && (
                            <div className="w-1 h-full bg-slate-100 mt-2 rounded-full" />
                          )}
                       </div>
                       <div className="pb-10 pt-1">
                          <h4 className="text-xl font-black text-slate-900 mb-2">{section.label}</h4>
                          {section.value && <p className={cn("text-2xl font-black mb-2", textClass)}>{section.value}</p>}
                          <p className="text-slate-500 font-medium leading-relaxed">{section.description}</p>
                          {section.advanced_detail && (
                             <div className={cn("mt-4 p-4 rounded-2xl text-sm font-medium border border-slate-100", bgLightClass, textClass)}>
                               {section.advanced_detail}
                             </div>
                          )}
                       </div>
                    </motion.div>
                  )
                })}
             </div>
          ) : type === 'comparison' ? (
            <div className="grid md:grid-cols-2 gap-6">
               {sections.map((section, i) => {
                  const IconComp = section.icon && IconMap[section.icon] ? IconMap[section.icon] : Layers;
                  return (
                    <motion.div key={i} variants={itemVariants} className={cn("p-8 rounded-[32px] border-2 transition-all hover:shadow-xl border-slate-100 bg-white")}>
                       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-md", textClass)}>
                          <IconComp size={24} />
                       </div>
                       <h4 className="text-2xl font-black text-slate-900 mb-2">{section.label}</h4>
                       {section.value && <p className={cn("text-3xl font-black mb-4", i === 0 ? "text-slate-600" : textClass)}>{section.value}</p>}
                       <p className="text-slate-500 font-medium leading-relaxed">{section.description}</p>
                       {section.advanced_detail && (
                          <div className="mt-6 pt-6 border-t border-slate-200/50">
                             <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Phân tích sâu</p>
                             <p className="text-sm font-medium text-slate-600">{section.advanced_detail}</p>
                          </div>
                       )}
                    </motion.div>
                  )
               })}
            </div>
          ) : (
             // Default 'stats' or 'info' layout
             <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {sections.map((section, i) => {
                   const IconComp = section.icon && IconMap[section.icon] ? IconMap[section.icon] : Zap;
                   return (
                     <motion.div key={i} variants={itemVariants} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between mb-6">
                           <div className={cn("w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform", textClass)}>
                              <IconComp size={20} />
                           </div>
                           {section.value && (
                             <span className={cn("text-3xl font-black", textClass)}>{section.value}</span>
                           )}
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-widest text-[11px]">{section.label}</h4>
                        <p className="text-slate-600 font-medium text-sm leading-relaxed">{section.description}</p>
                        {section.advanced_detail && (
                           <div className="mt-4 text-xs font-medium text-slate-500 border-l-2 border-slate-200 pl-3">
                             {section.advanced_detail}
                           </div>
                        )}
                     </motion.div>
                   )
                })}
             </div>
          )}
          
          {/* Key Takeaways */}
          {data.key_takeaways && data.key_takeaways.length > 0 && (
            <motion.div variants={itemVariants} className="mt-12 p-8 md:p-10 rounded-[32px] bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Target size={100} />
               </div>
               <div className="relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#FF4F6E] mb-6">Điểm chính cần nhớ</h3>
                  <ul className="space-y-4">
                    {data.key_takeaways.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                         <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-black">{i + 1}</span>
                         </div>
                         <p className="font-bold text-white/90 leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
               </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mt-8 text-center">
             <div className="inline-block px-4 py-1.5 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                Tạo bởi AI Visual Engine
             </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
