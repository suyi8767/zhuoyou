import { API_BASE_URL } from "./config";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: Record<string, unknown>;
  token?: string;
}

export function request<T>(url: string, options: ApiOptions = {}) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${url}`,
      method: options.method || "GET",
      data: options.data,
      header: options.token
        ? {
            Authorization: `Bearer ${options.token}`,
          }
        : {},
      success: (res: any) => {
        const payload = res.data as any;
        if (payload?.success) {
          resolve(payload.data as T);
          return;
        }
        reject(payload);
      },
      fail: reject,
    });
  });
}
