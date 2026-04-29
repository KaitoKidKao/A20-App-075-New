import { create } from 'zustand';

type Role = 'teacher' | 'student' | 'admin';
type FontSize = 'S' | 'M' | 'L' | 'XL';
type Theme = 'light' | 'dark';

interface AppState {
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

export const useAppStore = create<AppState>((set) => ({
  currentRole: 'teacher',
  setRole: (role) => set({ currentRole: role }),
  
  fontSize: 'L', // Default to L to accommodate the deaf students easily
  setFontSize: (size) => set({ fontSize: size }),
  
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  highContrast: true, // Default to high contrast for accessibility
  setHighContrast: (highContrast) => set({ highContrast }),
  
  autoScroll: true,
  setAutoScroll: (autoScroll) => set({ autoScroll }),
}));
