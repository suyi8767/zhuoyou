import { API_BASE_URL, APP_API_PREFIX } from "./config";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: Record<string, unknown>;
  token?: string;
}

function resolveUrl(url: string) {
  if (url === "/app" || url.startsWith("/app/")) {
    return `${API_BASE_URL}${url.replace(/^\/app/, APP_API_PREFIX)}`;
  }
  return `${API_BASE_URL}${url}`;
}

export function request<T>(url: string, options: ApiOptions = {}) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: resolveUrl(url),
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
        const message =
          payload?.message ||
          payload?.error ||
          `接口失败 ${url} (${res.statusCode || "?"})`;
        reject(new Error(message));
      },
      fail: (err: any) => {
        reject(
          new Error(
            err?.errMsg ||
              `网络请求失败，请确认后端已启动且可访问 ${API_BASE_URL}`,
          ),
        );
      },
    });
  });
}
