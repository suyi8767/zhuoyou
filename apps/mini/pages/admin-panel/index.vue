<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const dashboard = ref<any>(null);
const orders = ref<any[]>([]);
const games = ref<any[]>([]);
const loading = ref(false);
const activeTab = ref<"orders" | "games">("orders");
const filterKey = ref("all");

const filters = [
  { key: "all", label: "全部" },
  { key: "pending_pay", label: "待付款" },
  { key: "pending_accept", label: "待接单" },
  { key: "in_use", label: "使用中" },
  { key: "refund_deposit", label: "待退押金" },
  { key: "paid", label: "已付款" },
];

const paymentLabel: Record<string, string> = {
  pending: "待付款",
  paid: "已付款",
  failed: "支付失败",
  cancelled: "已取消",
};

const acceptLabel: Record<string, string> = {
  pending: "待接单",
  confirmed: "已接单",
  rejected: "已拒绝",
};

const deliveryLabel: Record<string, string> = {
  pending: "待配送",
  delivering: "配送中",
  delivered: "已送达",
  returned: "已归还",
};

const depositRefundLabel: Record<string, string> = {
  none: "未退还",
  pending: "退款中",
  refunded: "已退还",
};

function paymentColor(status: string) {
  const map: Record<string, string> = {
    pending: "#f59e0b",
    paid: "#16a34a",
    failed: "#ef4444",
    cancelled: "#9ca3af",
  };
  return map[status] || "#6b7280";
}

function acceptColor(status: string) {
  const map: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    rejected: "#ef4444",
  };
  return map[status] || "#6b7280";
}

function depositAmount(order: any) {
  const deposit =
    order.payableDeposit != null
      ? order.payableDeposit
      : order.deposit != null
        ? order.deposit
        : 0;
  return Number(deposit);
}

function isDepositRefunded(order: any) {
  if (order.depositRefundStatus === "refunded") return true;
  // 兼容历史数据：已有退款时间 / 流水号则视为已退
  if (
    order.depositRefundedAt ||
    order.depositRefundId ||
    order.depositRefundOutNo
  ) {
    return true;
  }
  return false;
}

function canRefundDeposit(order: any) {
  const paidOk =
    !order.paymentStatus ||
    order.paymentStatus === "paid";
  return (
    depositAmount(order) > 0 &&
    paidOk &&
    !isDepositRefunded(order)
  );
}

const filteredOrders = computed(() => {
  const list = orders.value;
  switch (filterKey.value) {
    case "pending_pay":
      return list.filter((o) => o.paymentStatus === "pending");
    case "pending_accept":
      return list.filter(
        (o) => o.paymentStatus === "paid" && o.acceptStatus === "pending",
      );
    case "in_use":
      return list.filter(
        (o) =>
          o.acceptStatus === "confirmed" &&
          o.deliveryStatus !== "returned" &&
          o.paymentStatus === "paid",
      );
    case "refund_deposit":
      return list.filter((o) => canRefundDeposit(o));
    case "paid":
      return list.filter((o) => o.paymentStatus === "paid");
    default:
      return list;
  }
});

function gameNames(order: any) {
  return (order.items || []).map((i: any) => i.name).join("、") || "未命名桌游";
}

function depositRefundText(order: any) {
  if (depositAmount(order) <= 0) return "无押金";
  if (isDepositRefunded(order)) return "已退还";
  if (order.depositRefundStatus === "pending") return "退款中";
  return (
    depositRefundLabel[order.depositRefundStatus || "none"] ||
    "未退还"
  );
}

function depositRefundColor(order: any) {
  if (depositAmount(order) <= 0) return "#9ca3af";
  if (isDepositRefunded(order)) return "#16a34a";
  if (order.depositRefundStatus === "pending") return "#f59e0b";
  return "#ef4444";
}

function formatTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatMoney(n: number) {
  return `¥${Number(n || 0).toFixed(2)}`;
}

async function loadPanel() {
  if (!sessionStore.adminToken) {
    uni.redirectTo({ url: "/pages/admin-login/index" });
    return;
  }
  loading.value = true;
  try {
    const [nextDashboard, nextOrders, nextGames] = await Promise.all([
      request("/admin/dashboard", { token: sessionStore.adminToken }),
      request<any[]>("/admin/orders", { token: sessionStore.adminToken }),
      request<any[]>("/admin/games", { token: sessionStore.adminToken }),
    ]);
    dashboard.value = nextDashboard;
    orders.value = nextOrders || [];
    games.value = nextGames || [];
  } catch (error: any) {
    uni.showToast({
      title: error?.message || "加载失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
}

async function patchOrder(id: string, data: Record<string, string>) {
  try {
    await request(`/admin/orders/${id}/status`, {
      method: "PATCH",
      token: sessionStore.adminToken,
      data,
    });
    uni.showToast({ title: "已更新", icon: "success" });
    await loadPanel();
  } catch (error: any) {
    uni.showToast({
      title: error?.message || "操作失败",
      icon: "none",
    });
  }
}

function refundDeposit(order: any) {
  const amount = depositAmount(order);
  uni.showModal({
    title: "确认退押金",
    content: `确认退还订单 ${order.orderNo || ""} 的押金 ${formatMoney(amount)} 吗？`,
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await request(`/admin/orders/${order.id}/refund-deposit`, {
          method: "POST",
          token: sessionStore.adminToken,
        });
        uni.showToast({ title: "押金已退还", icon: "success" });
        await loadPanel();
      } catch (error: any) {
        uni.showToast({
          title: error?.message || "退押金失败",
          icon: "none",
        });
      }
    },
  });
}

async function toggleGame(game: any) {
  try {
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
  } catch (error: any) {
    uni.showToast({
      title: error?.message || "操作失败",
      icon: "none",
    });
  }
}

function callPhone(phone: string) {
  if (!phone) return;
  uni.makePhoneCall({ phoneNumber: String(phone) });
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
  <view class="page">
    <view class="hero">
      <view class="hero-main">
        <text class="hero-title">轻量运营台</text>
        <text class="hero-sub">查看订单、付款状态与配送地址</text>
      </view>
      <view class="hero-actions">
        <view class="ghost-btn" @click="loadPanel">刷新</view>
        <view class="ghost-btn" @click="logout">退出</view>
      </view>
    </view>

    <view class="stats">
      <view class="stat">
        <text class="stat-label">订单</text>
        <text class="stat-value">{{ dashboard?.overview?.totalOrders || 0 }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">桌游</text>
        <text class="stat-value">{{ dashboard?.overview?.totalGames || 0 }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">用户</text>
        <text class="stat-value">{{ dashboard?.overview?.totalUsers || 0 }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">营收</text>
        <text class="stat-value accent">
          ¥{{ Number(dashboard?.overview?.paidRevenue || 0).toFixed(0) }}
        </text>
      </view>
    </view>

    <view class="tabs">
      <view
        :class="['tab', { active: activeTab === 'orders' }]"
        @click="activeTab = 'orders'"
      >
        订单管理
      </view>
      <view
        :class="['tab', { active: activeTab === 'games' }]"
        @click="activeTab = 'games'"
      >
        桌游上下架
      </view>
    </view>

    <view v-if="activeTab === 'orders'">
      <scroll-view scroll-x class="filters" show-scrollbar="false">
        <view class="filters-row">
          <view
            v-for="f in filters"
            :key="f.key"
            :class="['chip', { active: filterKey === f.key }]"
            @click="filterKey = f.key"
          >
            {{ f.label }}
          </view>
        </view>
      </scroll-view>

      <view v-if="loading" class="empty">加载中...</view>
      <view v-else-if="!filteredOrders.length" class="empty">暂无相关订单</view>

      <view v-for="order in filteredOrders" :key="order.id" class="order-card">
        <view class="order-top">
          <text class="order-no">{{ order.orderNo || order.id }}</text>
          <text class="order-time">{{ formatTime(order.createdAt) }}</text>
        </view>

        <text class="order-game">{{ gameNames(order) }}</text>

        <view class="status-row">
          <text class="status-pill" :style="{ color: paymentColor(order.paymentStatus) }">
            付款 {{ paymentLabel[order.paymentStatus] || order.paymentStatus }}
          </text>
          <text class="status-pill" :style="{ color: acceptColor(order.acceptStatus) }">
            接单 {{ acceptLabel[order.acceptStatus] || order.acceptStatus }}
          </text>
          <text class="status-pill muted">
            配送 {{ deliveryLabel[order.deliveryStatus] || order.deliveryStatus }}
          </text>
          <text
            class="status-pill"
            :style="{ color: depositRefundColor(order) }"
          >
            押金 {{ depositRefundText(order) }}
          </text>
        </view>

        <view class="info-block">
          <view class="info-row">
            <text class="info-label">租期</text>
            <text class="info-value">
              {{ order.rentalStartDate }} 至 {{ order.rentalEndDate }} ·
              {{ order.rentalDays }}天
            </text>
          </view>
          <view class="info-row">
            <text class="info-label">时段</text>
            <text class="info-value">{{ order.deliverySlotLabel || "—" }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">学校</text>
            <text class="info-value">{{ order.schoolName || "—" }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">地址</text>
            <text class="info-value">{{ order.addressDetail || "—" }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">联系人</text>
            <text class="info-value">
              {{ order.contactName || "—" }}
              <text
                v-if="order.contactPhone"
                class="phone"
                @click="callPhone(order.contactPhone)"
              >
                {{ order.contactPhone }}
              </text>
            </text>
          </view>
          <view class="info-row">
            <text class="info-label">金额</text>
            <text class="info-value money">
              {{ formatMoney(order.totalAmount) }}
            </text>
          </view>
          <view v-if="depositAmount(order) > 0" class="info-row">
            <text class="info-label">押金</text>
            <text class="info-value">
              {{ formatMoney(depositAmount(order)) }}
              <text
                class="deposit"
                :style="{ color: depositRefundColor(order) }"
              >
                · {{ depositRefundText(order) }}
              </text>
            </text>
          </view>
        </view>

        <view class="actions">
          <view
            v-if="order.acceptStatus === 'pending'"
            class="btn primary"
            @click="patchOrder(order.id, { acceptStatus: 'confirmed' })"
          >
            确认接单
          </view>
          <view
            v-if="order.paymentStatus === 'pending'"
            class="btn warn"
            @click="patchOrder(order.id, { paymentStatus: 'paid' })"
          >
            标记已付
          </view>
          <view
            v-if="
              order.acceptStatus === 'confirmed' &&
              order.deliveryStatus !== 'delivered' &&
              order.deliveryStatus !== 'returned'
            "
            class="btn primary"
            @click="patchOrder(order.id, { deliveryStatus: 'delivered' })"
          >
            标记送达
          </view>
          <view
            v-if="order.deliveryStatus === 'delivered'"
            class="btn ghost"
            @click="patchOrder(order.id, { deliveryStatus: 'returned' })"
          >
            确认归还
          </view>
          <view
            v-if="canRefundDeposit(order)"
            class="btn refund"
            @click="refundDeposit(order)"
          >
            退押金
          </view>
          <view
            v-if="order.acceptStatus === 'pending'"
            class="btn ghost"
            @click="patchOrder(order.id, { acceptStatus: 'rejected' })"
          >
            拒绝
          </view>
        </view>
      </view>
    </view>

    <view v-else>
      <view v-if="!games.length" class="empty">暂无桌游</view>
      <view v-for="game in games" :key="game.id" class="game-card">
        <view class="game-main">
          <image :src="game.coverImage" class="game-cover" mode="aspectFill" />
          <view class="game-info">
            <text class="game-name">{{ game.name }}</text>
            <text class="game-meta">
              库存 {{ game.stock }} ·
              {{ game.status === "published" ? "已上架" : "已下架" }}
            </text>
            <text class="game-price">¥{{ Number(game.dailyPrice || 0).toFixed(2) }}/天</text>
          </view>
        </view>
        <view
          :class="['btn', game.status === 'published' ? 'ghost' : 'primary']"
          @click="toggleGame(game)"
        >
          {{ game.status === "published" ? "立即下架" : "重新上架" }}
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 48rpx;
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 28%, #ffffff 70%);
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 55%, #0d9488 100%);
}

.hero-title {
  display: block;
  color: #fff;
  font-size: 36rpx;
  font-weight: 800;
}

.hero-sub {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 22rpx;
}

.hero-actions {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
}

.ghost-btn {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 22rpx;
}

.stats {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.stat {
  background: #fff;
  border-radius: 16rpx;
  padding: 18rpx 12rpx;
  border: 1rpx solid #eef2f7;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
}

.stat-label {
  font-size: 20rpx;
  color: #9ca3af;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 800;
  color: #111827;
}

.stat-value.accent {
  color: #3b82f6;
  font-size: 24rpx;
}

.tabs {
  margin-top: 24rpx;
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 6rpx;
  border: 1rpx solid #eef2f7;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #6b7280;
  font-weight: 600;
}

.tab.active {
  background: #eff6ff;
  color: #3b82f6;
}

.filters {
  margin-top: 18rpx;
  white-space: nowrap;
}

.filters-row {
  display: inline-flex;
  gap: 12rpx;
  padding-bottom: 4rpx;
}

.chip {
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid #e5e7eb;
  font-size: 22rpx;
  color: #6b7280;
}

.chip.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.empty {
  margin-top: 80rpx;
  text-align: center;
  color: #9ca3af;
  font-size: 28rpx;
}

.order-card {
  margin-top: 18rpx;
  background: #fff;
  border-radius: 20rpx;
  border: 1rpx solid #eef2f7;
  padding: 24rpx;
}

.order-top {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.order-no {
  font-size: 22rpx;
  color: #6b7280;
  font-weight: 600;
}

.order-time {
  font-size: 20rpx;
  color: #9ca3af;
  flex-shrink: 0;
}

.order-game {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: #111827;
  margin-bottom: 14rpx;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.status-pill {
  font-size: 22rpx;
  font-weight: 700;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #f8fafc;
}

.status-pill.muted {
  color: #6b7280;
}

.info-block {
  background: #f8fafc;
  border-radius: 14rpx;
  padding: 16rpx 18rpx;
}

.info-row {
  display: flex;
  gap: 16rpx;
  padding: 8rpx 0;
}

.info-label {
  width: 80rpx;
  flex-shrink: 0;
  font-size: 22rpx;
  color: #9ca3af;
}

.info-value {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #374151;
  line-height: 1.45;
  word-break: break-all;
}

.info-value.money {
  color: #3b82f6;
  font-weight: 800;
  font-size: 28rpx;
}

.deposit {
  font-size: 20rpx;
  color: #9ca3af;
  font-weight: 500;
}

.phone {
  margin-left: 12rpx;
  color: #3b82f6;
  font-weight: 700;
}

.actions {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: flex-end;
}

.btn {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.btn.primary {
  background: #3b82f6;
  color: #fff;
}

.btn.warn {
  background: #f59e0b;
  color: #fff;
}

.btn.refund {
  background: #ef4444;
  color: #fff;
}

.btn.ghost {
  background: #fff;
  color: #6b7280;
  border: 2rpx solid #e5e7eb;
}

.game-card {
  margin-top: 18rpx;
  background: #fff;
  border-radius: 20rpx;
  border: 1rpx solid #eef2f7;
  padding: 22rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.game-main {
  display: flex;
  gap: 18rpx;
}

.game-cover {
  width: 112rpx;
  height: 112rpx;
  border-radius: 14rpx;
  background: #f3f4f6;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.game-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
}

.game-meta {
  font-size: 22rpx;
  color: #9ca3af;
}

.game-price {
  font-size: 26rpx;
  font-weight: 800;
  color: #3b82f6;
}
</style>
