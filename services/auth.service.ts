// services/authService.ts
import api from './api';
import { SecurityFormData } from '@/schemas/securitySchema';

export interface LoginCredentials {
  username: string;
  password: string;
}

export const signIn = async (credentials: LoginCredentials) => {
  // Axios ya sabe que debe pegarle a API_BASE_URL + '/user/singin'
  const response = await api.post('/user/signin', credentials);

  // Retornamos la respuesta. Axios guarda lo que manda el server en .data
  return response.data;
};

export const serverLogout = async () => {
  await api.post('/user/logout');
};

export const changePassword = async (id: number, data: SecurityFormData) => {
  // Mapeamos los campos del formulario a lo que espera el controlador
  const payload = {
    passwordActual: data.currentPassword,
    passwordNueva: data.newPassword,
    passwordConfirmacion: data.confirmPassword,
  };

  const response = await api.post(`/user/change-password/${id}`, payload);

  return response.data;
};
