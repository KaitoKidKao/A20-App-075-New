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
  certifications?: Record<string, unknown>[];
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

const buildHeaders = (isMultipart = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isMultipart) headers["Content-Type"] = "application/json";
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
      return {
        ...data,
        user: {
          name: credentials.email.split("@")[0] || "User",
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
    async upload(file: File) {
      const formData = new FormData();
      formData.append("file", file);
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

    async listMyVideos() {
      const res = await apiFetch("/api/videos/me", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch my videos.");
      return res.json();
    }
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
  }
  ,

  admin: {
    async getDashboard(): Promise<AdminDashboard> {
      const res = await apiFetch("/api/admin/dashboard", { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch admin dashboard.");
      return res.json();
    }
  }
};
