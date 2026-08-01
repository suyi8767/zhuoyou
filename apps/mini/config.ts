/** 本地调试改为 true；上传提审前务必 false */
export const USE_LOCAL_API = false;

export const API_BASE_URL = USE_LOCAL_API
  ? "http://localhost:3000"
  : "https://jdong.asia";

export const APP_API_PREFIX = USE_LOCAL_API ? "/app" : "/app1";