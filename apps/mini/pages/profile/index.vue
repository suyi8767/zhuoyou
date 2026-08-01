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
  { key: "待付款", label: "待付款", icon: "wallet", badge: "minus" },
  { key: "待确认", label: "待确认", icon: "clipboard", badge: "" },
  { key: "使用中", label: "使用中", icon: "dice", badge: "" },
  { key: "待结算", label: "待结算", icon: "bill", badge: "yen" },
  { key: "已完成", label: "已完成", icon: "box", badge: "check" },
];

const menuGroups = [
  {
    items: [
      { label: "我的订单", action: "orders", icon: "orders" },
      { label: "收货地址", action: "address", icon: "pin" },
      { label: "优惠券", action: "coupon", icon: "ticket" },
    ],
  },
  {
    items: [
      { label: "联系客服", action: "service", icon: "headset" },
      { label: "关于我们", action: "about", icon: "info" },
      { label: "管理员入口", action: "admin", icon: "shield" },
    ],
  },
];

function goOrders() {
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
  <view class="page">
    <view class="page-pad" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="brand">
        <text class="brand-title">个人中心</text>
        <text class="brand-subtitle">管理订单、地址与优惠</text>
      </view>

      <view class="user-row">
        <image
          :src="sessionStore.user?.avatar || '/static/banner-default.png'"
          class="avatar"
          mode="aspectFill"
        />
        <view class="user-info">
          <text class="user-name">
            {{ sessionStore.user?.nickname || "青春玩家" }}
          </text>
          <text class="user-desc">宿舍开黑 · 社团聚会 · 周末桌游</text>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">我的订单</text>
          <text class="section-more" @click="goOrders()">全部订单 ›</text>
        </view>
        <view class="shortcut-row">
          <view
            v-for="s in orderShortcuts"
            :key="s.key"
            class="shortcut"
            @click="goOrders()"
          >
            <view class="ico-wrap">
              <!-- wallet -->
              <view v-if="s.icon === 'wallet'" class="ico ico-wallet">
                <view class="wallet-body"></view>
                <view class="wallet-flap"></view>
              </view>
              <!-- clipboard -->
              <view v-else-if="s.icon === 'clipboard'" class="ico ico-clip">
                <view class="clip-board"></view>
                <view class="clip-top"></view>
                <view class="clip-line l1"></view>
                <view class="clip-line l2"></view>
              </view>
              <!-- dice -->
              <view v-else-if="s.icon === 'dice'" class="ico ico-dice">
                <view class="dice-box">
                  <view class="dot d1"></view>
                  <view class="dot d2"></view>
                  <view class="dot d3"></view>
                </view>
              </view>
              <!-- bill -->
              <view v-else-if="s.icon === 'bill'" class="ico ico-bill">
                <view class="bill-sheet"></view>
                <view class="bill-line l1"></view>
                <view class="bill-line l2"></view>
              </view>
              <!-- box -->
              <view v-else class="ico ico-box">
                <view class="box-lid"></view>
                <view class="box-body"></view>
              </view>

              <view v-if="s.badge === 'minus'" class="badge">
                <view class="badge-minus"></view>
              </view>
              <view v-else-if="s.badge === 'yen'" class="badge">
                <text class="badge-yen">¥</text>
              </view>
              <view v-else-if="s.badge === 'check'" class="badge">
                <view class="badge-check"></view>
              </view>
            </view>
            <text class="shortcut-label">{{ s.label }}</text>
          </view>
        </view>
      </view>

      <view v-for="(group, gi) in menuGroups" :key="gi" class="menu-group">
        <view
          v-for="(item, ii) in group.items"
          :key="ii"
          class="menu-item"
          @click="handleMenu(item.action)"
        >
          <view class="menu-ico">
            <view v-if="item.icon === 'orders'" class="mico m-orders">
              <view class="m-sheet"></view>
              <view class="m-clip"></view>
            </view>
            <view v-else-if="item.icon === 'pin'" class="mico m-pin">
              <view class="pin-head"></view>
              <view class="pin-point"></view>
            </view>
            <view v-else-if="item.icon === 'ticket'" class="mico m-ticket">
              <view class="ticket-body"></view>
            </view>
            <view v-else-if="item.icon === 'headset'" class="mico m-headset">
              <view class="hs-band"></view>
              <view class="hs-ear left"></view>
              <view class="hs-ear right"></view>
            </view>
            <view v-else-if="item.icon === 'info'" class="mico m-info">
              <view class="info-ring"></view>
              <view class="info-dot"></view>
              <view class="info-stem"></view>
            </view>
            <view v-else class="mico m-shield">
              <view class="shield-body"></view>
            </view>
          </view>
          <text class="menu-label">{{ item.label }}</text>
          <text class="menu-arrow">›</text>
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

.user-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 36rpx;
}

.avatar {
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  background: #e5e7eb;
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
  color: #111827;
}

.user-desc {
  font-size: 24rpx;
  color: #9ca3af;
}

.section {
  margin-bottom: 12rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.section-more {
  font-size: 24rpx;
  color: #9ca3af;
}

.shortcut-row {
  display: flex;
  justify-content: space-between;
  padding: 0 4rpx 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.shortcut {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
}

.ico-wrap {
  position: relative;
  width: 56rpx;
  height: 56rpx;
}

.ico {
  width: 56rpx;
  height: 56rpx;
  position: relative;
}

/* wallet */
.wallet-body {
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  top: 14rpx;
  bottom: 8rpx;
  border: 3rpx solid #374151;
  border-radius: 8rpx;
}
.wallet-flap {
  position: absolute;
  right: 10rpx;
  top: 24rpx;
  width: 14rpx;
  height: 14rpx;
  border: 3rpx solid #374151;
  border-radius: 50%;
}

/* clipboard */
.clip-board {
  position: absolute;
  left: 10rpx;
  right: 10rpx;
  top: 12rpx;
  bottom: 6rpx;
  border: 3rpx solid #374151;
  border-radius: 8rpx;
}
.clip-top {
  position: absolute;
  left: 18rpx;
  right: 18rpx;
  top: 6rpx;
  height: 12rpx;
  border: 3rpx solid #374151;
  border-radius: 6rpx;
  background: #fff;
  z-index: 1;
}
.clip-line {
  position: absolute;
  left: 18rpx;
  right: 18rpx;
  height: 3rpx;
  background: #374151;
  border-radius: 2rpx;
}
.clip-line.l1 {
  top: 28rpx;
}
.clip-line.l2 {
  top: 38rpx;
}

/* dice */
.dice-box {
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  top: 8rpx;
  bottom: 8rpx;
  border: 3rpx solid #374151;
  border-radius: 10rpx;
}
.dot {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #f5b800;
}
.dot.d1 {
  left: 8rpx;
  top: 8rpx;
}
.dot.d2 {
  right: 8rpx;
  top: 50%;
  margin-top: -4rpx;
}
.dot.d3 {
  left: 8rpx;
  bottom: 8rpx;
}

/* bill */
.bill-sheet {
  position: absolute;
  left: 10rpx;
  right: 10rpx;
  top: 8rpx;
  bottom: 8rpx;
  border: 3rpx solid #374151;
  border-radius: 6rpx;
}
.bill-line {
  position: absolute;
  left: 18rpx;
  right: 18rpx;
  height: 3rpx;
  background: #374151;
}
.bill-line.l1 {
  top: 22rpx;
}
.bill-line.l2 {
  top: 32rpx;
}

/* box */
.box-lid {
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  top: 10rpx;
  height: 14rpx;
  border: 3rpx solid #374151;
  border-radius: 4rpx 4rpx 0 0;
}
.box-body {
  position: absolute;
  left: 10rpx;
  right: 10rpx;
  top: 22rpx;
  bottom: 8rpx;
  border: 3rpx solid #374151;
  border-top: none;
  border-radius: 0 0 6rpx 6rpx;
}

.badge {
  position: absolute;
  right: -8rpx;
  top: -6rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #f5b800;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.badge-minus {
  width: 12rpx;
  height: 3rpx;
  background: #fff;
  border-radius: 2rpx;
}

.badge-yen {
  font-size: 16rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.badge-check {
  width: 10rpx;
  height: 6rpx;
  border-left: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  transform: rotate(-45deg) translate(1rpx, -1rpx);
}

.shortcut-label {
  font-size: 22rpx;
  color: #6b7280;
}

.menu-group {
  margin-top: 8rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-group:last-child {
  border-bottom: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.menu-group .menu-item:last-child {
  border-bottom: none;
}

.menu-ico {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
  position: relative;
}

.mico {
  width: 40rpx;
  height: 40rpx;
  position: relative;
}

.m-sheet {
  position: absolute;
  left: 8rpx;
  right: 6rpx;
  top: 8rpx;
  bottom: 4rpx;
  border: 2.5rpx solid #4b5563;
  border-radius: 6rpx;
}
.m-clip {
  position: absolute;
  left: 14rpx;
  right: 12rpx;
  top: 4rpx;
  height: 10rpx;
  border: 2.5rpx solid #4b5563;
  border-radius: 4rpx;
  background: #fff;
}

.pin-head {
  position: absolute;
  left: 10rpx;
  top: 4rpx;
  width: 20rpx;
  height: 20rpx;
  border: 2.5rpx solid #4b5563;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}
.pin-point {
  position: absolute;
  left: 17rpx;
  top: 10rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: #4b5563;
}

.ticket-body {
  position: absolute;
  left: 4rpx;
  right: 4rpx;
  top: 10rpx;
  bottom: 10rpx;
  border: 2.5rpx solid #4b5563;
  border-radius: 6rpx;
  background:
    radial-gradient(circle at left center, #fff 4rpx, transparent 4.5rpx),
    radial-gradient(circle at right center, #fff 4rpx, transparent 4.5rpx);
}

.hs-band {
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  top: 6rpx;
  height: 16rpx;
  border: 2.5rpx solid #4b5563;
  border-bottom: none;
  border-radius: 20rpx 20rpx 0 0;
}
.hs-ear {
  position: absolute;
  top: 18rpx;
  width: 10rpx;
  height: 14rpx;
  border: 2.5rpx solid #4b5563;
  border-radius: 4rpx;
  background: #fff;
}
.hs-ear.left {
  left: 6rpx;
}
.hs-ear.right {
  right: 6rpx;
}

.info-ring {
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  top: 4rpx;
  bottom: 4rpx;
  border: 2.5rpx solid #4b5563;
  border-radius: 50%;
}
.info-dot {
  position: absolute;
  left: 18rpx;
  top: 12rpx;
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: #4b5563;
}
.info-stem {
  position: absolute;
  left: 18rpx;
  top: 18rpx;
  width: 4rpx;
  height: 12rpx;
  background: #4b5563;
  border-radius: 2rpx;
}

.shield-body {
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  top: 4rpx;
  bottom: 6rpx;
  border: 2.5rpx solid #4b5563;
  border-radius: 6rpx 6rpx 12rpx 12rpx;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #111827;
  font-weight: 500;
}

.menu-arrow {
  font-size: 32rpx;
  color: #d1d5db;
  flex-shrink: 0;
}
</style>
