<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { request } from "../../api";

const game = ref<any>(null);
const currentImage = ref(0);

const gallery = computed(() => {
  if (!game.value) return [];
  const list = Array.isArray(game.value.gallery)
    ? game.value.gallery.filter(Boolean)
    : [];
  if (list.length) return list;
  return game.value.coverImage ? [game.value.coverImage] : [];
});

const detailImages = computed(() => {
  // 图文详情：优先展示图集，避免与头图完全重复时可从第 1 张起全展示
  return gallery.value;
});

const statusText = computed(() => {
  if (!game.value) return "—";
  if (game.value.status === "published" && Number(game.value.stock) > 0) {
    return "可租赁";
  }
  if (game.value.status === "published") return "暂无库存";
  return "不可租赁";
});

const statusColor = computed(() => {
  return statusText.value === "可租赁" ? "#16a34a" : "#9ca3af";
});

onLoad(async (query) => {
  const id = String(query?.id || "");
  game.value = await request(`/app/games/${id}`);
});

function onSwiperChange(e: any) {
  currentImage.value = Number(e?.detail?.current || 0);
}

function goHome() {
  uni.switchTab({ url: "/pages/index/index" });
}

function goService() {
  uni.navigateTo({ url: "/pages/service/index" });
}

function bookNow() {
  if (!game.value?.id) return;
  uni.navigateTo({
    url: `/pages/order-create/index?gameId=${game.value.id}`,
  });
}
</script>

<template>
  <view v-if="game" class="page">
    <view class="gallery-wrap">
      <swiper
        class="gallery"
        circular
        :autoplay="gallery.length > 1"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(image, index) in gallery" :key="index">
          <image :src="image" class="gallery-img" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view v-if="gallery.length" class="gallery-badge">
        {{ currentImage + 1 }}/{{ gallery.length }}
      </view>
    </view>

    <view class="info">
      <view class="price-row">
        <text class="price">¥{{ game.dailyPrice }}/天</text>
        <text class="deposit-tag">押金 ¥{{ game.deposit }}</text>
      </view>
      <text class="name">{{ game.name }}</text>
      <view class="meta-row">
        <text class="cat-tag">{{ game.categoryName || "桌游" }}</text>
        <text class="stock">库存 {{ game.stock ?? 0 }} 套</text>
      </view>
    </view>

    <view class="attrs">
      <view class="attr-row">
        <text class="attr-label">适合人数</text>
        <text class="attr-value">{{ game.players || "—" }}</text>
      </view>
      <view class="attr-row">
        <text class="attr-label">游戏时长</text>
        <text class="attr-value">{{ game.duration || "—" }}</text>
      </view>
      <view class="attr-row">
        <text class="attr-label">押金</text>
        <text class="attr-value">¥{{ game.deposit }}</text>
      </view>
      <view class="attr-row">
        <text class="attr-label">状态</text>
        <text class="attr-value" :style="{ color: statusColor }">
          {{ statusText }}
        </text>
      </view>
    </view>

    <view class="service-row">
      <text class="service-label">服务</text>
      <text class="service-value">信用免押 · 极速配送 · 售后无忧 · 校园可达</text>
    </view>

    <view class="section">
      <view class="section-head">
        <view class="section-line"></view>
        <text class="section-title">游戏介绍</text>
        <view class="section-line"></view>
      </view>
      <text class="intro-text">
        {{
          game.description?.trim() ||
          `${game.name}适合${game.players || "多人"}游玩，时长约${game.duration || "视场次而定"}。支持校园配送与押金租赁，开黑聚会都能轻松上手。`
        }}
      </text>
    </view>

    <view class="section">
      <view class="section-head">
        <view class="section-line"></view>
        <text class="section-title">图文详情</text>
        <view class="section-line"></view>
      </view>
      <view v-if="!detailImages.length" class="empty-detail">暂无图文详情</view>
      <image
        v-for="(img, idx) in detailImages"
        :key="idx"
        :src="img"
        class="detail-img"
        mode="widthFix"
      />
    </view>

    <view class="bottom-bar">
      <view class="side-actions">
        <view class="side-item" @click="goHome">
          <image
            class="ico-home-img"
            src="/static/tabbar/home.png"
            mode="aspectFit"
          />
          <text class="side-label">首页</text>
        </view>
        <view class="side-item" @click="goService">
          <view class="ico-service"></view>
          <text class="side-label">客服</text>
        </view>
      </view>
      <view class="book-btn" @click="bookNow">立即预约</view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 150rpx;
}

.gallery-wrap {
  position: relative;
  background: #f3f4f6;
}

.gallery {
  height: 750rpx;
}

.gallery-img {
  width: 100%;
  height: 100%;
}

.gallery-badge {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(55, 65, 81, 0.72);
  color: #ffffff;
  font-size: 22rpx;
}

.info {
  padding: 28rpx 28rpx 8rpx;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.price {
  font-size: 44rpx;
  font-weight: 800;
  color: #ef4444;
  line-height: 1.1;
}

.deposit-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 22rpx;
}

.name {
  display: block;
  margin-top: 18rpx;
  font-size: 40rpx;
  font-weight: 800;
  color: #111827;
}

.meta-row {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cat-tag {
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  background: #eff6ff;
  color: #3b82f6;
  font-size: 22rpx;
}

.stock {
  color: #9ca3af;
  font-size: 24rpx;
}

.attrs {
  margin-top: 18rpx;
  border-top: 1rpx solid #f0f0f0;
}

.attr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.attr-label {
  color: #6b7280;
  font-size: 28rpx;
}

.attr-value {
  color: #111827;
  font-size: 28rpx;
  font-weight: 600;
}

.service-row {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 28rpx;
  border-bottom: 12rpx solid #f5f6f8;
}

.service-label {
  color: #6b7280;
  font-size: 28rpx;
  flex-shrink: 0;
}

.service-value {
  flex: 1;
  color: #111827;
  font-size: 26rpx;
  line-height: 1.5;
}

.section {
  padding: 36rpx 28rpx 12rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.section-line {
  width: 64rpx;
  height: 2rpx;
  background: #e5e7eb;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.intro-text {
  display: block;
  font-size: 26rpx;
  color: #4b5563;
  line-height: 1.8;
}

.empty-detail {
  text-align: center;
  color: #9ca3af;
  font-size: 26rpx;
  padding: 20rpx 0 40rpx;
}

.detail-img {
  width: 100%;
  display: block;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  z-index: 20;
}

.side-actions {
  display: flex;
  gap: 28rpx;
  padding: 0 8rpx;
}

.side-item {
  width: 72rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.ico-home-img {
  width: 44rpx;
  height: 44rpx;
  display: block;
}

.ico-service {
  width: 34rpx;
  height: 28rpx;
  border: 3rpx solid #6b7280;
  border-radius: 16rpx 16rpx 16rpx 4rpx;
  margin-top: 8rpx;
}

.side-label {
  font-size: 20rpx;
  color: #6b7280;
}

.book-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 999rpx;
  background: #ef4444;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
