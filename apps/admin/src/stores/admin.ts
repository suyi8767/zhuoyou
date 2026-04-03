import { defineStore } from "pinia";
import { ref } from "vue";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../api/client";

export const useAdminStore = defineStore("admin", () => {
  const token = ref(localStorage.getItem("admin-token") || "");
  const admin = ref<any>(null);
  const dashboard = ref<any>(null);
  const banners = ref<any[]>([]);
  const schools = ref<any[]>([]);
  const categories = ref<any[]>([]);
  const games = ref<any[]>([]);
  const orders = ref<any[]>([]);
  const users = ref<any[]>([]);
  const coupons = ref<any[]>([]);
  const settings = ref({
    orderAcceptMode: "manual",
    paymentMode: "mock",
    miniAdminEnabled: true,
  });
  const reports = ref<any>(null);
  const loading = ref(false);

  async function login(username: string, password: string) {
    loading.value = true;
    try {
      const data = await apiPost<any>("/admin/auth/login", { username, password });
      token.value = data.token;
      admin.value = data.admin;
      localStorage.setItem("admin-token", data.token);
      await fetchBootstrap();
    } finally {
      loading.value = false;
    }
  }

  async function fetchBootstrap() {
    loading.value = true;
    try {
      const [
        nextDashboard,
        nextBanners,
        nextSchools,
        nextCategories,
        nextGames,
        nextOrders,
        nextUsers,
        nextCoupons,
        nextSettings,
        nextReports,
      ] = await Promise.all([
        apiGet<any>("/admin/dashboard"),
        apiGet<any[]>("/admin/banners"),
        apiGet<any[]>("/admin/schools"),
        apiGet<any[]>("/admin/categories"),
        apiGet<any[]>("/admin/games"),
        apiGet<any[]>("/admin/orders"),
        apiGet<any[]>("/admin/users"),
        apiGet<any[]>("/admin/coupons"),
        apiGet<any>("/admin/settings"),
        apiGet<any>("/admin/reports/overview"),
      ]);

      dashboard.value = nextDashboard;
      banners.value = nextBanners;
      schools.value = nextSchools;
      categories.value = nextCategories;
      games.value = nextGames;
      orders.value = nextOrders;
      users.value = nextUsers;
      coupons.value = nextCoupons;
      settings.value = nextSettings;
      reports.value = nextReports;
    } finally {
      loading.value = false;
    }
  }

  async function saveEntity(kind: string, payload: any, id?: string) {
    const url = id ? `/admin/${kind}/${id}` : `/admin/${kind}`;
    if (id) {
      await apiPut(url, payload);
    } else {
      await apiPost(url, payload);
    }
    await fetchBootstrap();
  }

  async function deleteEntity(kind: string, id: string) {
    await apiDelete(`/admin/${kind}/${id}`);
    await fetchBootstrap();
  }

  async function updateOrderStatus(id: string, payload: any) {
    await apiPatch(`/admin/orders/${id}/status`, payload);
    await fetchBootstrap();
  }

  async function updateSettings(payload: any) {
    settings.value = await apiPut("/admin/settings", payload);
    await fetchBootstrap();
  }

  function logout() {
    token.value = "";
    admin.value = null;
    localStorage.removeItem("admin-token");
  }

  return {
    token,
    admin,
    dashboard,
    banners,
    schools,
    categories,
    games,
    orders,
    users,
    coupons,
    settings,
    reports,
    loading,
    login,
    fetchBootstrap,
    saveEntity,
    deleteEntity,
    updateOrderStatus,
    updateSettings,
    logout,
  };
});
