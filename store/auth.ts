import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const SecureStorageAdapter = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: number; // Usuario.id
  username: string;
  fullName: string; // Concatenación de nombre y apellido
  role: UserRole;
  token?: string; // Ahora es obligatorio si está logueado
}

interface AuthState {
  user: User | null;
  _hasHydrated: boolean; // <-- Nuevo estado
  setHasHydrated: (state: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => SecureStorageAdapter),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true); // Se dispara cuando termina de cargar
      },
    }
  )
);
