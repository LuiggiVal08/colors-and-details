// services/api.ts
import { API_BASE_URL } from '@/constanst';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';

// O tu variable de entorno

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Aquí viaja el token si lo necesitas
api.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user;

  if (user && config.headers) {
    // Si guardas un token dentro del objeto 'user', descomenta esto:
    // config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

// Interceptor de Respuestas: Para controlar errores de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend dice que no estamos autorizados (token vencido, etc.)
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Devolvemos el error para que TanStack Query se entere de que falló
    return Promise.reject(error);
  }
);

export default api;
