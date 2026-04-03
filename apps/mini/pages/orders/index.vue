<script setup lang="ts">
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const orders = ref<any[]>([]);
const activeStatus = ref("all");
const statusBarHeight = ref(20);

const mockOrders = [
  {
    id: "mock-1",
    orderNo: "BG2026040301",
    schoolName: "华南大学城",
    addressDetail: "6栋302室",
    contactName: "张同学",
    contactPhone: "138****8888",
    rentalStartDate: "2026-04-05",
    rentalEndDate: "2026-04-07",
    deliverySlotId: "slot-1",
    deliverySlotLabel: "下午配送 14:00-18:00",
    rentalDays: 3,
    rentSubtotal: 45,
    deposit: 50,
    discountAmount: 0,
    totalAmount: 95,
    paymentStatus: "pending",
    acceptStatus: "pending",
    deliveryStatus: "pending",
    items: [{ gameId: "g1", name: "阿瓦隆 · 经典聚会版", coverImage: "/static/banner-default.png", dailyPrice: 15, deposit: 50 }],
    createdAt: "2026-04-03T10:30:00.000Z",
    updatedAt: "2026-04-03T10:30:00.000Z",
  },
  {
    id: "mock-2",
    orderNo: "BG2026040202",
    schoolName: "华南大学城",
    addressDetail: "3栋105室",
    contactName: "李同学",
    contactPhone: "139****6666",
    rentalStartDate: "2026-04-03",
    rentalEndDate: "2026-04-05",
    deliverySlotId: "slot-2",
    deliverySlotLabel: "上午配送 09:00-12:00",
    rentalDays: 3,
    rentSubtotal: 54,
    deposit: 60,
    discountAmount: 5,
    totalAmount: 109,
    paymentStatus: "paid",
    acceptStatus: "pending",
    deliveryStatus: "pending",
    items: [{ gameId: "g2", name: "卡坦岛 · 策略烧脑版", coverImage: "/static/banner-default.png", dailyPrice: 18, deposit: 60 }],
    createdAt: "2026-04-02T14:20:00.000Z",
    updatedAt: "2026-04-02T15:00:00.000Z",
  },
  {
    id: "mock-3",
    orderNo: "BG2026033103",
    schoolName: "华南大学城",
    addressDetail: "8栋201室",
    contactName: "王同学",
    contactPhone: "137****5555",
    rentalStartDate: "2026-04-01",
    rentalEndDate: "2026-04-04",
    deliverySlotId: "slot-1",
    deliverySlotLabel: "下午配送 14:00-18:00",
    rentalDays: 4,
    rentSubtotal: 48,
    deposit: 40,
    discountAmount: 0,
    totalAmount: 88,
    paymentStatus: "paid",
    acceptStatus: "confirmed",
    deliveryStatus: "delivering",
    items: [{ gameId: "g3", name: "狼人杀 · 青春夜聊版", coverImage: "/static/banner-default.png", dailyPrice: 12, deposit: 40 }],
    createdAt: "2026-03-31T09:15:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "mock-4",
    orderNo: "BG2026032804",
    schoolName: "华南大学城",
    addressDetail: "2栋408室",
    contactName: "赵同学",
    contactPhone: "136****3333",
    rentalStartDate: "2026-03-28",
    rentalEndDate: "2026-03-30",
    deliverySlotId: "slot-2",
    deliverySlotLabel: "上午配送 09:00-12:00",
    rentalDays: 3,
    rentSubtotal: 84,
    deposit: 80,
    discountAmount: 10,
    totalAmount: 154,
    paymentStatus: "paid",
    acceptStatus: "confirmed",
    deliveryStatus: "delivered",
    items: [{ gameId: "g4", name: "火星开发 · 硬核策略版", coverImage: "/static/banner-default.png", dailyPrice: 28, deposit: 80 }],
    createdAt: "2026-03-28T08:00:00.000Z",
    updatedAt: "2026-03-30T18:00:00.000Z",
  },
  {
    id: "mock-5",
    orderNo: "BG2026032505",
    schoolName: "华南大学城",
    addressDetail: "5栋110室",
    contactName: "陈同学",
    contactPhone: "135****1111",
    rentalStartDate: "2026-03-20",
    rentalEndDate: "2026-03-22",
    deliverySlotId: "slot-1",
    deliverySlotLabel: "下午配送 14:00-18:00",
    rentalDays: 3,
    rentSubtotal: 33,
    deposit: 30,
    discountAmount: 0,
    totalAmount: 63,
    paymentStatus: "paid",
    acceptStatus: "confirmed",
    deliveryStatus: "returned",
    items: [{ gameId: "g5", name: "璀璨宝石 · 双人轻策版", coverImage: "/static/banner-default.png", dailyPrice: 11, deposit: 30 }],
    createdAt: "2026-03-19T16:45:00.000Z",
    updatedAt: "2026-03-22T20:00:00.000Z",
  },
];

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
    "待付款": "#e6a23c",
    "待确认": "#409eff",
    "使用中": "#159d8a",
    "待结算": "#e6a23c",
    "已完成": "#909399",
    "已取消": "#909399",
    "支付失败": "#f56c6c",
    "已拒绝": "#f56c6c",
  };
  return map[status] || "#909399";
}

const filteredOrders = computed(() => {
  if (activeStatus.value === "all") return orders.value;
  return orders.value.filter(
    (o) => getOrderDisplayStatus(o) === activeStatus.value
  );
});

const orderCount = computed(() => orders.value.length);

const totalSpent = computed(() =>
  orders.value
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0)
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

function goDetail(id: string) {
  // 可扩展跳转订单详情页
}

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
        // 模拟取消（通过 mock pay cancel）
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
    orders.value = result.length ? result : mockOrders;
  } catch {
    orders.value = mockOrders;
  }
}

onShow(async () => {
  getStatusBarHeight();
  await sessionStore.ensureUserSession();
  await refreshOrders();
});
</script>

<template>
  <view class="orders-page">
    <!-- 自定义顶部栏 -->
    <view class="top-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="page-header">
        <text class="page-title">我的订单</text>
        <view class="title-decoration"></view>
      </view>
    </view>

    <view class="orders-body">
    <!-- 订单信息摘要 -->
    <view class="summary-card">
      <text class="summary-label">订单信息</text>
      <view class="summary-row">
        <text class="summary-item">订单总数：<text class="summary-val">{{ orderCount }}</text></text>
        <text class="summary-item">总消费：<text class="summary-val price">¥{{ totalSpent.toFixed(2) }}</text></text>
      </view>
    </view>

    <!-- 状态选项卡 -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        :class="['tab-item', { active: activeStatus === tab.key }]"
        @click="activeStatus = tab.key"
      >
        <text class="tab-count">{{ statusCount(tab.key) }}</text>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view v-if="!filteredOrders.length" class="empty-card">
      <text class="empty-text">暂无相关订单</text>
    </view>

    <view
      v-for="order in filteredOrders"
      :key="order.id"
      class="order-card"
    >
      <!-- 卡片头：类型标签 + 时间 + 状态 -->
      <view class="card-header">
        <view class="type-tag">租赁</view>
        <text class="order-time">下单时间：{{ formatTime(order.createdAt) }}</text>
        <text
          class="status-badge"
          :style="{ color: getStatusColor(getOrderDisplayStatus(order)) }"
        >
          {{ getOrderDisplayStatus(order) }}
        </text>
      </view>

      <!-- 商品信息 -->
      <view class="product-row" v-for="item in order.items" :key="item.gameId">
        <image :src="item.coverImage" class="product-img" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text class="product-sub">{{ order.rentalStartDate }} 至 {{ order.rentalEndDate }} · {{ order.rentalDays }}天</text>
        </view>
        <view class="product-price-col">
          <text class="product-price">¥{{ item.dailyPrice.toFixed(2) }}/天</text>
          <text class="product-qty">×{{ order.rentalDays }}</text>
        </view>
      </view>

      <!-- 费用汇总 -->
      <view class="cost-row">
        <text class="cost-label" v-if="order.deposit">押金 ¥{{ order.deposit.toFixed(2) }}</text>
        <text class="cost-total">合计 <text class="cost-amount">¥{{ order.totalAmount.toFixed(2) }}</text></text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-row">
        <view
          v-if="getOrderDisplayStatus(order) === '待付款'"
          class="action-btn outline"
          @click="handleCancel(order)"
        >
          取消订单
        </view>
        <view
          v-if="getOrderDisplayStatus(order) === '待付款'"
          class="action-btn primary"
          @click="handlePay(order)"
        >
          立即付款
        </view>
        <view class="action-btn outline" @click="goDetail(order.id)">
          查看详情
        </view>
      </view>
    </view>
    </view>
  </view>
</template>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f5f6f8;
}

/* ── 顶部标题栏 ── */
.top-section {
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.18), transparent 22%),
    linear-gradient(to top right, #4a90e2 0%, #4a90e2 56%, #26a69a 100%);
  padding-bottom: 60rpx;
  padding-left: 40rpx;
  padding-right: 40rpx;
  border-radius: 0 0 40rpx 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(38, 166, 154, 0.18);
}

.page-header {
  margin-top: 20rpx;
  position: relative;
  display: inline-block;
}

.page-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #ffffff;
  display: inline-block;
  position: relative;
  z-index: 2;
}

.title-decoration {
  position: absolute;
  left: 24rpx;
  right: -24rpx;
  bottom: -1rpx;
  height: 26rpx;
  background: rgba(255, 255, 255, 0.38);
  border-radius: 8rpx;
  z-index: 1;
}

.orders-body {
  padding: 0 24rpx 120rpx;
  margin-top: -30rpx;
  position: relative;
  z-index: 10;
}

/* ── 摘要卡片 ── */
.summary-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.summary-label {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e1e1e;
  display: block;
  margin-bottom: 16rpx;
}

.summary-row {
  display: flex;
  gap: 40rpx;
}

.summary-item {
  font-size: 24rpx;
  color: #666;
}

.summary-val {
  font-weight: 700;
  color: #333;
}

.summary-val.price {
  color: #e6a23c;
}

/* ── 状态选项卡 ── */
.status-tabs {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx 10rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  position: relative;
}

.tab-item.active .tab-label {
  color: #159d8a;
  font-weight: 700;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 36rpx;
  height: 4rpx;
  border-radius: 2rpx;
  background: #159d8a;
}

.tab-count {
  font-size: 34rpx;
  font-weight: 800;
  color: #1e1e1e;
}

.tab-label {
  font-size: 22rpx;
  color: #999;
}

/* ── 空状态 ── */
.empty-card {
  margin-top: 80rpx;
  text-align: center;
}

.empty-text {
  color: #bbb;
  font-size: 28rpx;
}

/* ── 订单卡片 ── */
.order-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 22rpx 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
  gap: 12rpx;
}

.type-tag {
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  background: #159d8a;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.order-time {
  flex: 1;
  font-size: 22rpx;
  color: #999;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── 商品行 ── */
.product-row {
  display: flex;
  padding: 24rpx 28rpx;
  gap: 20rpx;
  align-items: center;
}

.product-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 14rpx;
  flex-shrink: 0;
  background: #f8f8f8;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
}

.product-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e1e1e;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-sub {
  font-size: 22rpx;
  color: #999;
}

.product-price-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
  flex-shrink: 0;
}

.product-price {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.product-qty {
  font-size: 22rpx;
  color: #999;
}

/* ── 费用汇总 ── */
.cost-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24rpx;
  padding: 16rpx 28rpx;
  border-top: 1rpx dashed #eee;
}

.cost-label {
  font-size: 22rpx;
  color: #999;
}

.cost-total {
  font-size: 24rpx;
  color: #666;
}

.cost-amount {
  font-size: 32rpx;
  font-weight: 800;
  color: #e6a23c;
}

/* ── 操作按钮 ── */
.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 28rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.action-btn.outline {
  border: 2rpx solid #ddd;
  color: #666;
  background: #fff;
}

.action-btn.primary {
  border: 2rpx solid #159d8a;
  background: #159d8a;
  color: #fff;
}
</style>

