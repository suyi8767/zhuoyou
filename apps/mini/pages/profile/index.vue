<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const statusBarHeight = ref(20);

function getStatusBarHeight() {
  try {
    const info = uni.getSystemInfoSync();
    statusBarHeight.value = info.statusBarHeight || 20;
  } catch {
    statusBarHeight.value = 20;
  }
}

const orderShortcuts = [
  { key: "待付款", icon: "💰", label: "待付款" },
  { key: "待确认", icon: "📋", label: "待确认" },
  { key: "使用中", icon: "🎲", label: "使用中" },
  { key: "待结算", icon: "📦", label: "待结算" },
  { key: "已完成", icon: "✅", label: "已完成" },
];

const menuGroups = [
  {
    items: [
      { label: "我的订单", desc: "查看全部租赁记录", action: "orders" },
      { label: "收货地址", desc: "管理配送地址", action: "address" },
      { label: "优惠券", desc: "查看可用优惠", action: "coupon" },
    ],
  },
  {
    items: [
      { label: "联系客服", desc: "在线咨询", action: "service" },
      { label: "关于我们", desc: "了解云小夏", action: "about" },
      { label: "管理员入口", desc: "使用管理账号登录", action: "admin" },
    ],
  },
];

function goOrders(status?: string) {
  uni.switchTab({ url: "/pages/orders/index" });
}

function handleMenu(action: string) {
  switch (action) {
    case "orders":
      uni.switchTab({ url: "/pages/orders/index" });
      break;
    case "address":
      uni.navigateTo({ url: "/pages/address/index" });
      break;
    case "coupon":
      uni.navigateTo({ url: "/pages/coupons/index" });
      break;
    case "service":
      uni.navigateTo({ url: "/pages/service/index" });
      break;
    case "about":
      uni.navigateTo({ url: "/pages/about/index" });
      break;
    case "admin":
      uni.navigateTo({ url: "/pages/admin-login/index" });
      break;
  }
}

onShow(async () => {
  getStatusBarHeight();
  await sessionStore.ensureUserSession();
});
</script>

<template>
  <view class="profile-page">
    <!-- 顶部蓝色区域 + 用户信息 -->
    <view class="top-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="page-header">
        <text class="page-title">个人中心</text>
        <view class="title-decoration"></view>
      </view>

      <!-- 用户卡片嵌入蓝色区域底部 -->
      <view class="user-card">
        <image
          :src="sessionStore.user?.avatar || '/static/banner-default.png'"
          class="avatar"
          mode="aspectFill"
        />
        <view class="user-info">
          <text class="user-name">{{ sessionStore.user?.nickname || "青春玩家" }}</text>
          <text class="user-desc">宿舍开黑 · 社团聚会 · 周末桌游局</text>
        </view>
      </view>
    </view>

    <view class="body">
      <!-- 订单快捷入口 -->
      <view class="section-card order-shortcuts">
        <view class="shortcuts-header">
          <text class="shortcuts-title">我的订单</text>
          <view class="shortcuts-link" @click="goOrders()">
            <text class="link-text">全部订单</text>
            <text class="link-arrow">›</text>
          </view>
        </view>
        <view class="shortcuts-row">
          <view
            v-for="s in orderShortcuts"
            :key="s.key"
            class="shortcut-item"
            @click="goOrders(s.key)"
          >
            <text class="shortcut-icon">{{ s.icon }}</text>
            <text class="shortcut-label">{{ s.label }}</text>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view
        v-for="(group, gi) in menuGroups"
        :key="gi"
        class="section-card menu-card"
      >
        <view
          v-for="(item, ii) in group.items"
          :key="ii"
          class="menu-item"
          @click="handleMenu(item.action)"
        >
          <view class="menu-left">
            <text class="menu-label">{{ item.label }}</text>
            <text class="menu-desc">{{ item.desc }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f6f8;
}

/* ── 顶部蓝色区域 ── */
.top-section {
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.18), transparent 22%),
    linear-gradient(to top right, #4a90e2 0%, #4a90e2 56%, #26a69a 100%);
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 40rpx;
  border-radius: 0 0 40rpx 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(38, 166, 154, 0.18);
}

.page-header {
  margin-top: 20rpx;
  position: relative;
  display: inline-block;
  margin-bottom: 36rpx;
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

/* ── 用户卡片 ── */
.user-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  backdrop-filter: blur(10px);
}

.avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
}

.user-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #ffffff;
}

.user-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* ── 内容区 ── */
.body {
  padding: 0 24rpx 120rpx;
  margin-top: -10rpx;
  position: relative;
  z-index: 10;
}

.section-card {
  background: #ffffff;
  border-radius: 20rpx;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* ── 订单快捷入口 ── */
.order-shortcuts {
  padding: 28rpx 28rpx 20rpx;
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.shortcuts-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e1e1e;
}

.shortcuts-link {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.link-text {
  font-size: 24rpx;
  color: #999;
}

.link-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.shortcuts-row {
  display: flex;
  justify-content: space-around;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 0;
}

.shortcut-icon {
  font-size: 42rpx;
  line-height: 1;
}

.shortcut-label {
  font-size: 22rpx;
  color: #666;
}

/* ── 功能菜单 ── */
.menu-card {
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.menu-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e1e1e;
}

.menu-desc {
  font-size: 22rpx;
  color: #999;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
  flex-shrink: 0;
}
</style>
