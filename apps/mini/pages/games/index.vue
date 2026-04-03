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
  background: #f5faf9;
  overflow: hidden;
}

/* ── 顶部标题栏 ── */
.top-section {
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.18), transparent 22%),
    linear-gradient(to top right, #4a90e2 0%, #4a90e2 56%, #26a69a 100%);
  padding-bottom: 60rpx;
  padding-left: 40rpx;
  padding-right: 40rpx;
  flex-shrink: 0;
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

.layout {
  display: flex;
  flex: 1;
  background: #f5faf9;
  overflow: hidden;
  min-height: 0;
  margin-top: -30rpx;
  border-radius: 30rpx 30rpx 0 0;
  position: relative;
  z-index: 10;
}

/* ── 左侧分类栏 ── */
.sidebar {
  width: 180rpx;
  height: 100%;
  background: #eef6f4;
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
  border-left-color: #159d8a;
}

.sidebar-text {
  font-size: 26rpx;
  color: #7a9e9a;
  line-height: 1.4;
}

.sidebar-item.active .sidebar-text {
  color: #159d8a;
  font-weight: 700;
}

/* ── 右侧内容区 ── */
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
  color: #2a4a47;
}

.content-count {
  font-size: 22rpx;
  color: #9bbab6;
}

/* ── 游戏卡片 ── */
.game-card {
  display: flex;
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 18rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-cover {
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
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
  color: #1e3a37;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags,
.card-meta {
  font-size: 22rpx;
  color: #9bbab6;
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
  color: #159d8a;
}

.card-unit {
  font-size: 22rpx;
  font-weight: 400;
}

.card-stock {
  font-size: 22rpx;
  color: #b0c8c5;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: #b0c8c5;
  font-size: 28rpx;
}
</style>
