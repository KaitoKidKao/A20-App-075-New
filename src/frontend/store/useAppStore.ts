'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'teacher' | 'student' | 'admin';
type FontSize = 'S' | 'M' | 'L' | 'XL';
type Theme = 'light' | 'dark';

interface User {
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AppState {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;

  currentRole: Role;
  setRole: (role: Role) => void;
  
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  
  autoScroll: boolean;
  setAutoScroll: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true, 
        currentRole: user.role 
      }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      currentRole: 'student',
      setRole: (role) => set({ currentRole: role }),
      
      fontSize: 'L',
      setFontSize: (size) => set({ fontSize: size }),
      
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      highContrast: true,
      setHighContrast: (highContrast) => set({ highContrast }),
      
      autoScroll: true,
      setAutoScroll: (autoScroll) => set({ autoScroll }),
    }),
    {
      name: 'udl-app-storage',
    }
  )
);
