import { AxiosError } from 'axios';

export function apiErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string; error?: string; detail?: string }>;
  const data = axiosErr?.response?.data;
  return data?.message || data?.error || data?.detail || axiosErr.message || fallback;
}
