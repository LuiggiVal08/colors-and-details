// services/authService.ts
import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export const signIn = async (credentials: LoginCredentials) => {
  // Axios ya sabe que debe pegarle a API_BASE_URL + '/user/singin'
  const response = await api.post('/user/singin', credentials);

  // Retornamos la respuesta. Axios guarda lo que manda el server en .data
  return response.data;
};
