import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const client = axios.create({
  baseURL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function apiGet<T>(url: string) {
  const response = await client.get<ApiEnvelope<T>>(url);
  return response.data.data;
}

export async function apiPost<T>(url: string, data?: unknown) {
  const response = await client.post<ApiEnvelope<T>>(url, data);
  return response.data.data;
}

export async function apiPut<T>(url: string, data?: unknown) {
  const response = await client.put<ApiEnvelope<T>>(url, data);
  return response.data.data;
}

export async function apiPatch<T>(url: string, data?: unknown) {
  const response = await client.patch<ApiEnvelope<T>>(url, data);
  return response.data.data;
}

export async function apiDelete<T>(url: string) {
  const response = await client.delete<ApiEnvelope<T>>(url);
  return response.data.data;
}
