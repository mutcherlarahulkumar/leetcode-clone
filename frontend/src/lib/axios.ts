import axios, { AxiosError } from "axios";
import { TOKEN_STORAGE_KEY } from "@lecode/constants";
import type { ApiError } from "@lecode/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Single shared instance. Every api module imports this rather than calling
// axios directly, so auth and error handling live in exactly one place.
export const http = axios.create({ baseURL });

export const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn the backend's { errors: string[] } into a single readable message.
export const errorMessage = (err: unknown, fallback = "Something went wrong") => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.errors?.length) return data.errors.join(", ");
    if (err.message) return err.message;
  }
  return fallback;
};

export const statusOf = (err: unknown): number | undefined =>
  err instanceof AxiosError ? err.response?.status : undefined;
