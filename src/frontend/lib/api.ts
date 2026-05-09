/**
 * API service for frontend -> backend communication.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AuthUser {
  name: string;
  email: string;
  role: 'student' | 'admin' | 'teacher';
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: 'student' | 'admin' | 'teacher';
  user: AuthUser;
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const storage = localStorage.getItem('udl-app-storage');
  if (!storage) return null;

  try {
    const parsed = JSON.parse(storage);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

const getHeaders = (isMultipart = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isMultipart) headers['Content-Type'] = 'application/json';

  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  auth: {
    async register(data: { email: string; password: string; confirm_password: string; full_name?: string; role?: string }) {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Registration failed.');
      }
      return res.json();
    },

    async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Login failed.');
      }

      const data = await res.json();
      return {
        ...data,
        user: {
          name: credentials.email.split('@')[0] || 'User',
          email: credentials.email,
          role: data.role || 'student',
        },
      };
    },
  },

  videos: {
    async upload(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/videos/upload`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Video upload failed.');
      }
      return res.json();
    },

    async processUrl(url: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/process-url`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Processing URL failed.');
      return res.json();
    },

    async getStatus(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/status`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch status.');
      return res.json();
    },

    async getTranscript(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/transcript`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch transcript.');
      return res.json();
    },

    async getSummary(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/summary`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch summary.');
      return res.json();
    },

    async getTimeline(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/timeline`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch timeline.');
      return res.json();
    },

    async getHighlights(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/highlights`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch highlights.');
      return res.json();
    },

    async getQuestions(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/questions`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch questions.');
      return res.json();
    },

    async getBriefing(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/briefing`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch briefing.');
      return res.json();
    },
  },
};
