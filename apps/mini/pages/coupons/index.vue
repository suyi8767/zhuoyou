<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { request } from "../../api";

interface Coupon {
  id: string;
  name: string;
  code: string;
  amount: number;
  minAmount: number;
  enabled: boolean;
}

const coupons = ref<Coupon[]>([]);
const loading = ref(true);

const mockCoupons: Coupon[] = [
  { id: "c1", name: "新人专享券", code: "NEW10", amount: 10, minAmount: 50, enabled: true },
  { id: "c2", name: "周末特惠券", code: "WKND5", amount: 5, minAmount: 30, enabled: true },
  { id: "c3", name: "老用户回馈券", code: "OLD15", amount: 15, minAmount: 80, enabled: true },
];

async function loadCoupons() {
  loading.value = true;
  try {
    const result = await request<Coupon[]>("/app/coupons");
    coupons.value = result.length ? result : mockCoupons;
  } catch {
    coupons.value = mockCoupons;
  }
  loading.value = false;
}

function copyCoupon(code: string) {
  uni.setClipboardData({
    data: code,
    success() {
      uni.showToast({ title: "已复制优惠码", icon: "success" });
    },
  });
}

function goUse() {
  uni.switchTab({ url: "/pages/games/index" });
}

onShow(() => {
  loadCoupons();
});
</script>

<template>
  <view class="page">
    <view v-if="!loading && !coupons.length" class="empty">
      <text class="empty-text">暂无可用优惠券</text>
    </view>

    <view v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
      <view class="coupon-left">
        <text class="coupon-amount">
          <text class="coupon-symbol">¥</text>{{ coupon.amount }}
        </text>
        <text class="coupon-min">满{{ coupon.minAmount }}元可用</text>
      </view>
      <view class="coupon-divider">
        <view class="notch top"></view>
        <view class="dash-line"></view>
        <view class="notch bottom"></view>
      </view>
      <view class="coupon-right">
        <text class="coupon-name">{{ coupon.name }}</text>
        <text class="coupon-code">优惠码：{{ coupon.code }}</text>
        <view class="coupon-btns">
          <view class="btn-copy" @click="copyCoupon(coupon.code)">复制</view>
          <view class="btn-use" @click="goUse">去使用</view>
        </view>
      </view>
    </view>

    <view class="tip-card">
      <text class="tip-title">使用说明</text>
      <text class="tip-text">1. 下单时在「优惠码」输入框填写优惠码即可抵扣</text>
      <text class="tip-text">2. 每张优惠券有最低消费门槛，未达门槛不可使用</text>
      <text class="tip-text">3. 每单仅限使用一张优惠券，不可叠加</text>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 20rpx 24rpx 120rpx;
}

.empty {
  text-align: center;
  padding: 120rpx 0;
}

.empty-text {
  color: #bbb;
  font-size: 28rpx;
}

/* ── 优惠券卡片 ── */
.coupon-card {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.coupon-left {
  width: 200rpx;
  background: linear-gradient(135deg, #159d8a, #26a69a);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 10rpx;
  flex-shrink: 0;
}

.coupon-amount {
  font-size: 56rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.coupon-symbol {
  font-size: 28rpx;
  font-weight: 600;
}

.coupon-min {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.coupon-divider {
  width: 2rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.notch {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #f5f6f8;
  z-index: 2;
}

.notch.top {
  top: -10rpx;
}

.notch.bottom {
  bottom: -10rpx;
}

.dash-line {
  width: 2rpx;
  height: 60%;
  border-left: 2rpx dashed #e0e0e0;
}

.coupon-right {
  flex: 1;
  padding: 24rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
}

.coupon-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e1e1e;
}

.coupon-code {
  font-size: 22rpx;
  color: #999;
}

.coupon-btns {
  display: flex;
  gap: 14rpx;
  margin-top: auto;
}

.btn-copy,
.btn-use {
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.btn-copy {
  border: 2rpx solid #ddd;
  color: #666;
  background: #fff;
}

.btn-use {
  background: #159d8a;
  color: #fff;
}

/* ── 使用说明 ── */
.tip-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-top: 10rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.tip-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e1e1e;
  display: block;
  margin-bottom: 16rpx;
}

.tip-text {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 2;
}
</style>
