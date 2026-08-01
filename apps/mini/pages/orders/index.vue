<script setup lang="ts">
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const orders = ref<any[]>([]);
const activeStatus = ref("all");
const statusBarHeight = ref(20);

function getStatusBarHeight() {
  try {
    const info = uni.getSystemInfoSync();
    statusBarHeight.value = info.statusBarHeight || 20;
  } catch {
    statusBarHeight.value = 20;
  }
}

const statusTabs = [
  { key: "all", label: "全部" },
  { key: "待付款", label: "待付款" },
  { key: "待确认", label: "待确认" },
  { key: "使用中", label: "使用中" },
  { key: "待结算", label: "待结算" },
  { key: "已完成", label: "已完成" },
];

function getOrderDisplayStatus(order: any): string {
  if (order.paymentStatus === "cancelled") return "已取消";
  if (order.paymentStatus === "failed") return "支付失败";
  if (order.paymentStatus === "pending") return "待付款";
  if (order.acceptStatus === "rejected") return "已拒绝";
  if (order.acceptStatus === "pending") return "待确认";
  if (order.deliveryStatus === "returned") return "已完成";
  if (order.deliveryStatus === "delivered") return "待结算";
  return "使用中";
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    待付款: "#f5b800",
    待确认: "#f5b800",
    使用中: "#3b82f6",
    待结算: "#f5b800",
    已完成: "#9ca3af",
    已取消: "#9ca3af",
    支付失败: "#ef4444",
    已拒绝: "#ef4444",
  };
  return map[status] || "#9ca3af";
}

const filteredOrders = computed(() => {
  if (activeStatus.value === "all") return orders.value;
  return orders.value.filter(
    (o) => getOrderDisplayStatus(o) === activeStatus.value,
  );
});

const orderCount = computed(() => orders.value.length);

const totalSpent = computed(() =>
  orders.value
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0),
);

function statusCount(key: string): number {
  if (key === "all") return orders.value.length;
  return orders.value.filter((o) => getOrderDisplayStatus(o) === key).length;
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function goDetail(_id: string) {}

async function handlePay(order: any) {
  try {
    await request("/app/payments/mock", {
      orderId: order.id,
      outcome: "success",
    });
    uni.showToast({ title: "支付成功", icon: "success" });
    await refreshOrders();
  } catch {
    uni.showToast({ title: "支付失败", icon: "none" });
  }
}

async function handleCancel(order: any) {
  uni.showModal({
    title: "确认取消",
    content: "确认取消该订单吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await request("/app/payments/mock", {
            orderId: order.id,
            outcome: "cancel",
          });
          uni.showToast({ title: "已取消", icon: "success" });
          await refreshOrders();
        } catch {
          uni.showToast({ title: "取消失败", icon: "none" });
        }
      }
    },
  });
}

async function refreshOrders() {
  try {
    const result = await request("/app/orders", {
      token: sessionStore.token,
    });
    orders.value = result;
  } catch {
    orders.value = [];
  }
}

onShow(async () => {
  getStatusBarHeight();
  await sessionStore.ensureUserSession();
  await refreshOrders();
});
</script>

<template>
  <view class="page">
    <view class="page-pad" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="brand">
        <text class="brand-title">我的订单</text>
        <text class="brand-subtitle">查看租赁进度与消费记录</text>
      </view>

      <view class="summary">
        <text class="summary-title">订单信息</text>
        <view class="summary-row">
          <text class="summary-item">
            订单总数：
            <text class="summary-num">{{ orderCount }}</text>
          </text>
          <text class="summary-item">
            总消费：
            <text class="summary-price">¥{{ totalSpent.toFixed(2) }}</text>
          </text>
        </view>
      </view>

      <view class="tabs">
        <view
          v-for="tab in statusTabs"
          :key="tab.key"
          :class="['tab', { active: activeStatus === tab.key }]"
          @click="activeStatus = tab.key"
        >
          <text class="tab-count">{{ statusCount(tab.key) }}</text>
          <text class="tab-label">{{ tab.label }}</text>
        </view>
      </view>

      <view v-if="!filteredOrders.length" class="empty">暂无相关订单</view>

      <view v-for="order in filteredOrders" :key="order.id" class="order">
        <view class="order-head">
          <text class="order-tag">租赁</text>
          <text class="order-time">下单时间：{{ formatTime(order.createdAt) }}</text>
          <text
            class="order-status"
            :style="{ color: getStatusColor(getOrderDisplayStatus(order)) }"
          >
            {{ getOrderDisplayStatus(order) }}
          </text>
        </view>

        <view
          v-for="item in order.items"
          :key="item.gameId"
          class="product"
        >
          <image :src="item.coverImage" class="product-img" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-sub">
              {{ order.rentalStartDate }} 至 {{ order.rentalEndDate }} ·
              {{ order.rentalDays }}天
            </text>
          </view>
          <view class="product-side">
            <text class="product-price">¥{{ item.dailyPrice.toFixed(2) }}/天</text>
            <text class="product-qty">×{{ order.rentalDays }}</text>
          </view>
        </view>

        <view class="cost">
          <text v-if="order.deposit" class="cost-deposit">
            押金 ¥{{ order.deposit.toFixed(2) }}
          </text>
          <text class="cost-total">
            合计
            <text class="cost-amount">¥{{ order.totalAmount.toFixed(2) }}</text>
          </text>
        </view>

        <view class="actions">
          <view
            v-if="getOrderDisplayStatus(order) === '待付款'"
            class="btn ghost"
            @click="handleCancel(order)"
          >
            取消订单
          </view>
          <view
            v-if="getOrderDisplayStatus(order) === '待付款'"
            class="btn primary"
            @click="handlePay(order)"
          >
            立即付款
          </view>
          <view class="btn ghost" @click="goDetail(order.id)">查看详情</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f2ff 0%, #f5f9ff 32%, #ffffff 62%);
  padding-bottom: 120rpx;
}

.page-pad {
  padding: 8rpx 36rpx 0;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 28rpx;
}

.brand-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #111827;
  line-height: 1.25;
}

.brand-subtitle {
  font-size: 24rpx;
  color: #9ca3af;
}

.summary {
  padding: 8rpx 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.summary-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16rpx;
}

.summary-row {
  display: flex;
  gap: 40rpx;
}

.summary-item {
  font-size: 24rpx;
  color: #6b7280;
}

.summary-num {
  font-weight: 700;
  color: #111827;
}

.summary-price {
  font-weight: 700;
  color: #f5b800;
}

.tabs {
  margin-top: 8rpx;
  padding: 22rpx 0 8rpx;
  display: flex;
  justify-content: space-around;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 10rpx 14rpx;
  position: relative;
}

.tab.active .tab-label {
  color: #111827;
  font-weight: 700;
}

.tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #f5b800;
}

.tab-count {
  font-size: 32rpx;
  font-weight: 800;
  color: #111827;
}

.tab-label {
  font-size: 22rpx;
  color: #9ca3af;
}

.empty {
  margin-top: 100rpx;
  text-align: center;
  color: #9ca3af;
  font-size: 28rpx;
}

.order {
  margin-top: 8rpx;
  padding: 8rpx 0 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 18rpx 0;
}

.order-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #fff8e6;
  color: #f5b800;
  font-size: 20rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.order-time {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-status {
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.product {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 12rpx 0;
}

.product-img {
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.product-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-sub {
  font-size: 22rpx;
  color: #9ca3af;
}

.product-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
  flex-shrink: 0;
}

.product-price {
  font-size: 26rpx;
  font-weight: 700;
  color: #111827;
}

.product-qty {
  font-size: 22rpx;
  color: #9ca3af;
}

.cost {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20rpx;
  padding: 12rpx 0;
}

.cost-deposit {
  font-size: 22rpx;
  color: #9ca3af;
}

.cost-total {
  font-size: 24rpx;
  color: #6b7280;
}

.cost-amount {
  font-size: 32rpx;
  font-weight: 800;
  color: #f5b800;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 14rpx;
  padding: 8rpx 0 4rpx;
}

.btn {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.btn.ghost {
  border: 2rpx solid #e5e7eb;
  color: #6b7280;
  background: #ffffff;
}

.btn.primary {
  border: 2rpx solid #f5b800;
  background: #f5b800;
  color: #ffffff;
}
</style>
