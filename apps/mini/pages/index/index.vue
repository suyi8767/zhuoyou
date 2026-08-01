<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const statusBarHeight = ref(20);
const home = ref<any>({
  banners: [],
  categories: [],
  featuredGames: [],
  homeConfig: {},
});
const allGames = ref<any[]>([]);

const quickLinks = [
  { id: "party", name: "聚会必玩", keyword: "聚会" },
  { id: "fresh", name: "新手友好", keyword: "新手" },
  { id: "hot", name: "热门榜单", keyword: "热门" },
  { id: "new", name: "近期上新", keyword: "新" },
];

const brandTitle = computed(
  () => home.value.homeConfig?.title || "云小夏桌游租赁",
);

const brandSubtitle = computed(
  () => home.value.homeConfig?.subtitle || "好玩的桌游，轻松租回家",
);

const bannerList = computed(() => {
  const banners = (home.value.banners || []).filter(
    (item: any) => item.enabled !== false,
  );
  if (banners.length) {
    return banners;
  }
  return [
    {
      id: "default-banner",
      title: "热卖新手友好局",
      subtitle: "从卡坦岛到璀璨宝石，轻松上手",
      image: "/static/banner-default.png",
    },
  ];
});

const popularGames = computed(() => {
  const featured = home.value.featuredGames || [];
  const source = featured.length ? featured : allGames.value;
  return source.slice(0, 4);
});

const newGames = computed(() => allGames.value.slice(0, 6));

function rankClass(index: number) {
  if (index === 0) return "gold";
  if (index === 1) return "silver";
  if (index === 2) return "bronze";
  return "normal";
}

function categoryName(categoryId?: string) {
  const hit = (home.value.categories || []).find(
    (item: any) => item.id === categoryId,
  );
  return hit?.name || "桌游";
}

function gameTags(game: any) {
  const tags: string[] = [];
  const cat = categoryName(game.categoryId);
  if (cat) tags.push(cat);
  if (game.players) tags.push(String(game.players).replace("人", "") + "人");
  for (const tag of game.tags || []) {
    if (tags.length >= 3) break;
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags.slice(0, 3);
}

async function loadHome() {
  // 先拉首页数据，登录单独进行，避免登录失败导致整页空白
  try {
    const [homeData, gamesData] = await Promise.all([
      request<any>("/app/home"),
      request<any[]>("/app/games"),
    ]);
    if (homeData) home.value = homeData;
    allGames.value = gamesData || [];
    if (!allGames.value.length) {
      uni.showToast({ title: "暂无桌游数据", icon: "none" });
    }
  } catch (error: any) {
    uni.showToast({
      title: error?.message || "首页加载失败",
      icon: "none",
      duration: 3000,
    });
  }
  try {
    await sessionStore.ensureUserSession();
  } catch {
    // ignore
  }
}

function getStatusBarHeight() {
  try {
    const info = uni.getSystemInfoSync();
    // custom 导航：状态栏 + 胶囊区域，避免标题/Banner 被顶栏挡住
    const status = info.statusBarHeight || 20;
    statusBarHeight.value = status + 12;
  } catch {
    statusBarHeight.value = 32;
  }
}

function goGames(categoryId?: string) {
  uni.switchTab({ url: "/pages/games/index" });
  if (categoryId) {
    setTimeout(() => {
      uni.$emit("change-category", categoryId);
    }, 100);
  }
}

function goDetail(id?: string) {
  if (!id) {
    goGames();
    return;
  }
  uni.navigateTo({
    url: `/pages/game-detail/index?id=${id}`,
  });
}

function handleQuickLink(link: (typeof quickLinks)[number]) {
  if (link.id === "hot" || link.id === "new") {
    goGames();
    return;
  }
  const match = (home.value.categories || []).find((item: any) =>
    String(item.name || "").includes(link.keyword),
  );
  goGames(match?.id);
}

function goAdminEntry() {
  if (!home.value.homeConfig?.miniAdminEnabled) {
    uni.showToast({ title: "管理员入口已关闭", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/admin-login/index" });
}

onLoad(async () => {
  getStatusBarHeight();
  await loadHome();
});

onPullDownRefresh(async () => {
  await loadHome();
  uni.stopPullDownRefresh();
});
</script>

<template>
  <view class="home-page">
    <view
      class="page-pad"
      :style="{ paddingTop: statusBarHeight + 'px' }"
      @longpress="goAdminEntry"
    >
      <view class="brand">
        <text class="brand-title">{{ brandTitle }}</text>
        <text class="brand-subtitle">{{ brandSubtitle }}</text>
      </view>

      <swiper
        class="banner"
        autoplay
        circular
        indicator-dots
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#3B82F6"
      >
        <swiper-item v-for="banner in bannerList" :key="banner.id">
          <view class="banner-item" @click="goGames()">
            <image :src="banner.image" class="banner-img" mode="aspectFill" />
            <view class="banner-mask">
              <text class="banner-title">{{ banner.title }}</text>
              <text class="banner-sub">{{ banner.subtitle }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <view class="search" @click="goGames()">
        <text class="search-icon">⌕</text>
        <text class="search-text">搜索桌游 / 聚会主题 / 人数玩法</text>
        <text class="search-action">搜索</text>
      </view>

      <view class="quick">
        <view
          v-for="link in quickLinks"
          :key="link.id"
          class="quick-item"
          @click="handleQuickLink(link)"
        >
          <view v-if="link.id === 'party'" class="ico ico-stack">
            <view class="stack s1"></view>
            <view class="stack s2"></view>
            <view class="stack s3"></view>
          </view>
          <view v-else-if="link.id === 'fresh'" class="ico ico-people">
            <view class="head h1"></view>
            <view class="body b1"></view>
            <view class="head h2"></view>
            <view class="body b2"></view>
          </view>
          <view v-else-if="link.id === 'hot'" class="ico ico-crown">
            <view class="crown"></view>
          </view>
          <view v-else class="ico ico-cal">
            <view class="cal-top"></view>
            <view class="cal-body">
              <view class="cal-check"></view>
            </view>
          </view>
          <text class="quick-label">{{ link.name }}</text>
        </view>
      </view>

      <view class="block">
        <view class="block-head">
          <text class="block-title">热门榜单</text>
          <text class="block-more" @click="goGames()">查看全部 ›</text>
        </view>
        <scroll-view scroll-x class="hot-scroll" show-scrollbar="false">
          <view class="hot-row">
            <view
              v-for="(game, index) in popularGames"
              :key="game.id"
              class="hot-item"
              @click="goDetail(game.id)"
            >
              <view class="hot-cover-box">
                <image
                  :src="game.coverImage"
                  class="hot-cover"
                  mode="aspectFill"
                />
                <view :class="['hot-rank', rankClass(index)]">
                  <text class="hot-rank-num">{{ index + 1 }}</text>
                </view>
              </view>
              <text class="hot-name">{{ game.name }}</text>
              <text class="hot-meta">
                {{ game.players || "多人" }} | {{ categoryName(game.categoryId) }}
              </text>
              <text class="hot-price">¥{{ game.dailyPrice }}/天</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="block">
        <view class="block-head">
          <text class="block-title">新上架推荐</text>
          <text class="block-more" @click="goGames()">查看全部 ›</text>
        </view>

        <view v-if="!newGames.length" class="empty">暂无桌游</view>

        <view
          v-for="game in newGames"
          :key="game.id"
          class="rec-item"
          @click="goDetail(game.id)"
        >
          <image :src="game.coverImage" class="rec-cover" mode="aspectFill" />
          <view class="rec-main">
            <text class="rec-name">{{ game.name }}</text>
            <view class="rec-tags">
              <text v-for="tag in gameTags(game)" :key="tag" class="rec-tag">
                {{ tag }}
              </text>
            </view>
            <text class="rec-desc">
              {{ game.description || "适合聚会开局，轻松上手。" }}
            </text>
          </view>
          <view class="rec-side">
            <text class="rec-price">¥{{ game.dailyPrice }}/天</text>
            <view class="rec-plus">
              <view class="rec-plus-h"></view>
              <view class="rec-plus-v"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
view,
text,
image,
scroll-view {
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, #dbeafe 0%, #eff6ff 28%, #f8fbff 52%, #ffffff 78%);
  padding-bottom: 48rpx;
}

.page-pad {
  padding: 8rpx 32rpx 0;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-bottom: 20rpx;
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

.banner {
  height: 280rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.banner-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28rpx 24rpx 32rpx;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.45) 100%
  );
}

.banner-title {
  display: block;
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
}

.banner-sub {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.92);
  font-size: 22rpx;
}

.search {
  margin-top: 24rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 12rpx;
}

.search-icon {
  color: #9ca3af;
  font-size: 28rpx;
  line-height: 1;
}

.search-text {
  flex: 1;
  min-width: 0;
  color: #9ca3af;
  font-size: 24rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-action {
  color: #3b82f6;
  font-size: 26rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.quick {
  margin-top: 36rpx;
  display: flex;
  justify-content: space-between;
  padding: 0 8rpx;
}

.quick-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
}

.quick-label {
  font-size: 22rpx;
  color: #374151;
}

.ico {
  width: 56rpx;
  height: 56rpx;
  position: relative;
}

.ico-stack .stack {
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  height: 10rpx;
  border: 3rpx solid #111827;
  border-radius: 4rpx;
  background: transparent;
}

.ico-stack .s1 {
  top: 10rpx;
}
.ico-stack .s2 {
  top: 22rpx;
}
.ico-stack .s3 {
  top: 34rpx;
}

.ico-people .head {
  position: absolute;
  width: 14rpx;
  height: 14rpx;
  border: 3rpx solid #111827;
  border-radius: 50%;
  background: transparent;
}
.ico-people .h1 {
  left: 8rpx;
  top: 8rpx;
}
.ico-people .h2 {
  right: 8rpx;
  top: 12rpx;
  width: 12rpx;
  height: 12rpx;
}
.ico-people .body {
  position: absolute;
  border: 3rpx solid #111827;
  border-bottom: 0;
  border-radius: 14rpx 14rpx 0 0;
  background: transparent;
}
.ico-people .b1 {
  left: 4rpx;
  bottom: 6rpx;
  width: 24rpx;
  height: 16rpx;
}
.ico-people .b2 {
  right: 4rpx;
  bottom: 6rpx;
  width: 20rpx;
  height: 14rpx;
}

.ico-crown .crown {
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  top: 14rpx;
  height: 28rpx;
  border: 3rpx solid #111827;
  border-top: 0;
  border-radius: 0 0 8rpx 8rpx;
  background: transparent;
}
.ico-crown .crown::before,
.ico-crown .crown::after {
  content: "";
  position: absolute;
  top: -12rpx;
  width: 10rpx;
  height: 16rpx;
  border: 3rpx solid #111827;
  border-bottom: 0;
  border-radius: 8rpx 8rpx 0 0;
}
.ico-crown .crown::before {
  left: 4rpx;
}
.ico-crown .crown::after {
  right: 4rpx;
}

.ico-cal .cal-top {
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  top: 10rpx;
  height: 10rpx;
  background: #111827;
  border-radius: 4rpx 4rpx 0 0;
}
.ico-cal .cal-body {
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  top: 20rpx;
  bottom: 8rpx;
  border: 3rpx solid #111827;
  border-top: 0;
  border-radius: 0 0 6rpx 6rpx;
}
.ico-cal .cal-check {
  position: absolute;
  left: 10rpx;
  top: 8rpx;
  width: 12rpx;
  height: 8rpx;
  border-left: 3rpx solid #111827;
  border-bottom: 3rpx solid #111827;
  transform: rotate(-45deg);
}

.block {
  margin-top: 40rpx;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.block-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
}

.block-more {
  font-size: 24rpx;
  color: #9ca3af;
}

.hot-scroll {
  white-space: nowrap;
}

.hot-row {
  display: inline-flex;
  gap: 20rpx;
}

.hot-item {
  width: 168rpx;
}

.hot-cover-box {
  position: relative;
  width: 168rpx;
  height: 168rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f3f4f6;
}

.hot-cover {
  width: 100%;
  height: 100%;
}

.hot-rank {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 40rpx;
  height: 36rpx;
  padding: 0 10rpx;
  border-radius: 0 0 12rpx 0;
  background: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hot-rank.gold {
  background: #f59e0b;
}
.hot-rank.silver {
  background: #94a3b8;
}
.hot-rank.bronze {
  background: #d97706;
}

.hot-rank-num {
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.hot-name {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-meta {
  display: block;
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-price {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #3b82f6;
}

.rec-item {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 20rpx 0;
}

.rec-item + .rec-item {
  border-top: 1rpx solid #f3f4f6;
}

.rec-cover {
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  flex-shrink: 0;
}

.rec-main {
  flex: 1;
  min-width: 0;
  padding-top: 2rpx;
}

.rec-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
}

.rec-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 20rpx;
}

.rec-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rec-side {
  flex-shrink: 0;
  width: 140rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  padding-top: 4rpx;
  align-self: center;
}

.rec-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #3b82f6;
  white-space: nowrap;
}

.rec-plus {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 3rpx solid #3b82f6;
  background: transparent;
  position: relative;
  flex-shrink: 0;
}

.rec-plus-h,
.rec-plus-v {
  position: absolute;
  left: 50%;
  top: 50%;
  background: #3b82f6;
  border-radius: 2rpx;
  transform: translate(-50%, -50%);
}

.rec-plus-h {
  width: 18rpx;
  height: 3rpx;
}

.rec-plus-v {
  width: 3rpx;
  height: 18rpx;
}

.empty {
  padding: 60rpx 0;
  text-align: center;
  color: #9ca3af;
  font-size: 26rpx;
}
</style>
