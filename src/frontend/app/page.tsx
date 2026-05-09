'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Zap, 
  ArrowRight,
  Heart,
  Eye,
  MessageSquare,
  ShieldCheck,
  Users,
  CheckCircle2,
  Play
} from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDFE] text-slate-900 font-sans selection:bg-[#FF4F6E]/20 overflow-x-hidden">
      
      {/* Dynamic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8 md:px-20 py-6 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent'}`}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF4F6E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4F6E]/20">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
               </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Dreams</span>
          </div>
          <div className="hidden md:flex items-center gap-12 text-[13px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#features" className="hover:text-[#FF4F6E] transition-colors">Features</a>
            <a href="#mission" className="hover:text-[#FF4F6E] transition-colors">Mission</a>
            <button 
              onClick={handleStart}
              className="px-8 py-3 bg-[#FF4F6E] text-white rounded-xl hover:bg-[#e64663] transition-all shadow-lg shadow-[#FF4F6E]/20 font-black uppercase tracking-widest text-[12px]"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full max-w-[1440px] mx-auto px-8 md:px-20 pt-40 pb-24 flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#FF4F6E]/5 rounded-full blur-[120px] -z-10" />

          {/* Left Content */}
          <div className="lg:w-[55%] space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">

            <div className="space-y-8">
              <h1 className="text-6xl md:text-[88px] font-black text-slate-900 leading-[0.95] tracking-tight">
                Hear with your <span className="text-[#FF4F6E] italic">eyes</span>, <br />
                Learn with heart.
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                Breaking barriers for deaf and hard-of-hearing students. Dreams transforms every lecture into a visual, interactive, and accessible journey.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto px-12 py-6 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-2xl shadow-[#FF4F6E]/30 hover:bg-[#e64663] transition-all hover:scale-105 active:scale-[0.98] text-lg"
              >
                Join Dreams Now
              </button>
              <button className="flex items-center gap-4 text-slate-900 font-black hover:text-[#FF4F6E] transition-colors group">
                 <div className="w-14 h-14 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-[#FF4F6E] transition-all">
                    <Play size={20} fill="currentColor" />
                 </div>
                 Watch Story
              </button>
            </div>
          </div>

          {/* Right Hero Image - NEW PATH TO AVOID CACHE */}
          <div className="lg:w-[45%] relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
             <div className="relative z-10 rounded-[60px] overflow-hidden shadow-2xl border-[16px] border-white bg-white aspect-square">
                <Image 
                  src="/assets/images/hero-final-v2.png" 
                  alt="Student Standing with Laptop" 
                  fill
                  className="object-contain p-4"
                />
             </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-32 bg-slate-50/50">
          <div className="max-w-[1440px] mx-auto px-8 md:px-20">
             <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight">Superpowers for your <span className="text-[#FF4F6E]">Education</span></h2>
                <p className="text-lg text-slate-500 font-medium">Designed specifically for the unique needs of deaf and hard-of-hearing learners.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-white hover:border-[#FF4F6E]/10 group">
                   <div className="w-16 h-16 bg-[#FF4F6E]/5 text-[#FF4F6E] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Eye size={32} />
                   </div>
                   <h3 className="text-2xl font-black mb-4">Visual Learning</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">
                      Transform every audio lecture into crystal clear, real-time captions with emotional context.
                   </p>
                </div>

                <div className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-white hover:border-[#FF4F6E]/10 group">
                   <div className="w-16 h-16 bg-[#FF4F6E]/5 text-[#FF4F6E] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <Zap size={32} fill="currentColor" />
                   </div>
                   <h3 className="text-2xl font-black mb-4">AI Summaries</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">
                      Get high-level summaries of complex topics instantly, so you can focus on understanding.
                   </p>
                </div>

                <div className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-white hover:border-[#FF4F6E]/10 group">
                   <div className="w-16 h-16 bg-[#FF4F6E]/5 text-[#FF4F6E] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <MessageSquare size={32} />
                   </div>
                   <h3 className="text-2xl font-black mb-4">Interaction</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">
                      Communicate with teachers and peers seamlessly through integrated visual feedback tools.
                   </p>
                </div>
             </div>
          </div>
        </section>

        {/* MISSION SECTION - NEW PATH TO AVOID CACHE */}
        <section id="mission" className="py-32">
          <div className="max-w-[1440px] mx-auto px-8 md:px-20">
             <div className="flex flex-col lg:flex-row items-center gap-24">
                <div className="lg:w-1/2 relative">
                   <div className="rounded-[60px] overflow-hidden shadow-2xl aspect-square relative">
                      <Image 
                        src="/assets/images/mission-final-v2.png" 
                        alt="Visual Meaning" 
                        fill
                        className="object-contain p-4"
                      />
                   </div>
                </div>
                <div className="lg:w-1/2 space-y-10">
                   <span className="text-[#FF4F6E] font-black uppercase tracking-[0.3em] text-xs">Our Core Values</span>
                   <h2 className="text-4xl md:text-6xl font-black leading-tight">Equality isn't a feature. <br /> It's the <span className="text-[#FF4F6E]">Foundation</span>.</h2>
                   <p className="text-xl text-slate-500 font-medium leading-relaxed">
                      We believe every student deserves to be heard and to hear. Dreams is built to erase the invisible walls in classrooms.
                   </p>
                   <ul className="space-y-6">
                      {[
                        "Real-time transcription with tone detection",
                        "Smart summarization of complex lecture videos",
                        "Interactive visual classroom environment",
                        "Personalized learning path for every student"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 font-bold text-slate-700">
                           <div className="w-6 h-6 bg-[#FF4F6E]/10 text-[#FF4F6E] rounded-full flex items-center justify-center">
                              <CheckCircle2 size={14} strokeWidth={3} />
                           </div>
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 bg-[#1A1A1A] text-white relative overflow-hidden">
           <div className="max-w-[1440px] mx-auto px-8 md:px-20 relative z-10 flex flex-col lg:flex-row items-center gap-20">
              <div className="lg:w-1/2 space-y-10">
                 <h2 className="text-5xl md:text-7xl font-black leading-tight">Ready to start your <span className="text-[#FF4F6E]">Dreams</span> journey?</h2>
                 <p className="text-xl text-slate-400 font-medium">Join a global community of students who are redefining what it means to "listen" and "learn".</p>
                 <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={handleStart}
                      className="px-12 py-6 bg-[#FF4F6E] text-white font-black rounded-2xl shadow-2xl hover:bg-[#e64663] transition-all hover:scale-105 active:scale-[0.98] text-lg"
                    >
                      Get Started for Free
                    </button>
                    <button className="px-10 py-6 border-2 border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                       Contact School
                    </button>
                 </div>
              </div>
              <div className="lg:w-1/2">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-[#FF4F6E] rounded-[60px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Image 
                      src="/assets/images/community-img.png" 
                      alt="Student Community" 
                      width={600} 
                      height={600} 
                      className="relative z-10 object-contain drop-shadow-2xl"
                    />
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="px-8 py-20 md:px-20 bg-white border-t border-slate-50">
         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-[#FF4F6E] rounded-lg flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                     <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                     <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
               </div>
               <span className="text-xl font-black text-slate-900">Dreams</span>
            </div>
            <div className="flex gap-12 text-[11px] font-black uppercase tracking-widest text-slate-400">
               <a href="#" className="hover:text-[#FF4F6E] transition-colors">How it works</a>
               <a href="#" className="hover:text-[#FF4F6E] transition-colors">Privacy</a>
               <a href="#" className="hover:text-[#FF4F6E] transition-colors">Contact</a>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Dreams. Built for inclusion.</p>
         </div>
      </footer>
    </div>
  );
}
