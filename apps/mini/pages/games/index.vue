<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const categories = ref<any[]>([]);
const games = ref<any[]>([]);
const activeCategoryId = ref("");
const statusBarHeight = ref(20);
const categoryChangeHandler = (id: string) => {
  selectCategory(id);
};

function getStatusBarHeight() {
  try {
    const info = uni.getSystemInfoSync();
    statusBarHeight.value = info.statusBarHeight || 20;
  } catch {
    statusBarHeight.value = 20;
  }
}

async function loadCategories() {
  const home = await request<any>("/app/home");
  categories.value = home.categories || [];
  if (!activeCategoryId.value) {
    activeCategoryId.value = categories.value[0]?.id || "";
  }
}

async function loadGames() {
  const query = activeCategoryId.value ? `?categoryId=${activeCategoryId.value}` : "";
  games.value = await request(`/app/games${query}`);
}

function selectCategory(id: string) {
  activeCategoryId.value = id;
  loadGames();
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/game-detail/index?id=${id}` });
}

onLoad(async (query) => {
  getStatusBarHeight();
  uni.$off("change-category", categoryChangeHandler);
  uni.$on("change-category", categoryChangeHandler);
  await sessionStore.ensureUserSession();
  activeCategoryId.value = String(query?.categoryId || "");
  await loadCategories();
  await loadGames();
});

onMounted(async () => {
  if (!categories.value.length) {
    await loadCategories();
    await loadGames();
  }
});

onUnload(() => {
  uni.$off("change-category", categoryChangeHandler);
});
</script>

<template>
  <view class="page-wrapper">
    <!-- 自定义顶部栏 -->
    <view class="top-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="page-header">
        <text class="page-title">桌游菜单</text>
        <view class="title-decoration"></view>
      </view>
    </view>

    <!-- 左右双栏 -->
    <view class="layout">
    <!-- 左侧分类栏 -->
    <scroll-view class="sidebar" scroll-y>
      <view
        v-for="category in categories"
        :key="category.id"
        :class="['sidebar-item', { active: activeCategoryId === category.id }]"
        @click="selectCategory(category.id)"
      >
        <text class="sidebar-text">{{ category.name }}</text>
      </view>
    </scroll-view>

    <!-- 右侧商品列表 -->
    <scroll-view class="content" scroll-y>
      <view class="content-header">
        <text class="content-category-name">
          {{ categories.find(c => c.id === activeCategoryId)?.name || '全部' }}
        </text>
        <text class="content-count">共 {{ games.length }} 款</text>
      </view>

      <view
        v-for="game in games"
        :key="game.id"
        class="game-card"
        @click="goDetail(game.id)"
      >
        <image :src="game.coverImage" class="card-cover" mode="aspectFill" />
        <view class="card-body">
          <text class="card-title">{{ game.name }}</text>
          <text class="card-tags">{{ game.tags.join(' · ') }}</text>
          <text class="card-meta">{{ game.players }} · {{ game.duration }}</text>
          <view class="card-footer">
            <text class="card-price">¥{{ game.dailyPrice }}<text class="card-unit">/天</text></text>
            <text class="card-stock">库存 {{ game.stock }}</text>
          </view>
        </view>
      </view>

      <view v-if="games.length === 0" class="empty-tip">
        <text>暂无桌游</text>
      </view>
    </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f9fc;
  overflow: hidden;
}

.top-section {
  background: linear-gradient(180deg, #eef5ff 0%, #f7f9fc 100%);
  padding-bottom: 36rpx;
  padding-left: 40rpx;
  padding-right: 40rpx;
  flex-shrink: 0;
}

.page-header {
  margin-top: 20rpx;
  position: relative;
  display: inline-block;
}

.page-title {
  font-size: 44rpx;
  font-weight: 800;
  color: #111827;
  display: inline-block;
  position: relative;
  z-index: 2;
}

.title-decoration {
  position: absolute;
  left: 8rpx;
  right: -8rpx;
  bottom: 2rpx;
  height: 14rpx;
  background: rgba(59, 130, 246, 0.18);
  border-radius: 8rpx;
  z-index: 1;
}

.layout {
  display: flex;
  flex: 1;
  background: #ffffff;
  overflow: hidden;
  min-height: 0;
  border-radius: 28rpx 28rpx 0 0;
  position: relative;
  z-index: 10;
  box-shadow: 0 -8rpx 28rpx rgba(148, 163, 184, 0.08);
}

.sidebar {
  width: 180rpx;
  height: 100%;
  background: #f8fafc;
  flex-shrink: 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36rpx 12rpx;
  text-align: center;
  border-left: 6rpx solid transparent;
  position: relative;
}

.sidebar-item.active {
  background: #ffffff;
  border-left-color: #3b82f6;
}

.sidebar-text {
  font-size: 26rpx;
  color: #9ca3af;
  line-height: 1.4;
}

.sidebar-item.active .sidebar-text {
  color: #3b82f6;
  font-weight: 700;
}

.content {
  flex: 1;
  height: 100%;
  padding: 0 20rpx 120rpx;
  box-sizing: border-box;
}

.content-header {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  padding: 24rpx 4rpx 16rpx;
}

.content-category-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #111827;
}

.content-count {
  font-size: 22rpx;
  color: #9ca3af;
}

.game-card {
  display: flex;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 18rpx;
  border: 2rpx solid #eef2f7;
  box-shadow: 0 8rpx 22rpx rgba(148, 163, 184, 0.08);
}

.card-cover {
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
  background: #f8fafc;
}

.card-body {
  flex: 1;
  padding: 18rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.card-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags,
.card-meta {
  font-size: 22rpx;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-price {
  font-size: 32rpx;
  font-weight: 800;
  color: #3b82f6;
}

.card-unit {
  font-size: 22rpx;
  font-weight: 400;
}

.card-stock {
  font-size: 22rpx;
  color: #cbd5e1;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #9ca3af;
  font-size: 28rpx;
}
</style>
