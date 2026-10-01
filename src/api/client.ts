import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  ?? "https://api-production-0f6b.up.railway.app/api/v1";

export class ApiError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: 30_000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) config.headers.delete("Content-Type");
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[]; error?: string }>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    if (status === 401 && !url.includes("/auth/login")) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/auth")) window.location.assign("/auth");
    }
    const responseMessage = error.response?.data?.message;
    const message = Array.isArray(responseMessage)
      ? responseMessage.join(" ")
      : responseMessage ?? error.response?.data?.error ?? error.message ?? "Something went wrong. Please try again.";
    return Promise.reject(new ApiError(message, status, error.response?.data));
  },
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.request<T>(config);
  return response.data;
}

export const apiClient = {
  get: <T>(url: string, params?: object, config?: AxiosRequestConfig) => request<T>({ ...config, method: "GET", url, params }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "POST", url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "PUT", url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "PATCH", url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: "DELETE", url }),
};
