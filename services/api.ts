// services/api.ts
import { API_BASE_URL } from '@/constants';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor de Peticiones: Adjunta el token a cada salida
api.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user;

  if (user?.token && config.headers) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

// 2. Interceptor de Respuestas: Escucha si el server mandó un token nuevo
api.interceptors.response.use(
  (response) => {
    // Buscamos el header en minúsculas o mayúsculas
    const newTokenHeader = response.headers['authorization'] || response.headers['Authorization'];

    if (newTokenHeader && newTokenHeader.startsWith('Bearer ')) {
      const newToken = newTokenHeader.split(' ')[1];
      const currentUser = useAuthStore.getState().user;

      // Si hay un usuario logueado y el token cambió, lo actualizamos
      if (currentUser && currentUser.token !== newToken) {
        useAuthStore.getState().login({
          ...currentUser,
          token: newToken,
        });
        // Al ejecutar login(), Zustand actualiza el SecureStore automáticamente
      }
    }

    return response;
  },
  (error) => {
    // Si el backend dice que no estamos autorizados (token vencido)
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default api;
