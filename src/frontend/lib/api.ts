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
  time: number;
  word: string;
  vsl_info: VSLInfo | null;
}

export interface HandsSignResponse {
  video_id: string;
  handsign_data: HandsSignGloss[];
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

    async generateAvatar(videoId: string) {
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

    async getAvatar(videoId: string) {
      const res = await apiFetch(`/api/videos/${videoId}/avatar`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Failed to fetch avatar video state.");
      return res.json();
    },
  },
};
