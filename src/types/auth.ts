export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  rating: number;
  completedLevels: string[];
  dailyChallengesCompleted?: string[]; // Date strings like '2026-09-29'
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}
