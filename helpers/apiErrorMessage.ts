import { AxiosError } from 'axios';

export function apiErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
  const data = axiosErr?.response?.data;
  return data?.message || data?.error || fallback;
}
