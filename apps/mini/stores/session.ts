import { defineStore } from "pinia";
import { request } from "../api";

export const useSessionStore = defineStore("session", {
  state: () => ({
    token: uni.getStorageSync("user-token") || "",
    user: uni.getStorageSync("user-info") || null,
    adminToken: uni.getStorageSync("admin-token") || "",
    admin: uni.getStorageSync("admin-info") || null,
  }),
  actions: {
    async ensureUserSession() {
      if (this.token && this.user) {
        return;
      }
      const code = `demo-${Date.now()}`;
      const data = await request<any>("/app/auth/wechat-silent", {
        method: "POST",
        data: {
          code,
          nickname: "青春玩家",
        },
      });
      this.token = data.token;
      this.user = data.user;
      uni.setStorageSync("user-token", data.token);
      uni.setStorageSync("user-info", data.user);
    },

    async loginAdmin(username: string, password: string) {
      const data = await request<any>("/app/admin/login", {
        method: "POST",
        data: { username, password },
      });
      this.adminToken = data.token;
      this.admin = data.admin;
      uni.setStorageSync("admin-token", data.token);
      uni.setStorageSync("admin-info", data.admin);
    },

    logoutAdmin() {
      this.adminToken = "";
      this.admin = null;
      uni.removeStorageSync("admin-token");
      uni.removeStorageSync("admin-info");
    },
  },
});
