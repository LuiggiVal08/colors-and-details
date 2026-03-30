import { create } from 'zustand';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
