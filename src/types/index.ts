/**
 * Core user types for Noura AI
 */

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  assignedDoctorId?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (_userData: User) => void;
  logout: () => void;
  updateUser: (_updatedData: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setIsDark: (_dark: boolean) => void;
}

export interface LanguageContextType {
  language: 'ar' | 'en';
  isArabic: boolean;
  setLanguage: (_lang: 'ar' | 'en') => void;
  toggleLanguage: () => void;
  t: (_path: string, _values?: Record<string, unknown>) => string;
  getObject: (_path: string) => unknown;
}

export interface Scan {
  id: string;
  patientId: string;
  uploadedAt: string;
  fileName: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  result?: ScanResult;
}

export interface ScanResult {
  confidence: number;
  findings: string[];
  recommendation: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Patient {
  userId: string;
  name: string;
  email: string;
  assignedDoctorId: string;
  createdAt: string;
}

export interface Doctor {
  userId: string;
  name: string;
  email: string;
  specialization?: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  eventType: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
