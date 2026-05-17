const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AuthUser {
  name: string;
  email: string;
  role: "student" | "admin" | "teacher";
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: "student" | "admin" | "teacher";
  user: AuthUser;
}

export interface SessionUser {
  id: string;
  email: string;
  full_name?: string;
  role: "student" | "admin" | "teacher";
}

export interface VSLInfo {
  mouth?: string;
  body?: string;
  head?: string;
  shoulder?: string;
  eyegaze?: string;
  eyebrow?: string;
  eyelids?: string;
  hand?: string;
}

export interface HandsSignGloss {
  index?: number;
  time: number;
  word: string;
  vsl_info: VSLInfo | null;
  source?: string;
  review_status?: string;
}

export interface HandsSignSegment {
  start: number;
  end: number;
  word: string;
  vsl_info: VSLInfo | null;
  hamnosys_hand?: string | null;
}

export interface AvatarState {
  video_id: string;
  status: "not_generated" | "ready" | "failed" | string;
  avatar_video_url: string | null;
  error?: string | null;
  is_optional?: boolean;
  disclaimer?: string;
}

export interface HandsSignResponse {
  video_id: string;
  handsign_data: HandsSignGloss[];
  glosses?: HandsSignGloss[];
  segments?: Record<string, unknown>[];
  review_required?: boolean;
  review_status?: string;
  disclaimer?: string;
  avatar?: AvatarState;
}

export interface Profile {
  bio?: string;
  learning_goals?: string;
  certifications?: {
    cert_id: string;
    course_id?: string;
    course_title: string;
    issue_date: string;
  }[];
}

export interface StudentProfileData {
  profile: Profile;
  stats: {
    total_enrollments: number;
    completed_lessons: number;
    total_hours: number;
    certificates_count: number;
  };
}

export interface Certificate {
  cert_id: string;
  course_id: string;
  course_title: string;
  issue_date: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Course {
  id: string;
  category_id: string;
  instructor_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  thumbnail_url?: string;
  desc?: string;
  cat?: string;
  thumb?: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: "video" | "article" | "quiz";
  status: string;
  sort_order: number;
  duration_minutes?: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_status: string;
}

export interface UserProgress {
  id: string;
  lesson_id: string;
  progress_percent: number;
  completion_status: string;
  watched_seconds?: number;
  last_position_seconds?: number;
  duration_seconds?: number;
  last_accessed_at?: string;
}

export interface StudentDashboard {
  stats: {
    active_courses: number;
    completed_lessons: number;
    total_watch_seconds: number;
    learned_flashcards: number;
    average_quiz_score: number;
  };
  courses: {
    course_id: string;
    title: string;
    thumbnail_url?: string | null;
    enrollment_status: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percent: number;
  }[];
  incomplete_lessons: {
    lesson_id: string;
    title: string;
    progress_percent: number;
    last_position_seconds: number;
    last_accessed_at: string;
  }[];
  quiz_scores: {
    quiz_id: string;
    title: string;
    score: number;
    status: string;
    created_at: string;
  }[];
  recent_activity: {
    type: string;
    lesson_id: string;
    progress_percent: number;
    last_accessed_at: string;
  }[];
}

export interface AdminDashboard {
  stats: {
    student_count: number;
    active_courses: number;
    lesson_count: number;
    failed_video_jobs: number;
    processing_video_jobs: number;
    completion_rate: number;
  };
  failed_jobs: {
    lesson_id: string;
    status: string;
    error_message?: string | null;
    attempts: number;
    updated_at: string;
  }[];
  popular_lessons: {
    lesson_id: string;
    title: string;
    views: number;
  }[];
  recent_progress: {
    user_id: string;
    lesson_id: string;
    progress_percent: number;
    completion_status: string;
    last_accessed_at: string;
  }[];
}

export interface StudentCourseDetailLesson {
  id: string;
  title: string;
  content_type: string;
  status: string;
  sort_order: number;
  duration_minutes: number;
  progress_percent: number;
  completion_status: string;
  is_completed: boolean;
}

export interface StudentCourseDetailModule {
  id: string;
  title: string;
  description?: string | null;
  sort_order: number;
  lessons: StudentCourseDetailLesson[];
}

export interface StudentCourseDetail {
  course: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
    language?: string | null;
    level?: string | null;
    is_published: boolean;
    instructor_id?: string | null;
  };
  stats: {
    students_enrolled: number;
    total_modules: number;
    total_lessons: number;
    total_duration_minutes: number;
    rating_avg: number;
    rating_count: number;
    rating_distribution: Record<number, number>;
    transcript_ready_lessons: number;
    processing_lessons: number;
  };
  user_context: {
    is_enrolled: boolean;
    enrollment_status: string;
    progress_percent: number;
    completed_lessons: number;
    is_course_completed: boolean;
    first_lesson_id?: string | null;
    next_lesson_id?: string | null;
  };
  modules: StudentCourseDetailModule[];
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface MyReviewItem {
  id: string;
  course_id: string;
  course_title: string;
  rating: number;
  comment: string;
  updated_at: string;
}

export interface AdminCourseWorkspace {
  id: string;
  title: string;
  description?: string | null;
  is_published: boolean;
  created_at: string;
  modules: {
    id: string;
    title: string;
    description?: string | null;
    sort_order: number;
    created_at: string;
    lessons: {
      id: string;
      title: string;
      status: string;
      content_type: string;
      sort_order: number;
      created_at: string;
    }[];
  }[];
}

export interface AdminRecentJob {
  job_id: string;
  lesson_id: string;
  lesson_title: string;
  module_id?: string | null;
  module_title?: string | null;
  course_id?: string | null;
  course_title?: string | null;
  job_type: string;
  status: string;
  progress: number;
  attempts: number;
  error_message?: string | null;
  updated_at: string;
  created_at: string;
}

export interface AdminModelHealth {
  window_hours: number;
  estimated: boolean;
  updated_at: string;
  metrics: {
    wer_vi_score: number;
    wer_en_score: number;
    asr_latency_ms: number;
    queue_depth: number;
    failure_rate_percent: number;
    request_error_rate_percent: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string | null;
  role: "student" | "teacher" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AdminDeletionAudit {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_display_name: string | null;
  deleted_by_user_id: string | null;
  deleted_by_email: string;
  reason: string;
  created_at: string;
}

export interface MyVideo {
  id: string;
  title: string;
  status: string;
  created_at: string;
  video_url?: string | null;
  progress_percent: number;
  completion_status: string;
}

export interface BatchUploadItem {
  ok: boolean;
  filename: string;
  video_id?: string;
  status?: string;
  queue_mode?: string;
  message?: string;
  error?: string;
}

export interface BatchUploadResponse {
  status: string;
  total: number;
  success_count: number;
  failed_count: number;
  items: BatchUploadItem[];
}

const buildHeaders = (isMultipart = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isMultipart) headers["Content-Type"] = "application/json";
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
  });
  return res;
}

export const api = {
  auth: {
    async getRegistrationConfig(): Promise<{ allow_role_registration: boolean; roles: Array<"student" | "admin" | "teacher"> }> {
      const res = await apiFetch("/api/auth/registration-config", { headers: buildHeaders() });
      if (!res.ok) return { allow_role_registration: false, roles: ["student"] };
      return res.json();
    },

    async me(): Promise<SessionUser> {
      const res = await apiFetch("/api/auth/me", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Unauthenticated");
      return res.json();
    },

    async register(data: {
      email: string;
      password: string;
      confirm_password: string;
      full_name?: string;
      role?: string;
    }) {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Registration failed.");
      }
      return res.json();
    },

    async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
      const formData = new URLSearchParams();
      formData.append("username", credentials.email);
      formData.append("password", credentials.password);

      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Login failed.");
      }
      const data = await res.json();
      let fullName = "";
      try {
        const meRes = await apiFetch("/api/auth/me", { headers: buildHeaders() });
        if (meRes.ok) {
          const me = (await meRes.json()) as SessionUser;
          fullName = (me.full_name || "").trim();
        }
      } catch {
        // ignore and fallback to email prefix
      }

      const fallbackName = credentials.email.split("@")[0] || "User";
      return {
        ...data,
        user: {
          name: fullName || fallbackName,
          email: credentials.email,
          role: data.role || "student",
        },
      };
    },

    async logout() {
      const res = await apiFetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed.");
      return res.json();
    },
  },

  videos: {
    async processUrl(url: string) {
      const res = await apiFetch("/api/videos/process-url", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Processing URL failed.");
      return res.json();
    },

    async getStatus(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/status`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch status.");
      return res.json();
    },

    async getTranscript(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/transcript`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch transcript.");
      return res.json();
    },

    async getSummary(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/summary`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch summary.");
      return res.json();
    },

    async getArtifactStatus(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/artifacts/status`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch artifact status.");
      return res.json();
    },

    async getTimeline(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/timeline`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch timeline.");
      return res.json();
    },

    async getHighlights(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/highlights`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch highlights.");
      return res.json();
    },

    async getQuestions(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/questions`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch questions.");
      return res.json();
    },

    async getBriefing(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/briefing`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch briefing.");
      return res.json();
    },

    async getFlashcards(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/flashcards`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch flashcards.");
      return res.json();
    },

    async getVizData(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/viz-data`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch visualization data.");
      return res.json();
    },

    async getHandsSign(videoId: string): Promise<HandsSignResponse> {
      const res = await apiFetch(`/api/videos/${videoId}/handsign`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch sign language data.");
      return res.json();
    },

    async getHandsSignExport(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/handsign-export`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch sign language manifest.");
      return res.json();
    },

    async updateHandsSign(videoId: string, glosses: HandsSignGloss[]): Promise<HandsSignResponse> {
      const res = await apiFetch(`/api/videos/${videoId}/handsign`, {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify({ glosses, review_status: "reviewed" }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update sign language data.");
      }
      return res.json();
    },

    async generateAvatar(videoId: string): Promise<AvatarState> {
      const res = await apiFetch(`/api/videos/${videoId}/generate-avatar`, {
        method: "POST",
        headers: buildHeaders(),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to generate avatar video.");
      }
      return res.json();
    },

    async getAvatar(videoId: string): Promise<AvatarState> {
      const res = await apiFetch(`/api/videos/${videoId}/avatar`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch avatar video state.");
      return res.json();
    },

    async listMyVideos(): Promise<MyVideo[]> {
      const res = await apiFetch("/api/videos/me", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch my videos.");
      return res.json();
    },
    async delete(videoId: string, reason: string) {
      const q = encodeURIComponent(reason.trim());
      const res = await apiFetch(`/api/videos/${videoId}?reason=${q}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete video.");
      return res.json();
    },
    async upload(file: File, moduleId?: string, videoTitle?: string) {
      const formData = new FormData();
      formData.append("file", file);
      if (moduleId) formData.append("module_id", moduleId);
      if (videoTitle && videoTitle.trim()) formData.append("video_title", videoTitle.trim());
      const res = await apiFetch("/api/videos/upload", {
        method: "POST",
        headers: buildHeaders(true),
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Video upload failed.");
      }
      return res.json();
    },

    async presignUpload(params: {
      filename: string;
      content_type: string;
      video_title?: string;
      module_id?: string;
    }): Promise<{ video_id: string; upload_url: string; s3_key: string; expires_in: number }> {
      const res = await apiFetch("/api/videos/presign-upload", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to get upload URL.");
      }
      return res.json();
    },

    async confirmUpload(videoId: string, s3Key: string) {
      const res = await apiFetch(`/api/videos/${videoId}/confirm-upload`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ s3_key: s3Key }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to confirm upload.");
      }
      return res.json();
    },
    async uploadBatch(files: File[], moduleId?: string): Promise<BatchUploadResponse> {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      if (moduleId) formData.append("module_id", moduleId);
      const res = await apiFetch("/api/videos/upload-batch", {
        method: "POST",
        headers: buildHeaders(true),
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Batch video upload failed.");
      }
      return res.json();
    },
  },

  courses: {
    async listCategories(): Promise<Category[]> {
      const res = await apiFetch("/api/courses/categories", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch categories.");
      return res.json();
    },
    async listCourses(categoryId?: string): Promise<Course[]> {
      const path = categoryId ? `/api/courses/?category_id=${categoryId}` : "/api/courses/";
      const res = await apiFetch(path, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch courses.");
      return res.json();
    },
    async getCourse(courseId: string): Promise<Course> {
      const res = await apiFetch(`/api/courses/${courseId}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch course details.");
      return res.json();
    },
    async listModules(courseId: string): Promise<Module[]> {
      const res = await apiFetch(`/api/courses/${courseId}/modules`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch modules.");
      return res.json();
    },
    async listLessons(moduleId: string): Promise<Lesson[]> {
      const res = await apiFetch(`/api/courses/modules/${moduleId}/lessons`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch lessons.");
      return res.json();
    },
    async getLesson(lessonId: string): Promise<Lesson> {
      const res = await apiFetch(`/api/courses/lessons/${lessonId}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch lesson details.");
      return res.json();
    },
    async createCourse(data: { title: string; description?: string; is_published?: boolean }) {
      const res = await apiFetch("/api/courses/", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create course.");
      return res.json();
    },
    async createModule(courseId: string, data: { title: string; description?: string; sort_order?: number }) {
      const res = await apiFetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create module.");
      return res.json();
    }
  },

  student: {
    async enroll(courseId: string): Promise<Enrollment> {
      const res = await apiFetch(`/api/student/enroll/${courseId}`, {
        method: "POST",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Enrollment failed.");
      return res.json();
    },
    async listMyCourses(): Promise<Enrollment[]> {
      const res = await apiFetch("/api/student/my-courses", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch my courses.");
      return res.json();
    },
    async updateProgress(
      lessonId: string,
      progressPercent: number,
      status = "in_progress",
      details?: { watchedSeconds?: number; lastPositionSeconds?: number; durationSeconds?: number }
    ) {
      const params = new URLSearchParams({
        progress_percent: String(progressPercent),
        status,
      });
      if (details?.watchedSeconds !== undefined) params.set("watched_seconds", String(Math.round(details.watchedSeconds)));
      if (details?.lastPositionSeconds !== undefined) params.set("last_position_seconds", String(Math.round(details.lastPositionSeconds)));
      if (details?.durationSeconds !== undefined) params.set("duration_seconds", String(Math.round(details.durationSeconds)));
      const res = await apiFetch(`/api/student/lessons/${lessonId}/progress?${params.toString()}`, {
        method: "POST",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Failed to update progress.");
      return res.json();
    },
    async getProgress(lessonId: string): Promise<UserProgress | null> {
      const res = await apiFetch(`/api/student/lessons/${lessonId}/progress`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch progress.");
      return res.json();
    },
    async getDashboard(): Promise<StudentDashboard> {
      const res = await apiFetch("/api/student/dashboard", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch student dashboard.");
      return res.json();
    },
    async getCourseDetail(courseId: string): Promise<StudentCourseDetail> {
      const res = await apiFetch(`/api/student/courses/${courseId}/detail`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch course detail.");
      return res.json();
    },
    async listCourseReviews(courseId: string, limit = 20, offset = 0): Promise<{ items: CourseReview[]; limit: number; offset: number }> {
      const res = await apiFetch(`/api/student/courses/${courseId}/reviews?limit=${limit}&offset=${offset}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch course reviews.");
      return res.json();
    },
    async saveCourseReview(courseId: string, payload: { rating: number; comment?: string }): Promise<CourseReview> {
      const res = await apiFetch(`/api/student/courses/${courseId}/reviews`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save course review.");
      return res.json();
    },
    async listMyReviews(): Promise<{ items: MyReviewItem[] }> {
      const res = await apiFetch("/api/student/reviews/me", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch my reviews.");
      return res.json();
    },
    async reviewFlashcard(flashcardId: string, isCorrect: boolean) {
      const res = await apiFetch(`/api/student/flashcards/${flashcardId}/review?is_correct=${isCorrect}`, {
        method: "POST",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Failed to save flashcard review.");
      return res.json();
    },
    async listLessonQuizzes(lessonId: string) {
      const res = await apiFetch(`/api/student/lessons/${lessonId}/quizzes`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch lesson quizzes.");
      return res.json();
    },
    async submitQuiz(quizId: string, answers: Record<string, string>) {
      const res = await apiFetch(`/api/student/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Failed to submit quiz.");
      return res.json();
    },
    async getProfile(): Promise<StudentProfileData> {
      const res = await apiFetch("/api/student/profile", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch profile.");
      return res.json();
    },
    async updateProfile(data: Partial<Profile>): Promise<Profile> {
      const res = await apiFetch("/api/student/profile", {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update profile.");
      return res.json();
    },
    async getCertificate(courseId: string): Promise<Certificate> {
      const res = await apiFetch(`/api/student/courses/${courseId}/certificate`, { headers: buildHeaders() });
      if (!res.ok) {
         const error = await res.text();
         throw new Error(error || "Failed to fetch certificate.");
      }
      return res.json();
    }
  },

  admin: {
    async getDashboard(): Promise<AdminDashboard> {
      const res = await apiFetch("/api/admin/dashboard", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch admin dashboard.");
      return res.json();
    },
    async listRecentJobs(limit = 10): Promise<AdminRecentJob[]> {
      const res = await apiFetch(`/api/admin/jobs/recent?limit=${limit}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch recent jobs.");
      return res.json();
    },
    async getModelHealth(): Promise<AdminModelHealth> {
      const res = await apiFetch("/api/admin/model-health", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch model health.");
      return res.json();
    },
    async listCourses(): Promise<AdminCourseWorkspace[]> {
      const res = await apiFetch("/api/admin/courses", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch admin courses.");
      return res.json();
    },
    async listUsers(): Promise<AdminUser[]> {
      const res = await apiFetch("/api/admin/users", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch users.");
      return res.json();
    },
    async getSettings(): Promise<{ allow_public_role_registration: boolean }> {
      const res = await apiFetch("/api/admin/settings", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch settings.");
      return res.json();
    },
    async updateSettings(settings: { allow_public_role_registration: boolean }) {
      const res = await apiFetch("/api/admin/settings", {
        method: "PATCH",
        headers: buildHeaders(),
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to update settings.");
      return res.json();
    },
    async updateUserRole(userId: string, role: "student" | "teacher" | "admin") {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: buildHeaders(),
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update user role.");
      return res.json();
    },
    async listDeletionAudits(limit = 50): Promise<AdminDeletionAudit[]> {
      const res = await apiFetch(`/api/admin/deletion-audits?limit=${limit}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch deletion audits.");
      return res.json();
    },
    async deleteUser(userId: string, reason: string) {
      const q = encodeURIComponent(reason.trim());
      const res = await apiFetch(`/api/admin/users/${userId}?reason=${q}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete user.");
      return res.json();
    },
    async updateCourse(courseId: string, data: { title?: string; description?: string; is_published?: boolean }) {
      const res = await apiFetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: buildHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update course.");
      return res.json();
    },
    async deleteCourse(courseId: string, reason: string) {
      const q = encodeURIComponent(reason.trim());
      const res = await apiFetch(`/api/admin/courses/${courseId}?reason=${q}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete course.");
      return res.json();
    }
  }
};
