'use client';
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Sparkles,
  Zap,
  ArrowRight,
  MonitorPlay,
  Layers,
  Star,
  Globe,
  Share2,
  Heart,
  ChevronDown,
  Award,
  Users,
  MessageSquare,
  User as UserIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, Course, Module, Lesson, Enrollment } from '@/lib/api';

export default function CourseDetailPage() {
  const params = useParams();
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const courseId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await api.courses.getCourse(courseId);
        setCourse(courseData);
        
        const moduleData = await api.courses.listModules(courseId);
        setModules(moduleData);
        if (moduleData.length > 0) setActiveAccordion(moduleData[0].id);

        // Fetch lessons for each module
        const lMap: Record<string, Lesson[]> = {};
        await Promise.all(moduleData.map(async (m) => {
          lMap[m.id] = await api.courses.listLessons(m.id);
        }));
        setLessonsMap(lMap);

        // Check enrollment
        const myEnrollments = await api.student.listMyCourses();
        setIsEnrolled(myEnrollments.some(e => e.course_id === courseId));
      } catch (err) {
        console.error("Failed to fetch course details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleEnroll = async () => {
    try {
      await api.student.enroll(courseId);
      setIsEnrolled(true);
      setShowEnrollModal(true);
      setTimeout(() => setShowEnrollModal(false), 3000);
    } catch (err) {
      console.error("Enrollment failed", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">Loading course...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center font-black text-rose-500">Course not found.</div>;

  return (
    <div className="min-h-screen bg-transparent relative">
      
      {/* Success Popup Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                 <CheckCircle size={40} fill="currentColor" className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Enrolled Successfully!</h3>
              <p className="text-sm font-bold text-slate-500 mb-8">
                 You have been successfully enrolled in <strong>{course.title}</strong>. Welcome to the class!
              </p>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl"
              >
                 Get Started
              </button>
           </div>
        </div>
      )}

      {/* Top Dark Banner */}
      <div className="bg-[#1C1D1F] text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Link href="/student/library" className="hover:underline">Dashboard</Link>
              <ArrowRight size={14} />
              <span className="text-white/60">Khóa học</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-white/80 font-medium max-w-2xl">
              {course.desc} Learn everything you need to know about {course.cat} from industry experts.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-amber-400 font-black">
                <span>4.8</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-white/60 font-bold underline">(12,401 ratings)</span>
              </div>
              <div className="text-white/80 font-bold">150,000 students enrolled</div>
            </div>
 
            <div className="flex items-center gap-4 text-sm font-bold">
               <div className="flex items-center gap-2">
                  <UserIcon size={16} />
                  <span>Instructor ID: <span className="text-primary underline">{course.instructor_id}</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>English [Auto]</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Course Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* What you'll learn */}
            <div className="border-2 border-slate-100 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-black text-slate-900">What you&apos;ll learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Become a professional UX designer",
                  "Build & test a full website design",
                  "Learn to add UX designer to your CV",
                  "Become a UI designer",
                  "Build & test a full mobile app",
                  "Master modern web technologies"
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm font-bold text-slate-600">
                    <CheckCircle size={18} className="text-slate-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Course content</h2>
                <div className="text-sm font-bold text-slate-500">
                  92 lectures • 10:56:11 total length
                </div>
              </div>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                {modules.map((module) => (
                  <div key={module.id} className="border-b border-slate-200 last:border-0">
                    <button 
                      onClick={() => setActiveAccordion(activeAccordion === module.id ? null : module.id)}
                      className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 font-black text-slate-900 text-sm">
                        <ChevronDown size={18} className={activeAccordion === module.id ? "rotate-180 transition-transform" : "transition-transform"} />
                        {module.title}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {lessonsMap[module.id]?.length || 0} bài học
                      </div>
                    </button>
                    
                    {activeAccordion === module.id && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {(lessonsMap[module.id] || []).map((lesson, lIdx) => (
                          <div key={lesson.id} className="p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <MonitorPlay size={16} className="text-slate-400" />
                              <Link 
                                href={`/student/videos/${lesson.id}`}
                                className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors"
                              >
                                {lIdx + 1}. {lesson.title}
                              </Link>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 rounded">
                                 {lesson.content_type}
                               </span>
                               <span className="text-xs font-bold text-slate-400">{lesson.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
               <h2 className="text-xl font-black text-slate-900">Requirements</h2>
               <ul className="list-disc pl-5 space-y-2 text-sm font-bold text-slate-600">
                  <li>You will need a copy of Adobe XD 2019 or above. A free trial can be downloaded from Adobe.</li>
                  <li>No previous design experience is needed.</li>
                  <li>No previous Adobe XD skills are needed.</li>
               </ul>
            </div>

            {/* Description */}
            <div className="space-y-4">
               <h2 className="text-xl font-black text-slate-900">Description</h2>
               <div className="text-sm font-bold text-slate-600 leading-relaxed space-y-4">
                  <p>
                    Embark on a transformative journey into AI with Mike Wheeler, your guide in this Udemy Best Seller course on ChatGPT and Prompt Engineering. As an experienced instructor who has taught over 280,000 students, Mike unveils the secrets of developing your own custom GPTs, ensuring your skills shine in the thriving digital marketplace.
                  </p>
                  <p>
                    This course will get you familiar with Generative AI and the effective use of ChatGPT and is perfect for the beginner. You will also learn advanced prompting techniques to take your Prompt Engineering skills to the next level!
                  </p>
               </div>
            </div>

            {/* Instructor Bio */}
            <div className="space-y-6 border-t border-slate-100 pt-10">
               <h2 className="text-xl font-black text-slate-900">About the instructor</h2>
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                      <Image src="https://i.pravatar.cc/150?img=33" alt="Nicole Brown" width={64} height={64} unoptimized={true} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-primary">Nicole Brown</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">UI/UX Designer</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 text-xs font-black text-slate-500">
                     <div className="flex items-center gap-2">
                        <Award size={16} /> 4.8 Instructor Rating
                     </div>
                     <div className="flex items-center gap-2">
                        <MessageSquare size={16} /> 45,201 Reviews
                     </div>
                     <div className="flex items-center gap-2">
                        <Users size={16} /> 270,908 Students
                     </div>
                     <div className="flex items-center gap-2">
                        <Play size={16} /> 5 Courses
                     </div>
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">
                    UX/UI Designer, with 7+ Years Experience. Overview of High Quality Work. Skills: Web Design, UI Design, UX/UI Design, Mobile Design, User Interface Design, Sketch, Photoshop, Illustrator, HTML, CSS, Grid Systems, Typography, Minimal, Template, English, Bootstrap, Responsive Web Design, Pixel Perfect, Graphic Design, Corporate, Creative, Flat, Luxury and much more.
                  </p>
               </div>
            </div>

            {/* Student Feedback - Better replacement for generic comments */}
            <div className="space-y-10 border-t border-slate-100 pt-10">
               <h2 className="text-xl font-black text-slate-900">Student feedback</h2>
               
               <div className="flex flex-col md:flex-row gap-10 items-center bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <div className="text-center space-y-2">
                     <div className="text-6xl font-black text-primary">4.8</div>
                     <div className="flex justify-center text-amber-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                     </div>
                     <div className="text-xs font-black text-primary uppercase tracking-widest">Course Rating</div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-3">
                     {[
                        { stars: 5, percent: 70 },
                        { stars: 4, percent: 20 },
                        { stars: 3, percent: 7 },
                        { stars: 2, percent: 2 },
                        { stars: 1, percent: 1 },
                     ].map((item) => (
                        <div key={item.stars} className="flex items-center gap-4">
                           <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                              <div className="h-full bg-primary" style={{ width: `${item.percent}%` }} />
                           </div>
                           <div className="flex items-center gap-1 w-20">
                              <div className="flex text-amber-400">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < item.stars ? "currentColor" : "none"} className={i < item.stars ? "" : "text-slate-300"} />
                                 ))}
                              </div>
                              <span className="text-[10px] font-black text-slate-400">{item.percent}%</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Reviews List */}
               <div className="space-y-8">
                  {[
                     { name: "Alex Johnson", date: "2 weeks ago", rating: 5, comment: "This course is amazing! The instructor explains everything so clearly. I went from zero to building my first app in just a few days. Highly recommended for anyone starting their web dev journey." },
                     { name: "Maria Garcia", date: "1 month ago", rating: 4, comment: "Great content and very practical. I love the hands-on projects. Some sections could be updated with latest framework versions, but the core concepts are timeless." },
                  ].map((review, i) => (
                     <div key={i} className="flex gap-4 border-b border-slate-100 pb-8 last:border-0">
                        <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0 overflow-hidden relative">
                           <Image src={`https://i.pravatar.cc/100?img=${i + 20}`} alt={review.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-slate-900">{review.name}</h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</span>
                           </div>
                           <div className="flex text-amber-400">
                              {[...Array(5)].map((_, starIdx) => <Star key={starIdx} size={12} fill={starIdx < review.rating ? "currentColor" : "none"} className={starIdx < review.rating ? "" : "text-slate-200"} />)}
                           </div>
                           <p className="text-sm font-bold text-slate-600 leading-relaxed">
                              {review.comment}
                           </p>
                           <div className="flex items-center gap-4 pt-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary">Helpful?</span>
                              <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                                 <Heart size={12} /> Like
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
                  <button className="w-full py-4 border-2 border-slate-100 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                     Show all reviews
                  </button>
               </div>
            </div>

          </div>

          {/* Right Column: Floating Sidebar */}
          <div className="lg:col-span-4">
             <div className="lg:sticky lg:top-8 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="relative aspect-video group cursor-pointer">
                   <Image src={course.thumb} alt="Preview" fill className="object-cover" unoptimized={true} />
                   <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                         <Play size={24} fill="currentColor" />
                      </div>
                   </div>
                   <div className="absolute bottom-4 left-0 right-0 text-center text-white font-black text-xs uppercase tracking-widest drop-shadow-lg">
                      Preview this course
                   </div>
                </div>

                <div className="p-8 space-y-6">

                   {isEnrolled ? (
                     <Link 
                       href={`/student/videos/${Object.values(lessonsMap).flat()[0]?.id || ''}`}
                       className="block w-full py-4 rounded-xl bg-emerald-500 text-white font-black text-sm text-center uppercase tracking-widest transition-all shadow-xl hover:bg-emerald-600 active:scale-95"
                     >
                        Go to Course
                     </Link>
                   ) : (
                     <button 
                       onClick={handleEnroll}
                       className="block w-full py-4 rounded-xl bg-slate-900 text-white font-black text-sm text-center uppercase tracking-widest transition-all shadow-xl hover:bg-primary active:scale-95"
                     >
                        Enroll Now
                     </button>
                   )}
                   
                   <div className="flex gap-2">
                      <button className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50">
                         <Heart size={14} /> Wishlist
                      </button>
                      <button className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50">
                         <Share2 size={14} /> Share
                      </button>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900">This course includes:</h4>
                      <div className="space-y-3">
                         {[
                           { icon: MonitorPlay, label: "11 hours on-demand video" },
                           { icon: Sparkles, label: "69 downloadable resources" },
                           { icon: Clock, label: "Full lifetime access" },
                           { icon: Globe, label: "Access on mobile and TV" },
                           { icon: Award, label: "Certificate of completion" },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <item.icon size={16} className="text-slate-400" />
                              <span>{item.label}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-100 space-y-4">
                      <h4 className="text-sm font-black text-slate-900">Course Features:</h4>
                      <div className="space-y-3">
                         {[
                           { icon: Users, label: `Enrolled: ${studentCount} students` },
                           { icon: Clock, label: "Duration: 20 hours" },
                           { icon: Layers, label: "Chapters: 15" },
                           { icon: Play, label: "Videos: 12 hours" },
                           { icon: Zap, label: "Level: Beginner" },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                              <item.icon size={16} className="text-primary" />
                              <span>{item.label}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
