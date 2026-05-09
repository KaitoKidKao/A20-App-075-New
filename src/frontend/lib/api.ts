/**
 * API Service for UDL Hearing
 * Tích hợp đầy đủ các chức năng Auth và Video/AI từ Backend mới.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper để lấy Token từ localStorage (Zustand persist)
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const storage = localStorage.getItem('udl-app-storage');
  if (storage) {
    try {
      const parsed = JSON.parse(storage);
      return parsed.state.token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Cấu hình Fetch Header chung
const getHeaders = (isMultipart = false) => {
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- AUTH API ---
  auth: {
    async register(data: any) {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Đăng ký không thành công');
      }
      return res.json();
    },

    async login(credentials: any) {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email); // OAuth2 dùng 'username'
      formData.append('password', credentials.password);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Đăng nhập thất bại');
      }
      return res.json();
    },

    async getMe() {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy thông tin người dùng');
      return res.json();
    },
  },

  // --- VIDEO & AI API ---
  videos: {
    async upload(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/videos/upload`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
      if (!res.ok) throw new Error('Upload video thất bại');
      return res.json();
    },

    async processUrl(url: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/process-url`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Xử lý URL thất bại');
      return res.json();
    },

    async getStatus(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/status`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy trạng thái');
      return res.json();
    },

    async getTranscript(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/transcript`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy transcript');
      return res.json();
    },

    async getSummary(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/summary`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy summary');
      return res.json();
    },

    async getTimeline(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/timeline`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy timeline');
      return res.json();
    },

    async getHighlights(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/highlights`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy highlights');
      return res.json();
    },

    async getQuestions(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/questions`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy questions');
      return res.json();
    },

    async getBriefing(videoId: string) {
      const res = await fetch(`${API_BASE_URL}/api/videos/${videoId}/briefing`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Không thể lấy briefing');
      return res.json();
    },
  }
};
