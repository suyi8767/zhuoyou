<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const dashboard = ref<any>(null);
const orders = ref<any[]>([]);
const games = ref<any[]>([]);

async function loadPanel() {
  if (!sessionStore.adminToken) {
    uni.redirectTo({ url: "/pages/admin-login/index" });
    return;
  }
  const [nextDashboard, nextOrders, nextGames] = await Promise.all([
    request("/admin/dashboard", { token: sessionStore.adminToken }),
    request<any[]>("/admin/orders", { token: sessionStore.adminToken }),
    request<any[]>("/admin/games", { token: sessionStore.adminToken }),
  ]);
  dashboard.value = nextDashboard;
  orders.value = nextOrders.slice(0, 8);
  games.value = nextGames.slice(0, 6);
}

async function confirmOrder(id: string) {
  await request(`/admin/orders/${id}/status`, {
    method: "PATCH",
    token: sessionStore.adminToken,
    data: {
      acceptStatus: "confirmed",
    },
  });
  uni.showToast({ title: "已接单", icon: "success" });
  await loadPanel();
}

async function toggleGame(game: any) {
  await request(`/admin/games/${game.id}`, {
    method: "PUT",
    token: sessionStore.adminToken,
    data: {
      ...game,
      status: game.status === "published" ? "offline" : "published",
    },
  });
  uni.showToast({ title: "状态已更新", icon: "success" });
  await loadPanel();
}

function logout() {
  sessionStore.logoutAdmin();
  uni.navigateBack();
}

onShow(() => {
  loadPanel();
});
</script>

<template>
  <view class="page-shell">
    <view class="hero-card panel-hero">
      <view>
        <text class="panel-title">管理员轻量管理台</text>
        <text class="panel-subtitle">用于高频查看订单、快速接单和上下架。</text>
      </view>
      <button class="mini-logout" @click="logout">退出</button>
    </view>

    <view class="stats-grid">
      <view class="panel-card stat-box">
        <text>桌游总数</text>
        <text>{{ dashboard?.overview?.totalGames || 0 }}</text>
      </view>
      <view class="panel-card stat-box">
        <text>订单总数</text>
        <text>{{ dashboard?.overview?.totalOrders || 0 }}</text>
      </view>
      <view class="panel-card stat-box">
        <text>用户总数</text>
        <text>{{ dashboard?.overview?.totalUsers || 0 }}</text>
      </view>
      <view class="panel-card stat-box">
        <text>已支付营收</text>
        <text>¥{{ dashboard?.overview?.paidRevenue || 0 }}</text>
      </view>
    </view>

    <view class="section-title">
      <text>待处理订单</text>
      <text>快速接单</text>
    </view>
    <view v-for="order in orders" :key="order.id" class="panel-card panel-order">
      <text class="panel-order-title">{{ order.items?.[0]?.name }}</text>
      <text class="panel-order-desc">{{ order.schoolName }} · {{ order.contactName }}</text>
      <text class="panel-order-desc">{{ order.acceptStatus }} / {{ order.paymentStatus }}</text>
      <button class="primary-button compact-button" @click="confirmOrder(order.id)">
        确认接单
      </button>
    </view>

    <view class="section-title">
      <text>桌游上下架</text>
      <text>高频运营</text>
    </view>
    <view v-for="game in games" :key="game.id" class="panel-card panel-order">
      <text class="panel-order-title">{{ game.name }}</text>
      <text class="panel-order-desc">库存 {{ game.stock }} · 当前 {{ game.status }}</text>
      <button class="primary-button compact-button" @click="toggleGame(game)">
        {{ game.status === "published" ? "立即下架" : "重新上架" }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.panel-hero {
  padding: 30rpx;
  background: linear-gradient(135deg, rgba(43, 130, 201, 0.94), rgba(21, 157, 138, 0.88));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title,
.panel-subtitle {
  display: block;
  color: white;
}

.panel-title {
  font-size: 38rpx;
  font-weight: 800;
}

.panel-subtitle {
  margin-top: 10rpx;
  opacity: 0.92;
}

.mini-logout {
  margin: 0;
  padding: 0 24rpx;
  line-height: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  margin-top: 22rpx;
}

.stat-box {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.stat-box text:last-child {
  font-size: 34rpx;
  font-weight: 800;
  color: #159d8a;
}

.panel-order {
  margin-top: 18rpx;
  padding: 24rpx;
}

.panel-order-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.panel-order-desc {
  display: block;
  margin-top: 8rpx;
  color: #6b8c88;
}

.compact-button {
  margin-top: 20rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 26rpx;
}
</style>
